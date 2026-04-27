#include <gtest/gtest.h>
#include <string>
#include <vector>
#include "../src/AppInternals.hpp"

TEST(AppInternalsTest, ParseLineIgnoresCarriageReturn)
{
    bool isValidFormat = false;

    const std::vector<std::string> tokens =
        AppInternals::parseLine("add user42 product1\r", isValidFormat);

    ASSERT_TRUE(isValidFormat);
    ASSERT_EQ(tokens.size(), 3);
    EXPECT_EQ(tokens[0], "add");
    EXPECT_EQ(tokens[1], "user42");
    EXPECT_EQ(tokens[2], "product1");
}

TEST(AppInternalsTest, ParseLineRejectsTabs)
{
    bool isValidFormat = true;

    const std::vector<std::string> tokens =
        AppInternals::parseLine("add\tuser42 product1", isValidFormat);

    EXPECT_FALSE(isValidFormat);
    EXPECT_TRUE(tokens.empty());
}
