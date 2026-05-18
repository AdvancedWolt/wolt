#pragma once

#include "models/Protocol.hpp"
#include "models/Response.hpp"

#include <memory>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

class ICommand;
class IdbManager;

/**
 * Owns the registered commands and dispatches incoming ParsedCommands to them.
 * Unknown command names result in a 400 Bad Request response per the spec.
 */
class CommandManager {
public:
    // Register a command instance under a name. Takes ownership of cmd.
    // No-op if cmd is null.
    void registerCommand(const std::string& name, std::unique_ptr<ICommand> cmd);

    // Look up pc.name in the registry and forward to that command's execute.
    // Returns 400 Bad Request if the name isn't registered.
    models::Response execute(const models::ParsedCommand& pc, IdbManager& db);

    // Returns (name, syntax) pairs for every registered command.
    // Used by HelpCommand to format the help output (alphabetical, help last).
    std::vector<std::pair<std::string, std::string>> getNamedSyntaxes() const;

private:
    std::unordered_map<std::string, std::unique_ptr<ICommand>> m_registry;
};
