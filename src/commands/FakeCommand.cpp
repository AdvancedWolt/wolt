#include "FakeCommand.hpp"
#include <sstream>

std::string FakeCommand::getSyntax() const 
{
    std::ostringstream oss;
    oss << "fake" << std::endl;
    return oss.str();
}

CommandResult FakeCommand::execute(const std::vector<std::string>& args, Idatabase& db) 
{
    (void)args;
    (void)db;
    
    return {true, "Fake command executed successfully."};
}