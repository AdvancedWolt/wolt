#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <vector>
#include "../src/db/TxtFile.hpp"
#include "../src/db/User.hpp"
#include "../src/db/Product.hpp"

TEST(TxtFileTest, GetProductsForUserReturnsOnlyRequestedUserProducts)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / "wolt_txt_file_lookup_test.txt";
    std::filesystem::remove(tempFile);

    {
        std::ofstream outputFile(tempFile);
        outputFile << "42\t1\n";
        outputFile << "99\t2\n";
        outputFile << "42\t3\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<Product> products = database.getProductsForUser(User(42));
    ASSERT_EQ(products.size(), 2);
    EXPECT_EQ(products[0].getId(), 1);
    EXPECT_EQ(products[1].getId(), 3);

    EXPECT_TRUE(database.getProductsForUser(User(7)).empty());

    std::filesystem::remove(tempFile);
}
