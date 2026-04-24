#include "SyntaxCommand.hpp"
#include <utility>

SyntaxCommand::SyntaxCommand(std::string syntax)
    : m_syntax(std::move(syntax))
{}

void SyntaxCommand::execute(std::ostream& out)
{
    (void)out;
}

std::string SyntaxCommand::getSyntax() const
{
    return m_syntax;
}
