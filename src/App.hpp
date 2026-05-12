#pragma once

#include <memory>
#include <string>

class IdbManager;
class CommandManager;

class App {
private:
    std::shared_ptr<IdbManager> m_database;
    std::unique_ptr<CommandManager> m_commandManager;
    bool m_initialized = false;

    void _setupCommands();

public:
    explicit App(std::shared_ptr<IdbManager> database);
    ~App();

    bool initialize();

    // Process one raw command line, return what should be sent back.
    std::string handleLine(const std::string& line);
};
