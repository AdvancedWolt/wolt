#pragma once

#include "commands/ICommand.hpp"
#include <string>

class CommandManager;  // forward decl

class HelpCommand : public ICommand {
private:
    const CommandManager& m_manager;

public:
    explicit HelpCommand(const CommandManager& manager);

    std::string getSyntax() const override;
    models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) override;
};