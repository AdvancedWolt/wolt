#pragma once

#include <string>
#include <unordered_set>

#include "models/Product.hpp"
#include "models/User.hpp"

namespace txtFileParsing {

// Write/rewrite the user's line in the file (single line, all products sorted).
// Drops any existing line(s) for that user first.
bool upsertUserProductsLine(const std::string& filepath,
                            const User& user,
                            const std::unordered_set<Product>& products);

// Append a single new line for a user not already in the file.
// Caller must ensure the user is new — duplicates would otherwise appear.
bool appendUserProductLine(const std::string& filepath,
                           const User& user,
                           const std::unordered_set<Product>& products);

bool removeUserProductsLine(const std::string& filepath, const User& user);

} // namespace txtFileParsing
