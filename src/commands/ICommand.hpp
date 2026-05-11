#pragma once

#include "models/Protocol.hpp"
#include <string>
#include <vector>
#include <sstream>

// Forward declaration
class Idatabase;

class ICommand {
public:
    virtual ~ICommand() = default;

    virtual CommandResult execute(const std::vector<std::string>& args, Idatabase& db) = 0;
    
    virtual std::string getSyntax() const = 0;
};