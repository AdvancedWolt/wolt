#include "CommandManager.hpp"
#include "commands/ICommand.hpp"
#include "db/Idatabase.hpp"

CommandManager::CommandManager() {}

void CommandManager::registerCommand(const std::string& name, std::shared_ptr<ICommand> cmd) {
    m_registry[name] = std::move(cmd);
}

CommandResult CommandManager::execute(const ParsedCommand& pc, Idatabase& db) {
}

bool CommandManager::hasCommand(const std::string& name) const {
}

std::vector<std::string> CommandManager::getCommandNames() const {
}

std::vector<std::string> CommandManager::getAllSyntaxes() const {
    std::vector<std::string> syntaxes;
    
    // Loop through the map. pair.second is the unique_ptr to the command.
    for (const auto& pair : m_registry) {
        syntaxes.push_back(pair.second->getSyntax());
    }
    
    return syntaxes;
}