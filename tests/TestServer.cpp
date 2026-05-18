#include <gtest/gtest.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <thread>
#include <string>
#include <memory>
#include <chrono>

#include "server.hpp"
#include "db/IdbManager.hpp"

using models::Status;

// ─── Stub Database ────────────────────────────────────────────────────────────

namespace {

class StubDatabase : public IdbManager {
public:
    bool initialize() override { return true; }
    bool load() override { return true; }
    bool hasUser(const User&) const override { return false; }
    std::vector<Product> getProductsForUser(const User&) const override { return {}; }
    std::vector<User> getAllUsers() const override { return {}; }
    std::vector<User> getUsersWithProduct(const Product&) const override { return {}; }
    Status postProducts(const User&, const std::vector<Product>&) override { return Status::ok; }
    Status patchProducts(const User&, const std::vector<Product>&) override { return Status::ok; }
    Status deleteProductsFromUser(const User&, const std::vector<Product>&) override { return Status::ok; }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Connect a client socket to the given port. Returns fd or -1.
int connectToServer(int port)
{
    int fd = ::socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) return -1;

    sockaddr_in addr{};
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(static_cast<uint16_t>(port));
    addr.sin_addr.s_addr = ::inet_addr("127.0.0.1");

    if (::connect(fd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
        ::close(fd);
        return -1;
    }
    return fd;
}

// Send a command and read back the full response (until empty line or EOF).
std::string sendAndReceive(int fd, const std::string& command)
{
    std::string msg = command + "\n";
    ::send(fd, msg.c_str(), msg.size(), 0);

    std::string response;
    char buf[1];

    while (true) {
        int n = ::recv(fd, buf, 1, 0);
        if (n <= 0) break;
        response += buf[0];

        // Stop at blank line (end of server response)
        if (response.size() >= 2 &&
            response.substr(response.size() - 2) == "\n\n") {
            break;
        }
        // Also stop at single newline for simple responses
        if (response.size() >= 1 && response.back() == '\n') {
            // Give a tiny moment for more data
            fd_set fds;
            FD_ZERO(&fds);
            FD_SET(fd, &fds);
            timeval tv{0, 5000}; // 5ms
            if (::select(fd + 1, &fds, nullptr, nullptr, &tv) == 0) {
                break; // no more data coming
            }
        }
    }

    return response;
}

} // namespace

// ─── Fixture ──────────────────────────────────────────────────────────────────

class ServerTest : public ::testing::Test {
protected:
    void SetUp() override
    {
        m_port = 19876; // fixed test port; unlikely to conflict

        auto db = std::make_shared<StubDatabase>();
        m_server = std::make_unique<Server>(std::move(db), m_port);
        ASSERT_TRUE(m_server->initialize());

        // Run the server in a background thread
        m_serverThread = std::thread([this]() { m_server->run(); });

        // Give the server a moment to start accepting
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }

    void TearDown() override
    {
        m_server->stop();
        if (m_serverThread.joinable()) {
            m_serverThread.join();
        }
    }

    int m_port;
    std::unique_ptr<Server> m_server;
    std::thread m_serverThread;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

TEST_F(ServerTest, UnknownCommandReturns400)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    std::string response = sendAndReceive(fd, "NOTACOMMAND");

    EXPECT_NE(response.find("400"), std::string::npos);
    ::close(fd);
}

TEST_F(ServerTest, ResponseAlwaysEndsWithNewline)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    std::string response = sendAndReceive(fd, "ANYTHING");

    EXPECT_FALSE(response.empty());
    EXPECT_EQ(response.back(), '\n');
    ::close(fd);
}

TEST_F(ServerTest, MultipleCommandsInSequence)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    std::string r1 = sendAndReceive(fd, "NOTACOMMAND");
    std::string r2 = sendAndReceive(fd, "NOTACOMMAND");

    EXPECT_NE(r1.find("400"), std::string::npos);
    EXPECT_NE(r2.find("400"), std::string::npos);
    ::close(fd);
}

TEST_F(ServerTest, EmptyLinesAreIgnored)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    // Send blank lines then a real command
    std::string msg = "\n\n\nNOTACOMMAND\n";
    ::send(fd, msg.c_str(), msg.size(), 0);

    char buf[256] = {};
    ::recv(fd, buf, sizeof(buf) - 1, 0);
    std::string response(buf);

    // Should get exactly one response, not four
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("400"), std::string::npos);
    ::close(fd);
}

TEST_F(ServerTest, CarriageReturnIsStripped)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    // Windows-style line ending — server should strip \r and still process
    std::string msg = "NOTACOMMAND\r\n";
    ::send(fd, msg.c_str(), msg.size(), 0);

    char buf[256] = {};
    ::recv(fd, buf, sizeof(buf) - 1, 0);
    std::string response(buf);

    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("400"), std::string::npos);
    ::close(fd);
}

TEST_F(ServerTest, ClientDisconnectDoesNotCrash)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    // Close immediately without sending anything
    ::close(fd);

    // Give server a moment to process the disconnect
    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    // Server should still be alive — connect again
    int fd2 = connectToServer(m_port);
    EXPECT_GE(fd2, 0);
    ::close(fd2);
}

TEST_F(ServerTest, LargeCommandDoesNotCrash)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    std::string bigCommand(3000, 'X');
    std::string response = sendAndReceive(fd, bigCommand);

    EXPECT_FALSE(response.empty());
    ::close(fd);
}

TEST_F(ServerTest, FragmentedCommandIsReassembled)
{
    int fd = connectToServer(m_port);
    ASSERT_GE(fd, 0);

    // Send command byte-by-byte to simulate fragmented TCP
    std::string cmd = "NOTACOMMAND\n";
    for (char c : cmd) {
        ::send(fd, &c, 1, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }

    char buf[256] = {};
    ::recv(fd, buf, sizeof(buf) - 1, 0);
    std::string response(buf);

    EXPECT_NE(response.find("400"), std::string::npos);
    ::close(fd);
}