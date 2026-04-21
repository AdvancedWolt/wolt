#include <gtest/gtest.h>
#include <sstream>
#include <map>
#include <string>
#include "../src/commands/ICommand.hpp"
#include "../src/commands/HelpCommand.hpp"

TEST(HelpCommandTest, PrintsAllRegisteredCommands) {
    std::map<int, ICommand*> fakeCommands;
    
    fakeCommands[1] = new HelpCommand(fakeCommands); 
    // Should add more commands here whilst building

    HelpCommand helpCmd(fakeCommands); 
    std::stringstream buffer;

    helpCmd.execute(buffer);

    std::string result = buffer.str();
    // Add 
    EXPECT_NE(result.find("help"), std::string::npos);
    
    delete fakeCommands[1];
}

TEST(HelpCommandTest, EmptyMapDoesNotCrash) {
    std::map<int, ICommand*> emptyMap;
    HelpCommand helpCmd(emptyMap);
    std::stringstream buffer;
    
    // This should run without crashing and leave the buffer empty
    helpCmd.execute(buffer);
    EXPECT_EQ(buffer.str(), ""); 
}

TEST(HelpCommandTest, CorrectSyntaxName) {
    std::map<int, ICommand*> dummy;
    HelpCommand help(dummy);
    EXPECT_EQ(help.getSyntax(), "help");
}
