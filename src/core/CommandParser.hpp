#pragma once

#include "models/Protocol.hpp"
#include <string>

class CommandParser {
public:
    // Splits a line into a command name and its args.
    // Lowercases the name so commands are case-insensitive. args stay as-is.
    // Tabs and blank lines produce an empty result (the dispatcher turns that into 400).
    static models::ParsedCommand parse(const std::string& line);
};