#include "Server.hpp"

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>

Server::Server(std::shared_ptr<IdbManager> database, int port)
    : m_app(std::move(database)), m_port(port)
{}

Server::~Server() { stop(); }

bool Server::initialize()
{
    if (!m_app.initialize()) {
        std::cerr << "App initialization failed\n";
        return false;
    }

    m_serverFd = ::socket(AF_INET, SOCK_STREAM, 0);
    if (m_serverFd < 0) {
        std::cerr << "socket() failed\n";
        return false;
    }

    int opt = 1;
    ::setsockopt(m_serverFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in addr{};
    addr.sin_family      = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port        = htons(static_cast<uint16_t>(m_port));

    if (::bind(m_serverFd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
        std::cerr << "bind() failed\n";
        return false;
    }

    if (::listen(m_serverFd, 1) < 0) {   // backlog=1: one client at a time
        std::cerr << "listen() failed\n";
        return false;
    }

    m_running = true;
    std::cout << "Server listening on port " << m_port << "\n";
    return true;
}

void Server::run()  { acceptLoop(); }
void Server::stop() {
    m_running = false;
    if (m_serverFd >= 0) { ::close(m_serverFd); m_serverFd = -1; }
}

void Server::acceptLoop()
{
    while (m_running) {
        int clientFd = ::accept(m_serverFd, nullptr, nullptr);
        if (clientFd < 0) break;

        std::cout << "Client connected\n";
        handleClient(clientFd);           // blocks until client disconnects
        ::close(clientFd);
        std::cout << "Client disconnected\n";
        // loop back, ready for the next client
    }
}

void Server::handleClient(int clientFd)
{
    FILE* stream = ::fdopen(clientFd, "r+");
    if (!stream) return;

    char*  rawLine = nullptr;
    size_t cap     = 0;

    while (::getline(&rawLine, &cap, stream) != -1) {
        std::string line(rawLine);
        // strip \r\n
        while (!line.empty() && (line.back() == '\n' || line.back() == '\r'))
            line.pop_back();

        if (line.empty()) continue;

        std::string response = m_app.handleLine(line);

        // guarantee response ends with exactly one \n (framing contract)
        if (response.empty() || response.back() != '\n')
            response += '\n';

        ::fputs(response.c_str(), stream);
        ::fflush(stream);
    }

    ::free(rawLine);
    ::fclose(stream);   // also closes clientFd
}