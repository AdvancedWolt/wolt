#include "core/CommandManager.hpp"
#include "commands/ICommand.hpp"
#include "db/IdbManager.hpp"

void CommandManager::registerCommand(const std::string& name, std::unique_ptr<ICommand> cmd)
{
    if (cmd) {
        m_registry[name] = std::move(cmd);
    }
}

models::Response CommandManager::execute(const models::ParsedCommand& pc, IdbManager& db)
{
    auto it = m_registry.find(pc.name);
    if (it == m_registry.end()) {
        return models::Response::badRequest();
    }
    return it->second->execute(pc, db);
}

std::vector<std::pair<std::string, std::string>> CommandManager::getNamedSyntaxes() const
{
    std::vector<std::pair<std::string, std::string>> out;
    out.reserve(m_registry.size());
    for (const auto& [name, cmd] : m_registry) {
        out.emplace_back(name, cmd->getSyntax());
    }
    return out;
}
