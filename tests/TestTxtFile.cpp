#include <gtest/gtest.h>
#include <algorithm>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include "db/TxtFile.hpp"
#include "db/User.hpp"
#include "db/Product.hpp"

namespace {

std::filesystem::path makeTempFile(const std::string& name)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / name;
    std::filesystem::remove(tempFile);
    return tempFile;
}

std::vector<int> sortedProductIds(const std::vector<Product>& products)
{
    std::vector<int> ids;
    ids.reserve(products.size());
    for (const Product& product : products) {
        ids.push_back(product.getId());
    }
    std::sort(ids.begin(), ids.end());
    return ids;
}

std::vector<int> sortedUserIds(const std::vector<User>& users)
{
    std::vector<int> ids;
    ids.reserve(users.size());
    for (const User& user : users) {
        ids.push_back(user.getId());
    }
    std::sort(ids.begin(), ids.end());
    return ids;
}

std::vector<std::string> readAllLines(const std::filesystem::path& path)
{
    std::vector<std::string> lines;
    std::ifstream input(path);
    std::string line;
    while (std::getline(input, line)) {
        if (!line.empty()) {
            lines.push_back(line);
        }
    }
    return lines;
}

}  // namespace

TEST(TxtFileTest, GetProductsForUserReturnsOnlyRequestedUserProducts)
{
    const auto tempFile = makeTempFile("wolt_txt_file_lookup_test.txt");

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

    const std::vector<int> ids = sortedProductIds(products);
    EXPECT_EQ(ids[0], 1);
    EXPECT_EQ(ids[1], 3);

    EXPECT_TRUE(database.getProductsForUser(User(7)).empty());

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadDeduplicatesRepeatedLines)
{
    const auto tempFile = makeTempFile("wolt_txt_file_dedup_load_test.txt");

    {
        std::ofstream outputFile(tempFile);
        outputFile << "1\t10\n";
        outputFile << "1\t10\n";
        outputFile << "1\t10\n";
        outputFile << "1\t20\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<Product> products = database.getProductsForUser(User(1));
    ASSERT_EQ(products.size(), 2);

    const std::vector<int> ids = sortedProductIds(products);
    EXPECT_EQ(ids[0], 10);
    EXPECT_EQ(ids[1], 20);

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, AddProductsSkipsDuplicatesWithinSameCall)
{
    const auto tempFile = makeTempFile("wolt_txt_file_dedup_call_test.txt");

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.initialize());
    ASSERT_TRUE(database.load());

    const std::vector<Product> products = {Product(7), Product(7), Product(8), Product(7)};
    ASSERT_TRUE(database.addProducts(User(5), products));

    const std::vector<Product> stored = database.getProductsForUser(User(5));
    ASSERT_EQ(stored.size(), 2);

    const std::vector<int> ids = sortedProductIds(stored);
    EXPECT_EQ(ids[0], 7);
    EXPECT_EQ(ids[1], 8);

    EXPECT_EQ(readAllLines(tempFile).size(), 2u);

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, AddProductsSkipsDuplicatesAcrossCalls)
{
    const auto tempFile = makeTempFile("wolt_txt_file_dedup_persist_test.txt");

    {
        TxtFile database(tempFile.string());
        ASSERT_TRUE(database.initialize());
        ASSERT_TRUE(database.load());
        ASSERT_TRUE(database.addProducts(User(1), {Product(100), Product(200)}));
        ASSERT_TRUE(database.addProducts(User(1), {Product(100), Product(300)}));
    }

    EXPECT_EQ(readAllLines(tempFile).size(), 3u);

    TxtFile reloaded(tempFile.string());
    ASSERT_TRUE(reloaded.load());

    const std::vector<int> ids = sortedProductIds(reloaded.getProductsForUser(User(1)));
    ASSERT_EQ(ids.size(), 3u);
    EXPECT_EQ(ids[0], 100);
    EXPECT_EQ(ids[1], 200);
    EXPECT_EQ(ids[2], 300);

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, GetAllUsersReturnsEachUserOnce)
{
    const auto tempFile = makeTempFile("wolt_txt_file_all_users_test.txt");

    {
        std::ofstream outputFile(tempFile);
        outputFile << "1\t10\n";
        outputFile << "2\t20\n";
        outputFile << "1\t11\n";
        outputFile << "3\t30\n";
        outputFile << "2\t21\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<int> ids = sortedUserIds(database.getAllUsers());
    ASSERT_EQ(ids.size(), 3u);
    EXPECT_EQ(ids[0], 1);
    EXPECT_EQ(ids[1], 2);
    EXPECT_EQ(ids[2], 3);

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadEmptyFileSucceedsWithNoUsers)
{
    const auto tempFile = makeTempFile("wolt_txt_file_empty_test.txt");
    {
        std::ofstream outputFile(tempFile);
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    EXPECT_TRUE(database.getAllUsers().empty());
    EXPECT_TRUE(database.getProductsForUser(User(1)).empty());

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadIgnoresMalformedLines)
{
    const auto tempFile = makeTempFile("wolt_txt_file_malformed_test.txt");

    {
        std::ofstream outputFile(tempFile);
        outputFile << "1\t10\n";
        outputFile << "no-tab-here\n";
        outputFile << "\n";
        outputFile << "2\t20\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    EXPECT_EQ(database.getAllUsers().size(), 2u);
    ASSERT_EQ(database.getProductsForUser(User(1)).size(), 1u);
    EXPECT_EQ(database.getProductsForUser(User(1))[0].getId(), 10);
    ASSERT_EQ(database.getProductsForUser(User(2)).size(), 1u);
    EXPECT_EQ(database.getProductsForUser(User(2))[0].getId(), 20);

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadOnMissingFileReturnsFalse)
{
    const auto tempFile = makeTempFile("wolt_txt_file_missing_test.txt");

    TxtFile database(tempFile.string());
    EXPECT_FALSE(database.load());
}
