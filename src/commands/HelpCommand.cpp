#include "HelpCommand.hpp"

HelpCommand::HelpCommand(const std::vector<ICommand*>& allCommands) 
    : commands(allCommands) {}

void HelpCommand::execute(std::ostream& out) {
    for (ICommand* cmd : commands) {
        out << cmd->getSyntax() << std::endl;
    }
}

std::string HelpCommand::getSyntax() const {
    return "help";
}
