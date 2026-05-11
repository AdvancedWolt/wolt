#pragma once

#include "models/Protocol.hpp"
#include <string>

class CommandParser {
public:
    // Parses a single line into name + args.
    // Returns ParsedCommand with empty name if the line is blank or malformed
    // the dispatcher then sends 400 Bad Request.
    static models::ParsedCommand parse(const std::string& line);
};