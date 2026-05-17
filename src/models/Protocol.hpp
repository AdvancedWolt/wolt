#pragma once

#include <string>
#include <vector>

namespace models {

    struct ParsedCommand {
        std::string name;
        std::vector<std::string> args;
    };

}
