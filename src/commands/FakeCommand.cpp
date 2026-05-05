#include "FakeCommand.hpp"

void FakeCommand::execute(std::ostream& out)
{
    (void)out;
}

std::string FakeCommand::getSyntax() const
{
    return "fake";
}
