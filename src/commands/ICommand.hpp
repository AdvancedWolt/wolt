#pragma once

#include "models/Protocol.hpp"
#include <string>
#include <vector>

// Forward declaration
class IdbManager;

class ICommand {
public:
    virtual ~ICommand() = default;

    virtual models::CommandResult execute(const models::ParsedCommand& cmd, IdbManager& db) = 0;

    virtual std::string getSyntax() const = 0;
};