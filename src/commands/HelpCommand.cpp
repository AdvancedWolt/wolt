#include "HelpCommand.hpp"

const std::string HelpCommand::s_syntax = "help";

HelpCommand::HelpCommand(const std::vector<std::shared_ptr<ICommand>>& commands)
    : m_commands(commands)
{}

void HelpCommand::execute(std::ostream& out)
{
    for (const std::shared_ptr<ICommand>& command : m_commands) {
        out << command->getSyntax() << std::endl;
    }
}
