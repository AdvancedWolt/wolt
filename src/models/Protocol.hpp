#pragma once

#include <string>
#include <vector>

namespace models {
    struct CommandResult {
        bool success;
        std::string message;
    };

    struct ParsedCommand {
        std::string name;
        std::vector<std::string> args;
    };

}