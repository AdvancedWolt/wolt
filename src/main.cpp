#include "App.hpp"
#include "db/TxtFile.hpp"

#include <iostream>
#include <memory>
#include <string>

int main()
{
    auto database = std::make_shared<TxtFile>("data/views.txt");
    App app(database);

    if (!app.initialize()) {
        return 1;
    }

    std::string line;
    while (std::getline(std::cin, line)) {
        std::cout << app.handleLine(line);
    }

    return 0;
}