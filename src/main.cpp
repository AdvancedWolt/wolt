#include "Server.hpp"
#include "db/TxtFile.hpp"
#include <iostream>
#include <cstdlib>
#include <memory>

int main(int argc, char* argv[])
{
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <port>\n";
        return 1;
    }

    int port = std::atoi(argv[1]);
    auto database = std::make_shared<TxtFile>("data/views.txt");
    Server server(std::move(database), port);

    if (!server.initialize()) return 1;
    server.run();
    return 0;
}