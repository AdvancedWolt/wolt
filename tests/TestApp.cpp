#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <memory>
#include <sstream>
#include "../src/App.hpp"
#include "../src/db/TxtFile.hpp"

TEST(AppTest, HelpPrintsExpectedCommands)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / "wolt_help_command_test.txt";
    std::filesystem::remove(tempFile);

    std::istringstream input("help\n");
    std::ostringstream output;
    auto database = std::make_shared<TxtFile>(tempFile.string());

    App app(input, output, database);
    app.run();

    EXPECT_EQ(output.str(),
              "add [userid] [productid1] [productid2] ...\n"
              "help\n");

    std::filesystem::remove(tempFile);
}

TEST(AppTest, AddCommandPersistsProductsToFile)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / "wolt_add_command_test.txt";
    std::filesystem::remove(tempFile);

    std::istringstream input("add user42 product1 product2\n");
    std::ostringstream output;
    auto database = std::make_shared<TxtFile>(tempFile.string());

    App app(input, output, database);
    app.run();

    std::ifstream savedFile(tempFile);
    ASSERT_TRUE(savedFile.is_open());

    std::string firstLine;
    std::string secondLine;
    std::getline(savedFile, firstLine);
    std::getline(savedFile, secondLine);

    EXPECT_EQ(firstLine, "user42\tproduct1");
    EXPECT_EQ(secondLine, "user42\tproduct2");
    EXPECT_EQ(output.str(), "");

    std::filesystem::remove(tempFile);
}
