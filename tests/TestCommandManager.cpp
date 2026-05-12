#include <gtest/gtest.h>
#include <algorithm>
#include <memory>
#include "core/CommandManager.hpp"
#include "fakes/FakeCommand.hpp"
#include "db/Idatabase.hpp"

namespace {

class StubDatabase : public Idatabase {
public:
    bool initialize() override { return true; }
    bool load() override { return true; }
    bool hasUser(const User&) const override { return false; }
    std::vector<Product> getProductsForUser(const User&) const override { return {}; }
    std::vector<User> getAllUsers() const override { return {}; }
    bool addProducts(const User&, const std::vector<Product>&) override { return true; }
};

}

TEST(CommandManagerTest, DispatchesToRegisteredCommand)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());

    StubDatabase db;
    auto result = manager.execute({"fake", {}}, db);

    EXPECT_TRUE(result.success);
    EXPECT_EQ(result.message, "Fake command executed successfully.\n");
}

TEST(CommandManagerTest, UnknownCommandReturns400)
{
    CommandManager manager;
    StubDatabase db;

    auto result = manager.execute({"nonexistent", {}}, db);

    EXPECT_FALSE(result.success);
    EXPECT_EQ(result.message, "400 Bad Request\n");
}

TEST(CommandManagerTest, EmptyNameReturns400)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());
    StubDatabase db;

    auto result = manager.execute({"", {}}, db);

    EXPECT_FALSE(result.success);
    EXPECT_EQ(result.message, "400 Bad Request\n");
}

TEST(CommandManagerTest, CommandLookupIsExactMatch)
{
    CommandManager manager;
    manager.registerCommand("post", std::make_unique<FakeCommand>());
    StubDatabase db;

    EXPECT_EQ(manager.execute({"post", {}}, db).message,
              "Fake command executed successfully.\n");
    EXPECT_EQ(manager.execute({"POST", {}}, db).message,
              "400 Bad Request\n");   // manager doesn't normalize; parser does
}

TEST(CommandManagerTest, RegisterReplacesExistingCommand)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());
    manager.registerCommand("fake", std::make_unique<FakeCommand>());

    StubDatabase db;
    auto result = manager.execute({"fake", {}}, db);

    EXPECT_TRUE(result.success);
}

TEST(CommandManagerTest, RegisterNullDoesNotCrash)
{
    CommandManager manager;
    manager.registerCommand("null", nullptr);

    StubDatabase db;
    auto result = manager.execute({"null", {}}, db);

    EXPECT_EQ(result.message, "400 Bad Request\n");
}

TEST(CommandManagerTest, GetNamedSyntaxesReturnsAllRegistered)
{
    CommandManager manager;
    manager.registerCommand("fake1", std::make_unique<FakeCommand>());
    manager.registerCommand("fake2", std::make_unique<FakeCommand>());

    auto pairs = manager.getNamedSyntaxes();
    ASSERT_EQ(pairs.size(), 2u);

    std::sort(pairs.begin(), pairs.end());
    EXPECT_EQ(pairs[0].first, "fake1");
    EXPECT_EQ(pairs[1].first, "fake2");
}

TEST(CommandManagerTest, GetNamedSyntaxesEmptyWhenNothingRegistered)
{
    CommandManager manager;
    EXPECT_TRUE(manager.getNamedSyntaxes().empty());
}

TEST(CommandManagerTest, ArgsArePassedThroughToCommand)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());

    StubDatabase db;
    auto result = manager.execute({"fake", {"arg1", "arg2", "arg3"}}, db);

    EXPECT_TRUE(result.success);
}