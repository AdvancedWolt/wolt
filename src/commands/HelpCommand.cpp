#include "commands/HelpCommand.hpp"

HelpCommand::HelpCommand(const std::vector<std::string>& syntaxes)
    : m_syntaxes(syntaxes) 
{
}

std::string HelpCommand::getSyntax() const 
{
    std::ostringstream oss;
    oss << "help" << std::endl;
    return oss.str();
}

CommandResult HelpCommand::execute(const std::vector<std::string>& args, Idatabase& db) 
{
    (void)args; 
    (void)db;  
    
    std::string message;
    
    // Loop through the strings and append them to the message
    for (const std::string& syntax : m_syntaxes) {
        message +=  syntax;
    }

    return {true, message};
}