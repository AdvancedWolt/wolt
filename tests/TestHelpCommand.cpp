#include <gtest/gtest.h>
#include <memory>
#include "commands/HelpCommand.hpp"
#include "fakes/FakeCommand.hpp"
#include "core/CommandManager.hpp"
#include "db/Idatabase.hpp"

namespace {
    // Minimal stub — HelpCommand doesn't touch the database, but execute()
    // requires an Idatabase&.
    class StubDatabase : public Idatabase {
    public:
        bool initialize() override { return true; }
        bool load() override { return true; }
        std::vector<Product> getProductsForUser(const User&) const override { return {}; }
        std::vector<User> getAllUsers() const override { return {}; }
        bool addProducts(const User&, const std::vector<Product>&) override { return true; }
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