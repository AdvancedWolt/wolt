#pragma once

#include "ICommand.hpp"

class PostCommand : public ICommand {
public:
    PostCommand() = default;

    models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) override;
    std::string getSyntax() const override;
};
