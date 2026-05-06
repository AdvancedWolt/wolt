#include "FakeCommand.hpp"

const std::string FakeCommand::s_syntax = "fake";

void FakeCommand::execute(std::ostream& out)
{
    (void)out;
}
