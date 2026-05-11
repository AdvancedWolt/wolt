#pragma once

#include "ICommand.hpp"

class FakeCommand : public ICommand {
public:

    FakeCommand() = default;

    std::string getSyntax() const override;
    CommandResult execute(const std::vector<std::string>& args, Idatabase& db) override;
};