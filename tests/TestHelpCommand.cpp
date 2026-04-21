#include <gtest/gtest.h>
#include <sstream>
#include <vector>
#include <string>
#include "../src/commands/ICommand.hpp"
#include "../src/commands/HelpCommand.hpp"

TEST(HelpCommandTest, PrintsAllRegisteredCommands) {
    std::vector<ICommand*> fakeCommands;
 
    fakeCommands.push_back(new HelpCommand(fakeCommands)); 
    // Should add more commands here whilst building

    HelpCommand helpCmd(fakeCommands); 
    std::stringstream buffer;

    helpCmd.execute(buffer);

    std::string result = buffer.str(); 
    // Expect the find result to NOT equal npos
    EXPECT_NE(result.find("help"), std::string::npos);
    
    delete fakeCommands[0];
}

TEST(HelpCommandTest, EmptyMapDoesNotCrash) {
    std::vector<ICommand*> emptyVec;
    HelpCommand helpCmd(emptyVec);
    std::stringstream buffer;
    
    // This should run without crashing and leave the buffer empty
    helpCmd.execute(buffer);
    EXPECT_EQ(buffer.str(), ""); 
}

TEST(HelpCommandTest, CorrectSyntaxName) {
    std::vector<ICommand*> dummy;
    HelpCommand help(dummy);
    EXPECT_EQ(help.getSyntax(), "help");
}
