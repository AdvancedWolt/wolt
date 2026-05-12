#include "AppInternals.hpp"
#include "commands/PostCommand.hpp"
#include "commands/HelpCommand.hpp"
#include "commands/RecommendCommand.hpp"
#include "commands/SyntaxCommand.hpp"
#include <cctype>
#include <cstddef>
#include <unordered_map>

namespace AppInternals {
    constexpr std::size_t COMMAND_NAME_INDEX = 0;
    constexpr std::size_t USER_ID_INDEX = 1;
    constexpr std::size_t FIRST_PRODUCT_INDEX = 2;

    constexpr std::size_t HELP_ARGUMENT_COUNT = 1;
    constexpr std::size_t POST_MINIMUM_ARGUMENT_COUNT = 3;
    constexpr std::size_t RECOMMEND_ARGUMENT_COUNT = 3;

    const std::string POST_COMMAND_NAME = "post";
    const std::string HELP_COMMAND_NAME = "help";
    const std::string RECOMMEND_COMMAND_NAME = "recommend";

    // HelpCommand prints getSyntax() for each command it receives.
    // Wrapped in a function so the static is initialized on first use,
    // avoiding a static-init-order issue with the s_syntax members in
    // PostCommand.cpp / RecommendCommand.cpp.
    const std::vector<std::shared_ptr<ICommand>>& helpCommands()
    {
        static const std::vector<std::shared_ptr<ICommand>> commands = {
            std::make_shared<SyntaxCommand>(PostCommand::s_syntax),
            std::make_shared<SyntaxCommand>(RecommendCommand::s_syntax),
            std::make_shared<SyntaxCommand>(HelpCommand::s_syntax)
        };
        return commands;
    }

    // A builder receives the already-split input line and creates the matching
    // command. Returning nullptr means the input is not a valid command.
    using CommandBuilder = std::unique_ptr<ICommand> (*)(
        const std::vector<std::string>&,
        const std::shared_ptr<IdbManager>&);

    std::unique_ptr<ICommand> buildPostCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<IdbManager>& database);

    std::unique_ptr<ICommand> buildHelpCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<IdbManager>& database);

    std::unique_ptr<ICommand> buildRecommendCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<IdbManager>& database);

    // Maps the command name from tokens[0] to the function that knows how to
    // validate its arguments and create the command object.
    const std::unordered_map<std::string, CommandBuilder> COMMAND_BUILDERS = {
        {POST_COMMAND_NAME, buildPostCommand},
        {HELP_COMMAND_NAME, buildHelpCommand},
        {RECOMMEND_COMMAND_NAME, buildRecommendCommand}
    };

    bool isSupportedWhitespace(const char currentChar)
    {
        return currentChar != TAB_CHARACTER &&
               std::isspace(static_cast<unsigned char>(currentChar));
    }

    bool isBlank(const std::string& text)
    {
        for (const char currentChar : text) {
            if (!isSupportedWhitespace(currentChar)) {
                return false;
            }
        }

        return true;
    }

    // Split one input command line into tokens.
    // The exercise allows spaces between fields. Other non-tab whitespace is
    // tolerated so CRLF input does not leak '\r' into the last token.
    std::vector<std::string> parseLine(const std::string& line, bool& isValidFormat)
    {
        /* 
        * Token positions after App splits a command line by spaces.
        * Example: "add user42 product1 product2 .."
        * tokens[0] = "add", tokens[1] = "user42", tokens[2...] = products.
        */
        isValidFormat = true;

        if (line.empty() || isBlank(line)) {
            return {};
        }

        std::vector<std::string> tokens;
        std::string currentToken;

        for (const char currentChar : line) {
            if (currentChar == TAB_CHARACTER) {
                isValidFormat = false;
                return {};
            }

            if (isSupportedWhitespace(currentChar)) {
                if (!currentToken.empty()) {
                    tokens.push_back(currentToken);
                    currentToken.clear();
                }
                continue;
            }

            currentToken += currentChar;
        }

        if (!currentToken.empty()) {
            tokens.push_back(currentToken);
        }

        return tokens;
    }

    std::unique_ptr<ICommand> buildPostCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<IdbManager>& database)
    {
        if (tokens.size() < POST_MINIMUM_ARGUMENT_COUNT) {
            return nullptr;
        }

        const std::string& userId = tokens[USER_ID_INDEX];
        std::vector<std::string> productIds;

        // Every token after the user id is a product id.
        for (std::size_t index = FIRST_PRODUCT_INDEX; index < tokens.size(); ++index) {
            productIds.push_back(tokens[index]);
        }

        return std::make_unique<PostCommand>(database, userId, productIds);
    }

    std::unique_ptr<ICommand> buildHelpCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<IdbManager>& database)
    {
        (void)database;

        if (tokens.size() != HELP_ARGUMENT_COUNT) {
            return nullptr;
        }

        return std::make_unique<HelpCommand>(helpCommands());
    }

    std::unique_ptr<ICommand> buildRecommendCommand(
    const std::vector<std::string>& tokens,
    const std::shared_ptr<IdbManager>& database)
    {
        if (tokens.size() != RECOMMEND_ARGUMENT_COUNT) {
            return nullptr;
        }

        const std::string& userId = tokens[USER_ID_INDEX];
        
        // Extract the target product ID from the tokens
        std::vector<std::string> productId;
        productId.push_back(tokens[FIRST_PRODUCT_INDEX]);

        return std::make_unique<RecommendCommand>(database, userId, productId);
    }

    std::unique_ptr<ICommand> buildCommand(
        const std::vector<std::string>& tokens,
        const std::shared_ptr<IdbManager>& database)
    {
        const auto commandBuilderIterator = COMMAND_BUILDERS.find(tokens[COMMAND_NAME_INDEX]);
        if (commandBuilderIterator == COMMAND_BUILDERS.end()) {
            return nullptr;
        }

        return commandBuilderIterator->second(tokens, database);
    }
}
