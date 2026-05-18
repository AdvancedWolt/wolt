#include "server.hpp"

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>

Server::Server(std::shared_ptr<IdbManager> database, int port)
    : m_app(std::move(database)), m_port(port)
{}

Server::~Server() { stop(); }

bool Server::initialize()
{
    if (!m_app.initialize()) {
        std::cerr << "App initialization failed\n";
        return false;
    }

    m_serverFd = ::socket(AF_INET, SOCK_STREAM, 0);
    if (m_serverFd < 0) {
        std::cerr << "socket() failed\n";
        return false;
    }

    int opt = 1;
    ::setsockopt(m_serverFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in addr{};
    addr.sin_family      = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port        = htons(static_cast<uint16_t>(m_port));

    if (::bind(m_serverFd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
        std::cerr << "bind() failed\n";
        return false;
    }

    if (::listen(m_serverFd, BACKLOG) < 0) {   // backlog=1: one client at a time
        std::cerr << "listen() failed\n";
        return false;
    }

    m_running = true;
    std::cout << "Server listening on port " << m_port << "\n";
    return true;
}

void Server::run()  { acceptLoop(); }
void Server::stop() {
    m_running = false;
    if (m_serverFd >= 0) { ::close(m_serverFd); m_serverFd = -1; }
}

void Server::acceptLoop()
{
    while (m_running) {
        int clientFd = ::accept(m_serverFd, nullptr, nullptr);
        if (clientFd < 0) break;

        std::cout << "Client connected\n";
        handleClient(clientFd);          
        ::close(clientFd);
        std::cout << "Client disconnected\n";
        // loop back, ready for the next client
    }
}

void Server::handleClient(int clientFd)
{
    char buffer[4096];
    std::string leftover;

    while (true)
    {
        int read_bytes = ::recv(clientFd, buffer, sizeof(buffer), 0);

        if (read_bytes == 0) {
            // client closed connection
            break;
        }

        if (read_bytes < 0) {
            perror("recv error");
            break;
        }

        // append new data to leftover buffer
        leftover.append(buffer, read_bytes);

        // process full lines
        size_t pos;
        while ((pos = leftover.find('\n')) != std::string::npos)
        {
            std::string line = leftover.substr(0, pos);
            leftover.erase(0, pos + 1);

            if (!line.empty() && line.back() == '\r')
                line.pop_back();

            if (line.empty())
                continue;

            std::string response = m_app.handleLine(line);

            // ensure exactly one newline at end
            if (response.empty() || response.back() != '\n')
                response += '\n';

            ::send(clientFd, response.c_str(), response.size(), 0);
        }
    }
}