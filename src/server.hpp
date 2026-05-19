#pragma once

#include <memory>

#include "App.hpp"
#include "db/IdbManager.hpp"

class Server
{
public:
    static constexpr int BACKLOG = 1;

    Server(std::shared_ptr<IdbManager> database, int port);
    ~Server();

    bool initialize();

    void run();
    void stop();

private:
    void acceptLoop();
    void handleClient(int clientFd);

private:
    App m_app;

    int  m_port      = 0;
    int  m_serverFd  = -1;
    bool m_running   = false;
};