#pragma once

#include <memory>
#include <cstddef>

#include "App.hpp"
#include "db/IdbManager.hpp"

class Server
{
public:
    Server(std::shared_ptr<IdbManager> database, int port);
    ~Server();

    bool initialize();
    void run();
    void stop();

private: 
    // Private methods
    void acceptLoop();
    void handleClient(int clientFd);

private: 
    // Private members
    App  m_app;
    int  m_port;
    int  m_servSock = -1;
    bool m_running  = false;

    static constexpr int BACKLOG = 1; 
    static constexpr std::size_t BUFFER_SIZE = 4096;
    static constexpr char CR = '\r'; // carrige return
    static constexpr char LF = '\n'; // line feed
    static constexpr int SERVER_DOWN = -1;
};