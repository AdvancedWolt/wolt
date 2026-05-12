#pragma once

#include "IdbManager.hpp"

#include <string>
#include <unordered_map>
#include <unordered_set>

namespace dbHelper {

// Flat in-memory view of the DB: userId -> set of productIds the user has.
// Built once and queried many times by callers that would otherwise round-trip
// through IdbManager::getProductsForUser for every user.
using ProductsByUser =
    std::unordered_map<std::string, std::unordered_set<std::string>>;

ProductsByUser buildProductsByUser(IdbManager& db);

} // namespace dbHelper
