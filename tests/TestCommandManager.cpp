#include <gtest/gtest.h>
#include <algorithm>
#include <memory>
#include "core/CommandManager.hpp"
#include "fakes/FakeCommand.hpp"
#include "db/IdbManager.hpp"

using models::Status;

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

}

TEST(CommandManagerTest, DispatchesToRegisteredCommand)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());

    StubDatabase db;
    auto result = manager.execute({"fake", {}}, db);

    EXPECT_EQ(result.status(), Status::ok);
    EXPECT_EQ(result.body(), "Fake command executed successfully.\n");
}

TEST(CommandManagerTest, UnknownCommandReturns400)
{
    CommandManager manager;
    StubDatabase db;

    auto result = manager.execute({"nonexistent", {}}, db);

    EXPECT_EQ(result.status(), Status::badRequest);
    EXPECT_EQ(result.toWire(), "400 Bad Request\n");
}

TEST(CommandManagerTest, EmptyNameReturns400)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());
    StubDatabase db;

    auto result = manager.execute({"", {}}, db);

    EXPECT_EQ(result.status(), Status::badRequest);
    EXPECT_EQ(result.toWire(), "400 Bad Request\n");
}

TEST(CommandManagerTest, CommandLookupIsExactMatch)
{
    CommandManager manager;
    manager.registerCommand("post", std::make_unique<FakeCommand>());
    StubDatabase db;

    EXPECT_EQ(manager.execute({"post", {}}, db).status(), Status::ok);
    EXPECT_EQ(manager.execute({"POST", {}}, db).status(), Status::badRequest);  // manager doesn't normalize; parser does
}

TEST(CommandManagerTest, RegisterReplacesExistingCommand)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());
    manager.registerCommand("fake", std::make_unique<FakeCommand>());

    StubDatabase db;
    auto result = manager.execute({"fake", {}}, db);

    EXPECT_EQ(result.status(), Status::ok);
}

TEST(CommandManagerTest, RegisterNullDoesNotCrash)
{
    CommandManager manager;
    manager.registerCommand("null", nullptr);

    StubDatabase db;
    auto result = manager.execute({"null", {}}, db);

    EXPECT_EQ(result.toWire(), "400 Bad Request\n");
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

    EXPECT_EQ(result.status(), Status::ok);
}
