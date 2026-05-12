#include "commands/GetCommand.hpp"

#include <algorithm>

namespace {
    // Extract string ids from a vector of User/Product (both have a getId() field).
    template <typename T>
    std::vector<std::string> toIds(const std::vector<T>& items)
    {
        std::vector<std::string> ids;
        ids.reserve(items.size());
        for (const T& item : items) {
            ids.push_back(item.getId());
        }
        return ids;
    }
}

std::string GetCommand::getSyntax() const
{
    return "GET, arguments: [userid] [productid]\n";
}

models::CommandResult GetCommand::execute(const models::ParsedCommand& cmd, Idatabase& db)
{
    if (cmd.args.size() < 2) {
        return {false, "400 Bad Request\n"};
    }

    const std::string& userId = cmd.args[0];
    const std::string& targetProduct = cmd.args[1];

    if (!db.hasUser(User(userId))) {
        return {false, "404 Not Found\n"};
    }

    std::vector<std::string> usersWithTarget = getUsersWithProduct(db, targetProduct);
    
    std::vector<std::string> targetUserProducts =
        toIds<Product>(db.getProductsForUser(User(userId)));

    auto userWeights = countSimilarities(db, userId, targetUserProducts);

    auto productRelevence = computeRelevence(
        db, userId, targetProduct, targetUserProducts, userWeights);

    auto sortedRelevence = sortRelevence(productRelevence);

    std::string ids;
    const std::size_t count = std::min(MAX_RECOMMENDATIONS, sortedRelevence.size());
    for (std::size_t i = 0; i < count; ++i) {
        if (i > 0) {
            ids += ' ';
        }
        ids += sortedRelevence[i].first;
    }

    return {true, "200 Ok\n\n" + ids + "\n"};
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