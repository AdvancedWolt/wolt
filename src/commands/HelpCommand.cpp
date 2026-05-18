#include "commands/HelpCommand.hpp"
#include "core/CommandManager.hpp"

#include <algorithm>

HelpCommand::HelpCommand(const CommandManager& manager)
    : m_manager(manager)
{}

std::string HelpCommand::getSyntax() const 
{
    return "help\n";
}

models::Response HelpCommand::execute(const models::ParsedCommand& cmd, IdbManager& db)
{
    (void)cmd;
    (void)db;

    auto pairs = m_manager.getNamedSyntaxes();

    std::sort(pairs.begin(), pairs.end(),
        [](const auto& a, const auto& b) { return a.first < b.first; });

    std::string out;
    for (const auto& [name, syntax] : pairs) {
        if (name == "help") {
            continue;
        }
        out += syntax;
    }

    out += getSyntax();

    return models::Response::bodyOnly(out);
}