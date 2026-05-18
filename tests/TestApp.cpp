#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <memory>
#include <string>
#include "App.hpp"
#include "db/TxtFile.hpp"

class AppTest : public ::testing::Test {
protected:
    const std::filesystem::path m_tempFile =
        std::filesystem::temp_directory_path() / "wolt_app_test.txt";

    void SetUp() override
    {
        std::filesystem::remove(m_tempFile);
    }

    void TearDown() override
    {
        std::filesystem::remove(m_tempFile);
    }

    std::unique_ptr<App> makeApp()
    {
        auto db = std::make_shared<TxtFile>(m_tempFile.string());
        auto app = std::make_unique<App>(db);
        app->initialize();
        return app;
    }
};

TEST_F(AppTest, HelpPrintsExpectedCommands)
{
    auto app = makeApp();

    std::string output = app->handleLine("help");

    // all commands alphabetical, help last.
    EXPECT_EQ(output,
              "200 Ok\n"
              "GET, arguments: [userid] [productid]\n"
              "POST, arguments: [userid] [productid1] [productid2] ...\n"
              "help\n\n");
}

TEST_F(AppTest, PostCommandPersistsProductsToFile)
{
    auto app = makeApp();

    std::string response = app->handleLine("POST 42 1 2");

    EXPECT_EQ(response, "201 Created\n\n");

    std::ifstream savedFile(m_tempFile);
    ASSERT_TRUE(savedFile.is_open());

    std::string line;
    std::getline(savedFile, line);

    // One line per user; products sorted on the line.
    EXPECT_EQ(line, "42\t1\t2");

    savedFile.close();
}

TEST_F(AppTest, HelpAcceptsAnyCase)
{
    auto app = makeApp();
    const std::string expected =
        "200 Ok\n"
        "GET, arguments: [userid] [productid]\n"
        "POST, arguments: [userid] [productid1] [productid2] ...\n"
        "help\n";

    EXPECT_EQ(app->handleLine("help"), expected);
    EXPECT_EQ(app->handleLine("HELP"), expected);
    EXPECT_EQ(app->handleLine("HeLp"), expected);
}