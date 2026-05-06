#include "RecommendCommand.hpp"

namespace {

    template<typename T>
    std::vector<std::string> toIds(const std::vector<T>& items)
    {
        std::vector<std::string> ids;
        ids.reserve(items.size());
        for (const T& item : items) {
            ids.push_back(std::to_string(item.getId()));
        }
        return ids;
    }
}

const std::string RecommendCommand::s_syntax = "recommend [userid] [productid]";

RecommendCommand::RecommendCommand(std::shared_ptr<Idatabase> database,
                       std::string userId,
                       std::vector<std::string> productIds)
    : m_database(std::move(database)),
      m_userId(std::move(userId)),
      m_productId(std::move(productIds))
{}

void RecommendCommand::execute(std::ostream& out)
{
    if (m_database == nullptr || m_productId.empty()) {
        return;
    }

    std::vector<std::string> targetUserProducts =
        toIds<Product>(m_database->getProductsForUser(User(std::stoi(m_userId))));

    // calculate the weight for each user by product similaritis to target user
    std::unordered_map<std::string, int> userWeights = countSimilarities(targetUserProducts);

    // for each product asign relevence by the users similar to target user, by their weight
    std::unordered_map<std::string, int> productRelevence = computeRelevence(targetUserProducts, userWeights);

    // sort the relevence of all products
    std::vector<std::pair<std::string, int>> sortedRelevence = sortRelevence(productRelevence);

    // Get the top 10 IDs
    auto top_ids_view = sortedRelevence
                      | std::views::take(MAX_RECOMMENDATIONS) 
                      | std::views::keys;

    // Join them with spaces and convert the view into a real std::string
    std::string output_str = top_ids_view 
                           | std::views::join_with(' ') 
                           | std::ranges::to<std::string>();

    // Use std::format on the resulting string
    if (!output_str.empty()) {
        out << std::format("{}\n", output_str);
    }
}

std::vector<std::pair<std::string, int>> RecommendCommand::sortRelevence(const std::unordered_map<std::string, int>& productRelevence)
{
    // Copy the map into a vector of pairs so we can sort it
    std::vector<std::pair<std::string, int>> sortedRelevance;

    for (const auto& pair : productRelevence) {
        if (pair.second > 0) { 
            // Only keep products with a relevance weight > 0
            sortedRelevance.push_back(pair);
        }
    }

    // Sort the vector
    std::sort(sortedRelevance.begin(), sortedRelevance.end(), 
        [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
            if (a.second != b.second) {
                return a.second > b.second; 
            }
            
            return std::stoi(a.first) < std::stoi(b.first);        
        }
    );

    return sortedRelevance;
}

std::unordered_map<std::string, int> RecommendCommand::countSimilarities(const std::vector<std::string>& targetUserProducts)
{
    std::unordered_map<std::string, int> userWeights;
    std::vector<std::string> userIds = toIds<User>(m_database->getAllUsers());

    // Convert target products to an unordered_set
    std::unordered_set<std::string> targetSet(targetUserProducts.begin(), targetUserProducts.end());

    for (const auto& user : userIds) {
        // Skip the user asking for the recommendation
        if (user == m_userId) {
            continue;
        }

        std::vector<std::string> currentUserProducts =
            toIds<Product>(m_database->getProductsForUser(User(std::stoi(user))));

        // Convert current user's products to a set too.
        std::unordered_set<std::string> currentUserSet(currentUserProducts.begin(), currentUserProducts.end());

        for (const auto& product : currentUserSet) {
            if (targetSet.contains(product)) {
                // Product in common, increment the weight for this user.
                ++userWeights[user]; 
            }
        }
    }
    
    return userWeights;
}

std::unordered_map<std::string, int> RecommendCommand::computeRelevence(
    const std::vector<std::string>& targetUserProducts,
    const std::unordered_map<std::string, int>& userWeights)
{
    std::unordered_map<std::string, int> productRelevence;
    std::string targetProduct = m_productId.front();

    // Convert to unordered_set for O(1) lookups inside the loop
    std::unordered_set<std::string> alreadyWatched(
        targetUserProducts.begin(), targetUserProducts.end()
    );

    // Fetch the watchers of the target product
    std::vector<std::string> watchersList = getUsersWithProduct(targetProduct);
    
    // Convert watchers to a set so we can instantly check if a weighted user is a watcher
    std::unordered_set<std::string> targetProductWatchers(
        watchersList.begin(), watchersList.end()
    );

    // Iterate over the userWeights map
    for (const auto& [user, weight] : userWeights) {
        
        // Skip users with zero weight
        // Skip the target user themselves
        if (weight == 0 || user == m_userId) {
            continue;
        }

        // Check if this weighted user actually watched the target product
        if (!targetProductWatchers.contains(user)) {
            continue;
        }

        std::vector<std::string> userProducts =
            toIds<Product>(m_database->getProductsForUser(User(std::stoi(user))));

        // Add their weight to each valid product
        for (const auto& product : userProducts) {
            
            // Do not recommend the target product itself
            if (product == targetProduct) {
                continue;
            }

            // Do not recommend products the target user has already watched
            if (alreadyWatched.contains(product)) {
                continue;
            }

            // Add the user's weight to the product's total relevance score
            productRelevence[product] += weight;
        }
    }

    return productRelevence;
}

std::vector<std::string> RecommendCommand::getUsersWithProduct(const std::string& targetProduct)
{
    std::vector<std::string> usersWithProduct;
    std::vector<std::string> allUsers = toIds<User>(m_database->getAllUsers());

    for (const auto& user : allUsers) {
        // Fetch the products for the current user
        std::vector<std::string> userProducts =
            toIds<Product>(m_database->getProductsForUser(User(std::stoi(user))));

        if (std::ranges::contains(userProducts, targetProduct)) {
            usersWithProduct.push_back(user);
        }
    }

    return usersWithProduct;
}
