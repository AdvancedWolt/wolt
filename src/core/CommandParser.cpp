#include "core/CommandParser.hpp"

#include <algorithm>
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
            // Tabs aren't allowed.
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

    std::transform(pc.name.begin(), pc.name.end(), pc.name.begin(),
        [](unsigned char c) { return std::tolower(c); });


    return pc;
}