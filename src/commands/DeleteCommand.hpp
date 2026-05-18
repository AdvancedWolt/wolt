#pragma once

#include "ICommand.hpp"

class DeleteCommand : public ICommand {
public:
    DeleteCommand() = default;

    models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) override;
    std::string getSyntax() const override;
};
