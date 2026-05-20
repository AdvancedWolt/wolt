#pragma once

#include "ICommand.hpp"

class PatchCommand : public ICommand {
public:
    PatchCommand() = default;

    models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) override;
    std::string getSyntax() const override;
};