#include "App.hpp"
#include "core/CommandManager.hpp"
#include "core/CommandParser.hpp"
#include "commands/Commands.hpp"
#include "db/IdbManager.hpp"
#include "models/Protocol.hpp"

#include <utility>

App::App(std::shared_ptr<IdbManager> database)
    : m_database(std::move(database))
{}

App::~App() = default;

bool App::initialize()
{
    if (!m_database) return false;
    if (!m_database->initialize() || !m_database->load()) return false;

    m_commandManager = std::make_unique<CommandManager>();
    setupCommands();

    m_initialized = true;
    return true;
}

void App::setupCommands()
{
    m_commandManager->registerCommand("post", std::make_unique<PostCommand>());
    m_commandManager->registerCommand("get",  std::make_unique<GetCommand>());
    // TBD: patch, delete

    m_commandManager->registerCommand("help",
        std::make_unique<HelpCommand>(*m_commandManager));
}

std::string App::handleLine(const std::string& line)
{
    if (!m_initialized) return "";

    models::ParsedCommand pc = CommandParser::parse(line);
    if (pc.name.empty()) {
        return "";  // empty line, ignore silently
    }

    return m_commandManager->execute(pc, *m_database).toWire();
}
