#include "CommandManager.hpp"
#include "commands/ICommand.hpp"
#include "db/Idatabase.hpp"

CommandManager::CommandManager() {}

void CommandManager::registerCommand(const std::string& name, std::unique_ptr<ICommand> cmd) {
    if (cmd) {
        m_registry[name] = std::move(cmd);
    }
}

models::CommandResult CommandManager::execute(const models::ParsedCommand& pc, Idatabase& db) {
    auto it = m_registry.find(pc.name);
    
    if (it == m_registry.end()) {
        // If command not found, return a failed result with the error format
        return {false, "400 Bad Request\n"};
    }

    return it->second->execute(pc, db);
}

// Check if the key exists in the map
bool CommandManager::hasCommand(const std::string& name) const {
    return m_registry.find(name) != m_registry.end();
}

// Get all the command names(keys)
std::vector<std::string> CommandManager::getCommandNames() const {
    std::vector<std::string> names;
    for (const auto& pair : m_registry) {
        names.push_back(pair.first); // pair.first is the string key (name)
    }
    return names;
}

// Get all command syntaxes
std::vector<std::string> CommandManager::getAllSyntaxes() const {
    std::vector<std::string> syntaxes;
    
    // Loop through the map and extract the syntax string from each command
    for (const auto& pair : m_registry) {
        syntaxes.push_back(pair.second->getSyntax());
    }
    
    return syntaxes;
}