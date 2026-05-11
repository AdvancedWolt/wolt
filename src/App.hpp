#pragma once

#include <memory>
#include <string>

class Idatabase;
class CommandManager;

class App {
private:
    std::shared_ptr<Idatabase> m_database;
    std::unique_ptr<CommandManager> m_commandManager;
    bool m_initialized = false;

    void _setupCommands();

public:
    explicit App(std::shared_ptr<Idatabase> database);

    bool initialize();

    // Process one raw command line, return what should be sent back.
    std::string handleLine(const std::string& line);
};