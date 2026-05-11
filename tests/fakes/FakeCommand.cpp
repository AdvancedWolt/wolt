#include "commands/FakeCommand.hpp"

std::string FakeCommand::getSyntax() const 
{
    std::ostringstream oss;
    oss << "fake" << std::endl;
    return oss.str();
}

models::CommandResult FakeCommand::execute(const models::ParsedCommand& cmd, Idatabase& db) 
{
    (void)cmd;
    (void)db;
    
    std::ostringstream oss;
    
    oss << "Fake command executed successfully." << std::endl;
    
    return {true, oss.str()};
}