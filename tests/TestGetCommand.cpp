#include <gtest/gtest.h>
#include <filesystem>
#include <memory>
#include <string>
#include "App.hpp"
#include "db/TxtFile.hpp"

namespace {
    // Run lines, return the last response.
    std::string runAndGetLast(App& app, const std::vector<std::string>& lines)
    {
        std::string last;
        for (const std::string& line : lines) {
            last = app.handleLine(line);
        }
        return last;
    }

    // Fresh App with an initialized DB file.
    std::unique_ptr<App> makeApp(const std::string& dbPath)
    {
        auto db = std::make_shared<TxtFile>(dbPath);
        auto app = std::make_unique<App>(db);
        app->initialize();
        return app;
    }
}

TEST(GetCommandTest, FullScenarioRecommendation)
{
    const std::string dbPath = "test_db_full.txt";
    auto app = makeApp(dbPath);

    std::string result = runAndGetLast(*app, {
        "POST 1 100 101 102 103",
        "POST 2 101 102 104 105 106",
        "POST 3 100 104 105 107 108",
        "POST 4 101 105 106 107 109 110",
        "POST 5 100 102 103 105 108 111",
        "POST 6 100 103 104 110 111 112 113",
        "POST 7 102 105 106 107 108 109 110",
        "POST 8 101 104 105 106 109 111 114",
        "POST 9 100 103 105 107 112 113 115",
        "POST 10 100 102 105 106 107 109 110 116",
        "GET 1 104",
    });

    EXPECT_EQ(result, "200 Ok\n\n105 106 111 110 112 113 107 108 109 114\n");

    std::filesystem::remove(dbPath);
}

TEST(GetCommandTest, NobodyWatchedTargetProduct)
{
    const std::string dbPath = "test_db_unknown_product.txt";
    auto app = makeApp(dbPath);

    std::string result = runAndGetLast(*app, {
        "POST 1 100 101",
        "POST 2 100 102 103",
        "POST 3 101 105 106",
        "GET 1 999",   // product 999 was never watched
    });

    EXPECT_EQ(result, "404 Not Found\n");

    std::filesystem::remove(dbPath);
}

TEST(GetCommandTest, TieBreakerSorting)
{
    const std::string dbPath = "test_db_tie_breaker.txt";
    auto app = makeApp(dbPath);

    std::string result = runAndGetLast(*app, {
        "POST 1 100",
        "POST 2 100 104 205 101 300",
        "GET 1 104",
    });

    // All recommended products have relevance 1; sort by id ascending.
    EXPECT_EQ(result, "200 Ok\n\n101 205 300\n");

    std::filesystem::remove(dbPath);
}

TEST(GetCommandTest, NoNewProductsToRecommend)
{
    const std::string dbPath = "test_db_no_new.txt";
    auto app = makeApp(dbPath);

    std::string result = runAndGetLast(*app, {
        "POST 1 100 101",
        "POST 2 100 101 104",
        "GET 1 104",
    });

    // No products to recommend — empty.
    EXPECT_EQ(result, "200 Ok\n\n\n");

    std::filesystem::remove(dbPath);
}

TEST(GetCommandTest, RecommendationsWorkAfterRestart)
{
    const std::string dbPath = "test_db_persistence.txt";

    // First app: set up state, then dies.
    {
        auto setupApp = makeApp(dbPath);
        setupApp->handleLine("POST 1 100 101");
        setupApp->handleLine("POST 2 100 104 105");
    }

    // Second app: same file, only asks for a recommendation.
    auto runApp = makeApp(dbPath);
    std::string result = runApp->handleLine("GET 1 104");

    EXPECT_EQ(result, "200 Ok\n\n105\n");

    std::filesystem::remove(dbPath);
}

TEST(GetCommandTest, DuplicateProductEntries)
{
    const std::string dbPath = "test_db_duplicates.txt";
    auto app = makeApp(dbPath);

    std::string result = runAndGetLast(*app, {
        "POST 1 100",
        "PATCH 1 100",          // duplicate — PATCH adds to existing user
        "PATCH 1 100",
        "PATCH 1 101",
        "POST 2 100 100 104 105",
        "GET 1 104",
    });

    EXPECT_EQ(result, "200 Ok\n\n105\n");

    std::filesystem::remove(dbPath);
}