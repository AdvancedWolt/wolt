#include "HelpCommand.hpp"

HelpCommand::HelpCommand(const std::vector<std::shared_ptr<ICommand>>& allCommands) 
    : commands(allCommands) {}

void HelpCommand::execute(std::ostream& out) {
    for (const auto& cmd : commands) {
        out << cmd->getSyntax() << std::endl;
    }
}

std::string HelpCommand::getSyntax() const {
    return "help";
}



