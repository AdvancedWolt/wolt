#pragma once

#include <istream>
#include <memory>
#include <ostream>
#include <string>

class Idatabase;
class CommandManager;

class App {
private:
    std::istream& m_input;
    std::ostream& m_output;
    std::shared_ptr<Idatabase> m_database;
    std::unique_ptr<CommandManager> m_commandManager;
    bool m_isRunning;

    void _handleLine(const std::string& line);
    void _setupCommands(); 

public:
    App(std::istream& input,
        std::ostream& output,
        std::shared_ptr<Idatabase> database);

    bool initialize(); 
    void run();
};