#pragma once

#include "models/Protocol.hpp"
#include <unordered_map>
#include <memory>
#include <string>
#include <vector>

class ICommand;
class Idatabase;

class CommandManager {
private:
    std::unordered_map<std::string, std::unique_ptr<ICommand>> m_registry;

public:
    void registerCommand(const std::string& name, std::unique_ptr<ICommand> cmd);

    CommandResult execute(const ParsedCommand& pc, Idatabase& db);

    bool hasCommand(const std::string& name) const;

    std::vector<std::string> getCommandNames() const;

    std::vector<std::string> getAllSyntaxes() const;
};