#include <gtest/gtest.h>
#include <algorithm>
#include <vector>
#include "commands/PostCommand.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

namespace {

// Create a fake DB, we're testing POST, not the DB.
class FakeDatabase : public IdbManager {
public:
    bool initialize() override { return true; }
    bool load() override { return true; }

    bool hasUser(const User& user) const override {
        return m_users.find(user.getId()) != m_users.end();
    }

    std::vector<User> getAllUsers() const override {
        std::vector<User> out;
        for (const auto& [id, _] : m_users) out.emplace_back(id);
        return out;
    }

    std::vector<Product> getProductsForUser(const User& user) const override {
        auto it = m_users.find(user.getId());
        if (it == m_users.end()) return {};
        return it->second;
    }

    Status addProducts(const User& user, const std::vector<Product>& products) override {
        if (m_failOnAdd) return Status::noContent;
        for (const auto& p : products) {
            m_users[user.getId()].push_back(p);
        }
        return Status::ok;
    }

    Status patchProducts(const User&, const std::vector<Product>&) override { return Status::ok; }
    Status deleteProductsFromUser(const User&, const std::vector<Product>&) override { return Status::ok; }
    std::vector<User> getUsersWithProduct(const Product&) const override { return {}; }
    std::vector<User> getUsersWithProducts(const std::vector<Product>&) const override { return {}; }

    void failNextAdd() { m_failOnAdd = true; }

private:
    std::unordered_map<std::string, std::vector<Product>> m_users;
    bool m_failOnAdd = false;
};

models::ParsedCommand makeCmd(const std::vector<std::string>& tokens)
{
    if (tokens.empty()) return {};
    return {tokens[0], {tokens.begin() + 1, tokens.end()}};
}

}

TEST(PostCommandTest, CreatesNewUserWithProducts)
{
    PostCommand cmd;
    FakeDatabase db;

    auto result = cmd.execute(makeCmd({"post", "alice", "pizza", "sushi"}), db);

    EXPECT_TRUE(result.success);
    EXPECT_EQ(result.message, "201 Created\n");
    EXPECT_TRUE(db.hasUser(User("alice")));
    EXPECT_EQ(db.getProductsForUser(User("alice")).size(), 2u);
}

TEST(PostCommandTest, ReturnsBadRequestWhenNoArgs)
{
    PostCommand cmd;
    FakeDatabase db;

    auto result = cmd.execute(makeCmd({"post"}), db);

    EXPECT_FALSE(result.success);
    EXPECT_EQ(result.message, "400 Bad Request\n");
}

TEST(PostCommandTest, ReturnsBadRequestWhenOnlyUserId)
{
    PostCommand cmd;
    FakeDatabase db;

    auto result = cmd.execute(makeCmd({"post", "alice"}), db);

    EXPECT_FALSE(result.success);
    EXPECT_EQ(result.message, "400 Bad Request\n");
    EXPECT_FALSE(db.hasUser(User("alice")));
}

TEST(PostCommandTest, ReturnsNotFoundWhenUserAlreadyExists)
{
    PostCommand cmd;
    FakeDatabase db;
    cmd.execute(makeCmd({"post", "alice", "pizza"}), db);

    auto result = cmd.execute(makeCmd({"post", "alice", "sushi"}), db);

    EXPECT_FALSE(result.success);
    EXPECT_EQ(result.message, "404 Not Found\n");
    EXPECT_EQ(db.getProductsForUser(User("alice")).size(), 1u);
}

TEST(PostCommandTest, ManyProductsSucceed)
{
    PostCommand cmd;
    FakeDatabase db;

    auto result = cmd.execute(
        makeCmd({"post", "charlie", "a", "b", "c", "d", "e", "f", "g"}), db);

    EXPECT_TRUE(result.success);
    EXPECT_EQ(db.getProductsForUser(User("charlie")).size(), 7u);
}

TEST(PostCommandTest, DifferentUsersAreIndependent)
{
    PostCommand cmd;
    FakeDatabase db;

    cmd.execute(makeCmd({"post", "alice", "pizza"}), db);
    auto result = cmd.execute(makeCmd({"post", "bob", "burger"}), db);

    EXPECT_TRUE(result.success);
    EXPECT_EQ(result.message, "201 Created\n");
    EXPECT_TRUE(db.hasUser(User("alice")));
    EXPECT_TRUE(db.hasUser(User("bob")));
}

TEST(PostCommandTest, SyntaxMatchesSpec)
{
    PostCommand cmd;
    EXPECT_EQ(cmd.getSyntax(),
              "POST, arguments: [userid] [productid1] [productid2] ...\n");
}

TEST(PostCommandTest, ReturnsBadRequestWhenDbAddFails)
{
    PostCommand cmd;
    FakeDatabase db;
    db.failNextAdd();

    auto result = cmd.execute(makeCmd({"post", "alice", "pizza"}), db);

    EXPECT_FALSE(result.success);
    EXPECT_EQ(result.message, "400 Bad Request\n");
}