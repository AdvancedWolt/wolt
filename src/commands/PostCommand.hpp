#pragma once

#include "ICommand.hpp"

class PostCommand : public ICommand {
public:
    PostCommand() = default;

    models::CommandResult execute(const models::ParsedCommand& cmd, IdbManager& db) override;
    std::string getSyntax() const override;
};
