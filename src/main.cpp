#include "App.hpp"
#include "db/TxtFile.hpp"
#include <iostream>
#include <memory>

int main()
{
    auto database = std::make_shared<TxtFile>("data/views.txt");
    App app(std::cin, std::cout, database);
    app.run();
    return 0;
}
