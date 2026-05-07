#include <gtest/gtest.h>
#include <filesystem>
#include <sstream>
#include <vector>
#include <string>
#include <memory>
#include "commands/ICommand.hpp"
#include "commands/RecommendCommand.hpp"
#include "commands/AddCommand.hpp"
#include "App.hpp" 
#include "db/TxtFile.hpp"

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

TEST(RecommendCommandTest, EdgeCase_NobodyWatchedTargetProduct)
{
    std::istringstream input(
        "add 1 100 101\n"
        "add 2 100 102 103\n"
        "add 3 101 105 106\n"
        "recommend 1 999\n" // Product 999 was never watched
    );
    std::ostringstream output;
    
    auto database = std::make_shared<TxtFile>("test_db_unknown_product.txt");
    App app(input, output, database);
    app.run();

    EXPECT_EQ(output.str(), "");
}

TEST(RecommendCommandTest, EdgeCase_TieBreakerSorting)
{
    std::istringstream input(
        "add 1 100\n"
        "add 2 100 104 205 101 300\n"
        "recommend 1 104\n"
    );
    std::ostringstream output;
    
    auto database = std::make_shared<TxtFile>("test_db_tie_breaker.txt");
    App app(input, output, database);
    app.run();

    // All recommended products have a relevence of 1. 
    // They must be sorted by ID: 101, 205, 300.
    EXPECT_EQ(output.str(), "101 205 300\n");
}

TEST(RecommendCommandTest, EdgeCase_NoNewProductsToRecommend)
{
    std::istringstream input(
        "add 1 100 101\n"
        "add 2 100 101 104\n"
        "recommend 1 104\n"
    );
    std::ostringstream output;
    
    auto database = std::make_shared<TxtFile>("test_db_no_new_products.txt");
    App app(input, output, database);
    app.run();

    // all products are either watched by target user or is a target product
    EXPECT_EQ(output.str(), "");
}

TEST(RecommendCommandTest, Persistence_RecommendationsWorkAfterRestart)
{
    const std::string dbPath = "test_db_persistence.txt";
    
    {
        std::istringstream setupInput(
            "add 1 100 101\n"
            "add 2 100 104 105\n"
        );
        std::ostringstream dummyOutput;
        auto dbSetup = std::make_shared<TxtFile>(dbPath);
        
        App setupApp(setupInput, dummyOutput, dbSetup);
        setupApp.run();
    }

    // Start a brand new app instance pointing to the same file
    // We only provide the 'recommend' command. No 'add' commands
    std::istringstream runInput("recommend 1 104\n");
    std::ostringstream finalOutput;
    
    auto dbRun = std::make_shared<TxtFile>(dbPath);
    App runApp(runInput, finalOutput, dbRun);
    runApp.run();

    EXPECT_EQ(finalOutput.str(), "105\n");

    std::filesystem::remove(dbPath);
}

TEST(RecommendCommandTest, EdgeCase_DuplicateProductEntries)
{
    std::istringstream input(
        "add 1 100\n"
        "add 1 100\n"
        "add 1 100\n"             // Added across multiple lines
        "add 1 101\n"
        "add 2 100 100 104 105\n" // Added multiple times in one line
        "recommend 1 104\n"
    );
    std::ostringstream output;
    
    auto database = std::make_shared<TxtFile>("test_db_duplicates.txt");
    App app(input, output, database);
    app.run();

    EXPECT_EQ(output.str(), "105\n");
}