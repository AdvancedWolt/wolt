#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <memory>
#include <sstream>
#include "../src/App.hpp"
#include "../src/db/TxtFile.hpp"

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
};

TEST_F(AppTest, HelpPrintsExpectedCommands)
{
    std::istringstream input("help\n");
    std::ostringstream output;
    auto database = std::make_shared<TxtFile>(m_tempFile.string());

    App app(input, output, database);
    app.run();

    EXPECT_EQ(output.str(),
              "add [userid] [productid1] [productid2] ...\n"
              "help\n");
}

TEST_F(AppTest, AddCommandPersistsProductsToFile)
{
    std::istringstream input("add user42 product1 product2\n");
    std::ostringstream output;
    auto database = std::make_shared<TxtFile>(m_tempFile.string());

    App app(input, output, database);
    app.run();

    std::ifstream savedFile(m_tempFile);
    ASSERT_TRUE(savedFile.is_open());

    std::string firstLine;
    std::string secondLine;
    std::getline(savedFile, firstLine);
    std::getline(savedFile, secondLine);

    EXPECT_EQ(firstLine, "user42\tproduct1");
    EXPECT_EQ(secondLine, "user42\tproduct2");
    EXPECT_EQ(output.str(), "");

    savedFile.close();
}
