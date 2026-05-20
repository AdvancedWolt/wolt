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

TEST(PatchCommandTest, ReturnsBadRequestWhenMissingArguments)
{
    const auto dbPath = makeTempDb("patch_bad_request.txt");
    auto app = makeApp(dbPath);

    const std::string result = app->handleLine("PATCH 1");

    EXPECT_EQ(result, "400 Bad Request\n");

    std::filesystem::remove(dbPath);
}

TEST(PatchCommandTest, ReturnsNotFoundWhenUserDoesNotExist)
{
    const auto dbPath = makeTempDb("patch_user_not_found.txt");
    auto app = makeApp(dbPath);

    const std::string result = app->handleLine("PATCH 1 100");

    EXPECT_EQ(result, "404 Not Found\n");

    std::filesystem::remove(dbPath);
}

TEST(PatchCommandTest, AddsProductsToExistingUser)
{
    const auto dbPath = makeTempDb("patch_success.txt");
    auto app = makeApp(dbPath);

    runAndGetLast(*app, {
        "POST 1 100 101",
        "PATCH 1 102 103",
    });

    std::string result = app->handleLine("GET 1 100");

    EXPECT_NE(result.find("102"), std::string::npos);
    EXPECT_NE(result.find("103"), std::string::npos);

    std::filesystem::remove(dbPath);
}

TEST(PatchCommandTest, PatchWorksAfterPost)
{
    const auto dbPath = makeTempDb("patch_after_post.txt");
    auto app = makeApp(dbPath);

    runAndGetLast(*app, {
        "POST 1 100",
        "PATCH 1 101",
        "PATCH 1 102",
    });

    std::string result = app->handleLine("GET 1 100");

    EXPECT_NE(result.find("101"), std::string::npos);
    EXPECT_NE(result.find("102"), std::string::npos);

    std::filesystem::remove(dbPath);
}

TEST(PatchCommandTest, DuplicateProductsHandledGracefully)
{
    const auto dbPath = makeTempDb("patch_duplicates.txt");
    auto app = makeApp(dbPath);

    runAndGetLast(*app, {
        "POST 1 100",
        "PATCH 1 101 101 102",
    });

    std::string result = app->handleLine("GET 1 100");

    // Should still contain 101 and 102 at least once
    EXPECT_NE(result.find("101"), std::string::npos);
    EXPECT_NE(result.find("102"), std::string::npos);

    std::filesystem::remove(dbPath);
}