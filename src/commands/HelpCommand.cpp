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

    // Pairs of (name, syntax) for every registered command.
    auto pairs = m_manager.getNamedSyntaxes();

    // Sort alphabetically by name.
    std::sort(pairs.begin(), pairs.end(),
        [](const auto& a, const auto& b) { return a.first < b.first; });

    std::string out;
    for (const auto& [name, syntax] : pairs) {
        if (name == "help") {
            continue;          // help goes last, not in the middle
        }
        out += syntax;
    }
    out += getSyntax();        // append help's syntax at the end

    return models::Response::ok(out);
}



