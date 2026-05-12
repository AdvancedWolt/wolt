#include <gtest/gtest.h>
#include "core/CommandParser.hpp"

TEST(CommandParserTest, ParsesPostCommand)
{
    models::ParsedCommand pc = CommandParser::parse("POST user42 product1 product2");

    EXPECT_EQ(pc.name, "post");
    ASSERT_EQ(pc.args.size(), 3u);
    EXPECT_EQ(pc.args[0], "user42");
    EXPECT_EQ(pc.args[1], "product1");
    EXPECT_EQ(pc.args[2], "product2");
}

TEST(CommandParserTest, ParsesGetCommand)
{
    models::ParsedCommand pc = CommandParser::parse("GET user42 product1");

    EXPECT_EQ(pc.name, "get");
    ASSERT_EQ(pc.args.size(), 2u);
    EXPECT_EQ(pc.args[0], "user42");
    EXPECT_EQ(pc.args[1], "product1");
}

TEST(CommandParserTest, ParsesHelpCommand)
{
    models::ParsedCommand pc = CommandParser::parse("help");

    EXPECT_EQ(pc.name, "help");
    EXPECT_TRUE(pc.args.empty());
}

TEST(CommandParserTest, IgnoresCarriageReturn)
{
    // TCP clients commonly send \r, it must not bleed into the last token.
    models::ParsedCommand pc = CommandParser::parse("GET user42 product1\r");

    EXPECT_EQ(pc.name, "get");
    ASSERT_EQ(pc.args.size(), 2u);
    EXPECT_EQ(pc.args[1], "product1");
}

TEST(CommandParserTest, RejectsTabs)
{
    models::ParsedCommand pc = CommandParser::parse("GET\tuser42 product1");

    EXPECT_TRUE(pc.name.empty());
    EXPECT_TRUE(pc.args.empty());
}

TEST(CommandParserTest, BlankLineReturnsEmpty)
{
    models::ParsedCommand pc = CommandParser::parse("   ");

    EXPECT_TRUE(pc.name.empty());
    EXPECT_TRUE(pc.args.empty());
}

TEST(CommandParserTest, EmptyStringReturnsEmpty)
{
    models::ParsedCommand pc = CommandParser::parse("");

    EXPECT_TRUE(pc.name.empty());
    EXPECT_TRUE(pc.args.empty());
}

TEST(CommandParserTest, NormalizesCommandNameToLowercase)
{
    EXPECT_EQ(CommandParser::parse("POST 1 100").name, "post");
    EXPECT_EQ(CommandParser::parse("PoSt 1 100").name, "post");
    EXPECT_EQ(CommandParser::parse("DelETe 1 100").name, "delete");
    EXPECT_EQ(CommandParser::parse("HELP").name, "help");
}

TEST(CommandParserTest, DoesNotChangeArgsCase)
{
    auto pc = CommandParser::parse("POST UserABC ProductXYZ");
    EXPECT_EQ(pc.name, "post");
    EXPECT_EQ(pc.args[0], "UserABC");
    EXPECT_EQ(pc.args[1], "ProductXYZ");
}