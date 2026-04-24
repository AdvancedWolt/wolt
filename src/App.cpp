#include "App.hpp"
#include "AppInternals.hpp"
#include <utility>

App::App(std::istream& input,
         std::ostream& output,
         std::shared_ptr<Idatabase> database)
    : m_input(input), m_output(output), m_database(std::move(database))
{
    if (m_database != nullptr) {
        if (m_database->initialize()) {
            m_database->load();
        }
    }
}

void App::run()
{
    std::string currentLine;
    while (std::getline(m_input, currentLine)) {
        _handleLine(currentLine);
    }
}

void App::_handleLine(const std::string& line)
{
    bool isValidLineFormat = true;
    const std::vector<std::string> tokens = AppInternals::parseLine(line, isValidLineFormat);
    if (!isValidLineFormat || tokens.empty()) {
        return;
    }

    // App knows only how to parse the input line and ask the registered builder
    // for a command object. Adding a new command now means registering a builder,
    // instead of changing the command dispatch flow.
    std::unique_ptr<ICommand> command = AppInternals::buildCommand(tokens, m_database);
    if (command != nullptr) {
        command->execute(m_output);
    }
}
