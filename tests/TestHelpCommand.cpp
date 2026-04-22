#include <gtest/gtest.h>
#include <sstream>
#include <vector>
#include <string>
#include <memory>
#include "../src/commands/ICommand.hpp"
#include "../src/commands/HelpCommand.hpp"
#include "../src/commands/FakeCommand.hpp"

TEST(HelpCommandTest, PrintsAllRegisteredCommands) {
    std::vector<std::shared_ptr<ICommand>> fakeCommands;
    
    // Create a fake command and test on it
    fakeCommands.push_back(std::make_shared<FakeCommand>());
    HelpCommand helpCmd(fakeCommands);
    std::stringstream buffer;
    helpCmd.execute(buffer);
    std::string result = buffer.str();
    // Expect the find result to NOT equal npos
    EXPECT_NE(result.find("fake"), std::string::npos);
}

TEST(HelpCommandTest, EmptyVecDoesNotCrash) {
    std::vector<std::shared_ptr<ICommand>> emptyVec;
    HelpCommand helpCmd(emptyVec);
    std::stringstream buffer;

    // This should run without crashing and leave the buffer empty
    helpCmd.execute(buffer);
    EXPECT_EQ(buffer.str(), "");
    EXPECT_NO_THROW(buffer.str());
}

TEST(HelpCommandTest, CorrectSyntaxName) {
    std::vector<std::shared_ptr<ICommand>> dummy;
    HelpCommand help(dummy);
    EXPECT_EQ(help.getSyntax(), "help");
}
