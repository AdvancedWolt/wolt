#include <gtest/gtest.h>
#include <memory>
#include "commands/HelpCommand.hpp"
#include "fakes/FakeCommand.hpp"
#include "core/CommandManager.hpp"
#include "db/IdbManager.hpp"

namespace {
    // Minimal stub — HelpCommand doesn't touch the database, but execute()
    // requires an IdbManager&.
    class StubDatabase : public IdbManager {
    public:
        bool initialize() override { return true; }
        bool load() override { return true; }
        std::vector<Product> getProductsForUser(const User&) const override { return {}; }
        std::vector<User> getAllUsers() const override { return {}; }
        std::vector<User> getUsersWithProduct(const Product&) const override { return {}; }
        std::vector<User> getUsersWithProducts(const std::vector<Product>&) const override { return {}; }
        Status addProducts(const User&, const std::vector<Product>&) override { return Status::ok; }
        Status patchProducts(const User&, const std::vector<Product>&) override { return Status::ok; }
        Status deleteProductsFromUser(const User&, const std::vector<Product>&) override { return Status::ok; }
        bool hasUser(const User&) const override { return false; }
    };
}

TEST(HelpCommandTest, PrintsAllRegisteredCommands)
{
    CommandManager manager;
    manager.registerCommand("fake", std::make_unique<FakeCommand>());

    HelpCommand helpCmd(manager);
    StubDatabase db;
    models::ParsedCommand cmd{"help", {}};

    auto result = helpCmd.execute(cmd, db);

    EXPECT_NE(result.message.find("fake"), std::string::npos);
}

TEST(HelpCommandTest, EmptyManagerDoesNotCrash)
{
    CommandManager manager;
    HelpCommand helpCmd(manager);
    StubDatabase db;
    models::ParsedCommand cmd{"help", {}};

    // Should run without crashing; output is just help's own syntax.
    EXPECT_NO_THROW(helpCmd.execute(cmd, db));
}

TEST(HelpCommandTest, CorrectSyntaxName)
{
    CommandManager manager;
    HelpCommand help(manager);

    EXPECT_EQ(help.getSyntax(), "help\n");
}