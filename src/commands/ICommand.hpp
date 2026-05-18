#pragma once

#include "models/Response.hpp"
#include "models/Protocol.hpp"
#include <string>

// Forward declaration
class IdbManager;

class ICommand {
public:
    virtual ~ICommand() = default;

    virtual models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) = 0;

    virtual std::string getSyntax() const = 0;
};
