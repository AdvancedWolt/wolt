#include "core/CommandParser.hpp"

#include <cctype>

namespace {
    constexpr char TAB_CHARACTER = '\t';

    bool isSupportedWhitespace(char c)
    {
        return c != TAB_CHARACTER &&
               std::isspace(static_cast<unsigned char>(c));
    }
}

models::ParsedCommand CommandParser::parse(const std::string& line)
{
    models::ParsedCommand pc;

    std::string token;
    for (char c : line) {
        if (c == TAB_CHARACTER) {
            // Tabs aren't allowed by the spec; treat as malformed.
            return {};
        }

        if (isSupportedWhitespace(c)) {
            if (!token.empty()) {
                if (pc.name.empty()) pc.name = std::move(token);
                else                 pc.args.push_back(std::move(token));
                token.clear();
            }
            continue;
        }
        token += c;
    }
    if (!token.empty()) {
        if (pc.name.empty()) pc.name = std::move(token);
        else                 pc.args.push_back(std::move(token));
    }

    return pc;
}