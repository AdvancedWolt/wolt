#pragma once

#include "commands/ICommand.hpp"
#include "db/Idatabase.hpp"
#include <memory>
#include <string>
#include <vector>

namespace AppInternals {
    constexpr char SPACE_CHARACTER = ' ';
    constexpr char TAB_CHARACTER = '\t';

    std::vector<std::string> parseLine(const std::string& line, bool& isValidFormat);

    std::unique_ptr<ICommand> buildCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<Idatabase>& database);
}
