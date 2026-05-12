#include <gtest/gtest.h>
#include <algorithm>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>
#include "db/TxtFile.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

namespace {

std::filesystem::path makeTempFile(const std::string& name)
{
    const std::filesystem::path tempFile =
        std::filesystem::temp_directory_path() / name;
    std::filesystem::remove(tempFile);
    return tempFile;
}

std::vector<std::string> sortedProductIds(const std::vector<Product>& products)
{
    std::vector<std::string> ids;
    ids.reserve(products.size());
    for (const Product& product : products) {
        ids.push_back(product.getId());
    }
    std::sort(ids.begin(), ids.end());
    return ids;
}

std::vector<std::string> sortedUserIds(const std::vector<User>& users)
{
    std::vector<std::string> ids;
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
        outputFile << "alice\tpizza\n";
        outputFile << "bob\tburger\n";
        outputFile << "alice\tsushi\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<Product> products = database.getProductsForUser(User("alice"));
    ASSERT_EQ(products.size(), 2);

    const std::vector<std::string> ids = sortedProductIds(products);
    EXPECT_EQ(ids[0], "pizza");
    EXPECT_EQ(ids[1], "sushi");

    EXPECT_TRUE(database.getProductsForUser(User("charlie")).empty());

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadDeduplicatesRepeatedLines)
{
    const auto tempFile = makeTempFile("wolt_txt_file_dedup_load_test.txt");

    {
        std::ofstream outputFile(tempFile);
        outputFile << "alice\tpizza\n";
        outputFile << "alice\tpizza\n";
        outputFile << "alice\tpizza\n";
        outputFile << "alice\tsushi\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<Product> products = database.getProductsForUser(User("alice"));
    ASSERT_EQ(products.size(), 2);

    const std::vector<std::string> ids = sortedProductIds(products);
    EXPECT_EQ(ids[0], "pizza");
    EXPECT_EQ(ids[1], "sushi");

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, AddProductsSkipsDuplicatesWithinSameCall)
{
    const auto tempFile = makeTempFile("wolt_txt_file_dedup_call_test.txt");

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.initialize());
    ASSERT_TRUE(database.load());

    const std::vector<Product> products = {
        Product("pizza"), Product("pizza"), Product("sushi"), Product("pizza")
    };
    ASSERT_TRUE(database.addProducts(User("alice"), products));

    const std::vector<Product> stored = database.getProductsForUser(User("alice"));
    ASSERT_EQ(stored.size(), 2);

    const std::vector<std::string> ids = sortedProductIds(stored);
    EXPECT_EQ(ids[0], "pizza");
    EXPECT_EQ(ids[1], "sushi");

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
        ASSERT_TRUE(database.addProducts(User("alice"), {Product("pizza"), Product("sushi")}));
        ASSERT_TRUE(database.addProducts(User("alice"), {Product("pizza"), Product("ramen")}));
    }

    EXPECT_EQ(readAllLines(tempFile).size(), 3u);

    TxtFile reloaded(tempFile.string());
    ASSERT_TRUE(reloaded.load());

    const std::vector<std::string> ids = sortedProductIds(reloaded.getProductsForUser(User("alice")));
    ASSERT_EQ(ids.size(), 3u);
    EXPECT_EQ(ids[0], "pizza");
    EXPECT_EQ(ids[1], "ramen");
    EXPECT_EQ(ids[2], "sushi");

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, GetAllUsersReturnsEachUserOnce)
{
    const auto tempFile = makeTempFile("wolt_txt_file_all_users_test.txt");

    {
        std::ofstream outputFile(tempFile);
        outputFile << "alice\tpizza\n";
        outputFile << "bob\tburger\n";
        outputFile << "alice\tsushi\n";
        outputFile << "charlie\ttaco\n";
        outputFile << "bob\tramen\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    const std::vector<std::string> ids = sortedUserIds(database.getAllUsers());
    ASSERT_EQ(ids.size(), 3u);
    EXPECT_EQ(ids[0], "alice");
    EXPECT_EQ(ids[1], "bob");
    EXPECT_EQ(ids[2], "charlie");

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
    EXPECT_TRUE(database.getProductsForUser(User("alice")).empty());

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadIgnoresMalformedLines)
{
    const auto tempFile = makeTempFile("wolt_txt_file_malformed_test.txt");

    {
        std::ofstream outputFile(tempFile);
        outputFile << "alice\tpizza\n";
        outputFile << "no-tab-here\n";
        outputFile << "\n";
        outputFile << "bob\tburger\n";
    }

    TxtFile database(tempFile.string());
    ASSERT_TRUE(database.load());

    EXPECT_EQ(database.getAllUsers().size(), 2u);
    ASSERT_EQ(database.getProductsForUser(User("alice")).size(), 1u);
    EXPECT_EQ(database.getProductsForUser(User("alice"))[0].getId(), "pizza");
    ASSERT_EQ(database.getProductsForUser(User("bob")).size(), 1u);
    EXPECT_EQ(database.getProductsForUser(User("bob"))[0].getId(), "burger");

    std::filesystem::remove(tempFile);
}

TEST(TxtFileTest, LoadOnMissingFileReturnsFalse)
{
    const auto tempFile = makeTempFile("wolt_txt_file_missing_test.txt");

    TxtFile database(tempFile.string());
    EXPECT_FALSE(database.load());
}