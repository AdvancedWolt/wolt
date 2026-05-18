#include <gtest/gtest.h>
#include <filesystem>
#include <memory>
#include <string>
#include <vector>

#include "App.hpp"
#include "db/TxtFile.hpp"

namespace {
    std::string runAndGetLast(App& app, const std::vector<std::string>& lines)
    {
        std::string last;
        for (const std::string& line : lines) {
            last = app.handleLine(line);
        }
        return last;
    }

    std::filesystem::path makeTempDb(const std::string& name)
    {
        const std::filesystem::path tempFile =
            std::filesystem::temp_directory_path() / name;
        std::filesystem::remove(tempFile);
        return tempFile;
    }

    std::unique_ptr<App> makeApp(const std::filesystem::path& dbPath)
    {
        auto db = std::make_shared<TxtFile>(dbPath.string());
        auto app = std::make_unique<App>(db);
        app->initialize();
        return app;
    }
}

TEST(DeleteCommandTest, ReturnsBadRequestWhenMissingArguments)
{
    const auto dbPath = makeTempDb("wolt_delete_bad_request.txt");
    auto app = makeApp(dbPath);

    const std::string result = app->handleLine("DELETE 1");

    EXPECT_EQ(result, "400 Bad Request\n");

    std::filesystem::remove(dbPath);
}

TEST(DeleteCommandTest, ReturnsNotFoundWhenUserDoesNotExist)
{
    const auto dbPath = makeTempDb("wolt_delete_user_not_found.txt");
    auto app = makeApp(dbPath);

    const std::string result = app->handleLine("DELETE 1 100");

    EXPECT_EQ(result, "404 Not Found\n");

    std::filesystem::remove(dbPath);
}

TEST(DeleteCommandTest, DeletesExistingProductsAndReturnsNoContent)
{
    const auto dbPath = makeTempDb("wolt_delete_success.txt");
    auto app = makeApp(dbPath);

    const std::string result = runAndGetLast(*app, {
        "POST 1 100 101 102",
        "DELETE 1 101 102",
    });

    EXPECT_EQ(result, "204 No Content\n");

    std::filesystem::remove(dbPath);
}

TEST(DeleteCommandTest, ReturnsNotFoundWhenProductIsNotInUserWatchList)
{
    const auto dbPath = makeTempDb("wolt_delete_product_not_found.txt");
    auto app = makeApp(dbPath);

    const std::string result = runAndGetLast(*app, {
        "POST 1 100 101",
        "DELETE 1 999",
    });

    EXPECT_EQ(result, "404 Not Found\n");

    std::filesystem::remove(dbPath);
}

TEST(DeleteCommandTest, DatabaseStateAfterDelete)
{
    const auto dbPath = makeTempDb("wolt_delete_state.txt");
    auto db = std::make_shared<TxtFile>(dbPath.string());
    App app(db);
    app.initialize();

    app.handleLine("POST 1 100 101 102 103");
    app.handleLine("DELETE 1 101 103");

    auto products = db->getProductsForUser(User("1"));

    EXPECT_EQ(products.size(), 2);
    EXPECT_TRUE(std::find(products.begin(), products.end(), Product("100")) != products.end());
    EXPECT_TRUE(std::find(products.begin(), products.end(), Product("102")) != products.end());

    std::filesystem::remove(dbPath);
}