#pragma once
#include "App.hpp"
#include <memory>

class IdbManager;

class Server {
public:
    explicit Server(std::shared_ptr<IdbManager> database, int port);
    ~Server();

    bool initialize();
    void run();
    void stop();

private:
    void acceptLoop();
    void handleClient(int clientFd);

    App  m_app;
    int  m_port;
    int  m_serverFd = -1;
    bool m_running  = false;
};