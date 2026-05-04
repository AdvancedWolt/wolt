#include <gtest/gtest.h>
#include <sstream>
#include <vector>
#include <string>
#include <memory>
#include "../src/commands/ICommand.hpp"
#include "../src/commands/RecommendCommand.hpp"
#include "../src/commands/AddCommand.hpp"
#include "../src/App.hpp" 
#include "../src/db/TxtFile.hpp"

TEST(RecommendCommandTest, FullScenarioRecommendation)
{
    // Simulate user input: adding all users and their products, then asking for a recommendation
    std::istringstream input(
        "add 1 100 101 102 103\n"
        "add 2 101 102 104 105 106\n"
        "add 3 100 104 105 107 108\n"
        "add 4 101 105 106 107 109 110\n"
        "add 5 100 102 103 105 108 111\n"
        "add 6 100 103 104 110 111 112 113\n"
        "add 7 102 105 106 107 108 109 110\n"
        "add 8 101 104 105 106 109 111 114\n"
        "add 9 100 103 105 107 112 113 115\n"
        "add 10 100 102 105 106 107 109 110 116\n"
        "recommend 1 104\n"
    );
    std::ostringstream output;
    
    auto database = std::make_shared<TxtFile>("test_db.txt");

    App app(input, output, database);
    app.run();

    EXPECT_EQ(output.str(), "105 106 111 110 112 113 107 108 109 114\n");
}