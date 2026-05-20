#include "server.hpp"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <iostream>
#include <cstring>
#include <string>

Server::Server(std::shared_ptr<IdbManager> database, int port)
    : m_app(std::move(database)), m_port(port) {}

Server::~Server() {
    stop();
}

bool Server::initialize() {
    if (!m_app.initialize()) {
        std::cerr << "App initialization failed" << std::endl;
        return false;
    }

    m_servSock = socket(AF_INET, SOCK_STREAM, 0);
    if (m_servSock < 0) {
        std::cerr << "socket() failed: " << std::strerror(errno) << std::endl;
        return false;
    }

    int opt = 1;
    setsockopt(m_servSock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in addr{};
    addr.sin_family      = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port        = htons(static_cast<uint16_t>(m_port));

    if (bind(m_servSock, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
        std::cerr << "bind() failed: " << std::strerror(errno) << std::endl;
        return false;
    }

    if (listen(m_servSock, BACKLOG) < 0) {
        std::cerr << "listen() failed: " << std::strerror(errno) << std::endl;
        return false;
    }

    m_running = true;
    std::cout << "Server listening on port " << m_port << std::endl;
    return true;
}

void Server::run() {
    acceptLoop();
}

void Server::stop() {
    m_running = false;
    if (m_servSock >= 0) {
        close(m_servSock);
        m_servSock = SERVER_DOWN;
    }
}

void Server::acceptLoop() {
    while (m_running) {
        int clientSock = accept(m_servSock, nullptr, nullptr);
        if (clientSock < 0) {
            std::cerr << "accept() failed: " << std::strerror(errno) << std::endl;
            continue; // Keep server running for next connection
        }

        std::cout << "Client connected" << std::endl;
        handleClient(clientSock);
        close(clientSock);
        std::cout << "Client disconnected" << std::endl;
    }
}

void Server::handleClient(int clientSock) {
    char buffer[BUFFER_SIZE];
    std::string leftover;

    while (m_running) {
        ssize_t read_bytes = recv(clientSock, buffer, sizeof(buffer), 0);

        if (read_bytes == 0) {
            break; // Clean disconnect
        }

        if (read_bytes < 0) {
            std::cerr << "recv error: " << std::strerror(errno) << std::endl;
            break;
        }

        leftover.append(buffer, static_cast<std::size_t>(read_bytes));

        size_t pos;
        while ((pos = leftover.find(LF)) != std::string::npos) {
            std::string line = leftover.substr(0, pos);
            leftover.erase(0, pos + 1);

            // Handle Windows-style line endings
            if (!line.empty() && line.back() == CR) {
                line.pop_back();
            }

            std::string response = m_app.handleLine(line);

            send(clientSock, response.c_str(), response.size(), 0);
        }
    }
}