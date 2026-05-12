#pragma once

#include "commands/ICommand.hpp"

class FakeCommand : public ICommand {
public:
    FakeCommand() = default;

    std::string getSyntax() const override;
    models::CommandResult execute(const models::ParsedCommand& cmd, IdbManager& db) override;
};