#include "App.hpp"
#include "models/Protocol.hpp"
#include "commands/Commands.hpp"
#include "core/CommandManager.hpp"
#include "core/CommandParser.hpp"
#include "db/Idatabase.hpp"
#include <utility>

App::App(std::istream& input,
         std::ostream& output,
         std::shared_ptr<Idatabase> database)
    : m_input(input), 
      m_output(output), 
      m_database(std::move(database)),
      m_commandManager(nullptr), // Created in initialize()
      m_isRunning(false)
{}

bool App::initialize() 
{
    if (!m_database) return false;

    // Initialize and Load Database
    if (!m_database->initialize() || !m_database->load()) {
        return false;
    }

    // Setup the Command Manager
    m_commandManager = std::make_unique<CommandManager>();
    _setupCommands();

    m_isRunning = true;
    return true;
}

void App::_setupCommands() {
    // Register all normal commands 
    m_commandManager->registerCommand("add", std::make_unique<AddCommand>(m_database));
    m_commandManager->registerCommand("recommend", std::make_unique<RecommendCommand>(m_database));

    // Get the array of syntaxes 
    std::vector<std::string> syntaxes = m_commandManager->getAllSyntaxes();    

    // add "help" to the list so it knows about itself
    syntaxes.push_back("help");

    // Sort alphabetically
    std::sort(syntaxes.begin(), syntaxes.end());

    // Instantiate help with the syntaxes vector
    m_commandManager->registerCommand("help", std::make_unique<HelpCommand>(syntaxes));
}

void App::run()
{
    std::string currentLine;
    while (m_isRunning && std::getline(m_input, currentLine)) {
        _handleLine(currentLine);
    }
}

// THIS SHOULD MOVE TO A DIFFERENT CLASS
/*
void App::_handleLine(const std::string& line)
{
    // Use Parser from AppInternals
    // ParsedCommand pc = CommandParser::parse(line);
    
    if (pc.name.empty()) {
        return;
    }

    CommandResult result = m_commandManager->execute(pc, *m_database);

    if (!result.success) {
        m_output << "Error: ";
    }
    m_output << result.message << std::endl;
}

*/