#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>
#include "../src/db/TxtFile.hpp"

TEST(TxtFileTest, GetProductsForUserReturnsOnlyRequestedUserProducts)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / "wolt_txt_file_lookup_test.txt";
    std::filesystem::remove(tempFile);

    {
        std::ofstream outputFile(tempFile);
        outputFile << "user42\tproduct1\n";
        outputFile << "other\tproduct2\n";
        outputFile << "user42\tproduct3\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<std::string> products = database.getProductsForUser("user42");
    ASSERT_EQ(products.size(), 2);
    EXPECT_EQ(products[0], "product1");
    EXPECT_EQ(products[1], "product3");

    EXPECT_TRUE(database.getProductsForUser("missing-user").empty());

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadPreservesWhitespaceInsideProductId)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / "wolt_txt_file_product_whitespace_test.txt";
    std::filesystem::remove(tempFile);

    {
        std::ofstream outputFile(tempFile);
        outputFile << "user42\thello world\n";
        outputFile << "user42\thel\tlo\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<std::string> products = database.getProductsForUser("user42");
    ASSERT_EQ(products.size(), 2);
    EXPECT_EQ(products[0], "hello world");
    EXPECT_EQ(products[1], "hel\tlo");

    std::filesystem::remove(tempFile);
}
