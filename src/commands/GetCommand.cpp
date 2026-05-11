#include "commands/GetCommand.hpp"

#include <algorithm>

namespace {
    // Extract string ids from a vector of User/Product (both have a `.id` field).
    template <typename T>
    std::vector<std::string> toIds(const std::vector<T>& items)
    {
        std::vector<std::string> ids;
        ids.reserve(items.size());
        for (const T& item : items) {
            ids.push_back(item.id);
        }
        return ids;
    }
}

std::string GetCommand::getSyntax() const
{
    std::ostringstream oss;
    oss << "GET, arguments: [userid] [productid]" << std::endl;
    return oss.str();
}

models::CommandResult GetCommand::execute(const models::ParsedCommand& cmd, Idatabase& db)
{
    if (cmd.args.empty()) {
        return {true, ""};
    }

    const std::string& userId = cmd.args[0];
    std::vector<std::string> productIds(cmd.args.begin() + 1, cmd.args.end());

    if (productIds.empty()) {
        return {true, ""};
    }

    std::vector<std::string> targetUserProducts =
        toIds<Product>(db.getProductsForUser(User(userId)));

    auto userWeights = countSimilarities(db, userId, targetUserProducts);

    auto productRelevence = computeRelevence(
        db, userId, productIds.front(), targetUserProducts, userWeights);

    auto sortedRelevence = sortRelevence(productRelevence);

    std::string output;
    const std::size_t count = std::min(MAX_RECOMMENDATIONS, sortedRelevence.size());
    for (std::size_t i = 0; i < count; ++i) {
        if (i > 0) {
            output += ' ';
        }
        output += sortedRelevence[i].first;
    }
    if (!output.empty()) {
        output += '\n';
    }

    return {true, output};
}

std::vector<std::pair<std::string, int>> GetCommand::sortRelevence(
    const std::unordered_map<std::string, int>& productRelevence)
{
    std::vector<std::pair<std::string, int>> sorted;
    sorted.reserve(productRelevence.size());

    for (const auto& pair : productRelevence) {
        if (pair.second > 0) {
            sorted.push_back(pair);
        }
    }

    std::sort(sorted.begin(), sorted.end(),
        [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
            if (a.second != b.second) {
                return a.second > b.second;
            }
            return a.first < b.first;
        });

    return sorted;
}

std::unordered_map<std::string, int> GetCommand::countSimilarities(
    Idatabase& db,
    const std::string& targetUserId,
    const std::vector<std::string>& targetUserProducts)
{
    std::unordered_map<std::string, int> userWeights;
    std::vector<std::string> userIds = toIds<User>(db.getAllUsers());

    std::unordered_set<std::string> targetSet(
        targetUserProducts.begin(), targetUserProducts.end());

    for (const auto& user : userIds) {
        if (user == targetUserId) {
            continue;
        }

        std::vector<std::string> currentUserProducts =
            toIds<Product>(db.getProductsForUser(User(user)));

        std::unordered_set<std::string> currentUserSet(
            currentUserProducts.begin(), currentUserProducts.end());

        for (const auto& product : currentUserSet) {
            if (targetSet.contains(product)) {
                ++userWeights[user];
            }
        }
    }

    return userWeights;
}

std::unordered_map<std::string, int> GetCommand::computeRelevence(
    Idatabase& db,
    const std::string& targetUserId,
    const std::string& targetProduct,
    const std::vector<std::string>& targetUserProducts,
    const std::unordered_map<std::string, int>& userWeights)
{
    std::unordered_map<std::string, int> productRelevence;

    std::unordered_set<std::string> alreadyWatched(
        targetUserProducts.begin(), targetUserProducts.end());

    std::vector<std::string> watchersList = getUsersWithProduct(db, targetProduct);
    std::unordered_set<std::string> targetProductWatchers(
        watchersList.begin(), watchersList.end());

    for (const auto& [user, weight] : userWeights) {
        if (weight == 0 || user == targetUserId) {
            continue;
        }
        if (!targetProductWatchers.contains(user)) {
            continue;
        }

        std::vector<std::string> userProducts =
            toIds<Product>(db.getProductsForUser(User(user)));

        for (const auto& product : userProducts) {
            if (product == targetProduct) {
                continue;
            }
            if (alreadyWatched.contains(product)) {
                continue;
            }
            productRelevence[product] += weight;
        }
    }

    return productRelevence;
}

std::vector<std::string> GetCommand::getUsersWithProduct(
    Idatabase& db,
    const std::string& targetProduct)
{
    std::vector<std::string> usersWithProduct;
    std::vector<std::string> allUsers = toIds<User>(db.getAllUsers());

    for (const auto& user : allUsers) {
        std::vector<std::string> userProducts =
            toIds<Product>(db.getProductsForUser(User(user)));

        if (std::find(userProducts.begin(), userProducts.end(), targetProduct)
            != userProducts.end()) {
            usersWithProduct.push_back(user);
        }
    }

    return usersWithProduct;
}