#include "commands/GetCommand.hpp"
#include "models/Product.hpp"
#include "models/User.hpp"

#include <algorithm>

std::string GetCommand::getSyntax() const
{
    return "GET, arguments: [userid] [productid]\n";
}

models::Response GetCommand::execute(const models::ParsedCommand& cmd, IdbManager& db)
{
    if (cmd.args.size() < 2) {
        return models::Response::badRequest();
    }

    const std::string& userId = cmd.args[0];
    const std::string& targetProduct = cmd.args[1];

    if (!db.hasUser(User(userId))) {
        return models::Response::notFound();
    }

    const dbHelper::ProductsByUser productsByUser = dbHelper::buildProductsByUser(db);
    const auto& targetUserProducts = productsByUser.at(userId);

    auto userWeights = countSimilarities(userId, targetUserProducts, productsByUser);

    auto productRelevance = computeRelevance(
        userId, targetProduct, targetUserProducts, userWeights, productsByUser);

    auto sortedRelevance = sortRelevance(productRelevance);

    std::string ids;
    const std::size_t count = std::min(MAX_RECOMMENDATIONS, sortedRelevance.size());
    for (std::size_t i = 0; i < count; ++i) {
        if (i > 0) {
            ids += ' ';
        }
        ids += sortedRelevance[i].first;
    }

    return models::Response::ok(ids + "\n");
}

std::unordered_map<std::string, int> GetCommand::countSimilarities(
    const std::string& targetUserId,
    const std::unordered_set<std::string>& targetUserProducts,
    const dbHelper::ProductsByUser& productsByUser)
{
    std::unordered_map<std::string, int> userWeights;

    for (const auto& [userId, products] : productsByUser) {
        if (userId == targetUserId) {
            continue;
        }

        for (const auto& product : products) {
            if (targetUserProducts.contains(product)) {
                ++userWeights[userId];
            }
        }
    }

    return userWeights;
}

std::unordered_map<std::string, int> GetCommand::computeRelevance(
    const std::string& targetUserId,
    const std::string& targetProduct,
    const std::unordered_set<std::string>& targetUserProducts,
    const std::unordered_map<std::string, int>& userWeights,
    const dbHelper::ProductsByUser& productsByUser)
{
    std::unordered_map<std::string, int> productRelevance;

    for (const auto& [userId, weight] : userWeights) {
        if (weight == 0 || userId == targetUserId) {
            continue;
        }

        const auto it = productsByUser.find(userId);
        if (it == productsByUser.end()) {
            continue;
        }
        const auto& userProducts = it->second;

        // Only count users who actually watched the target product.
        if (!userProducts.contains(targetProduct)) {
            continue;
        }

        for (const auto& product : userProducts) {
            if (product == targetProduct) {
                continue;
            }
            if (targetUserProducts.contains(product)) {
                continue;
            }
            productRelevance[product] += weight;
        }
    }

    return productRelevance;
}

std::vector<std::pair<std::string, int>> GetCommand::sortRelevance(
    const std::unordered_map<std::string, int>& productRelevance)
{
    std::vector<std::pair<std::string, int>> sorted;
    sorted.reserve(productRelevance.size());

    for (const auto& pair : productRelevance) {
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
