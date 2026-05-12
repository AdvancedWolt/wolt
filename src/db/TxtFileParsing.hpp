#pragma once

#include <string>
#include <unordered_set>
#include <vector>

#include "Product.hpp"
#include "User.hpp"

namespace txtFileParsing {

bool tryParseNonNegativeInt(const std::string& text, int& value);

bool upsertUserProductsLine(const std::string& filepath,
                            const User& user,
                            const std::unordered_set<Product>& products);

bool appendUserProductLines(const std::string& filepath,
                            const User& user,
                            const std::vector<Product>& products);

bool removeUserProductsLine(const std::string& filepath, const User& user);

} // namespace txtFileParsing
