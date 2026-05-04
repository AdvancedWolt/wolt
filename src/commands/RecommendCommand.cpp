#include "RecommendCommand.hpp"

RecommendCommand::RecommendCommand(std::shared_ptr<Idatabase> database,
                       std::string userId,
                       std::vector<std::string> productIds)
    : m_database(std::move(database)),
      m_userId(std::move(userId)),
      m_productId(std::move(productIds))
{}

std::string RecommendCommand::syntax()
{
    return "recommend [userid] [productid]";
}

void RecommendCommand::execute(std::ostream& out)
{
    if (m_database == nullptr || m_productId.empty()) {
        return;
    }

    std::vector<std::string> targetUserProducts = m_database->getProductsForUser(m_userId);

    // calculate the weight for each user by product similaritis to target user
    std::unordered_map<std::string, int> userWeights = countSimilarities(targetUserProducts);

    // for each product asign relevence by the users similar to target user, by their weight
    std::unordered_map<std::string, int> productRelevence = computeRelevence(targetUserProducts, userWeights);

    // sort the relevence of all products
    std::vector<std::pair<std::string, int>> sortedRelevence = sortRelevence(productRelevence);

    // Print the sorted product IDs to the output stream
    for (size_t i = 0; i < sortedRelevence.size(); ++i) {
        out << sortedRelevence[i].first;
        
        // Add a space after every item except the last one
        if (i < sortedRelevence.size() - 1) {
            out << " ";
        }
    }
    
    // Only print the newline if we actually recommended something
    if (!sortedRelevence.empty()) {
        out << "\n";
    }
}

std::vector<std::pair<std::string, int>> RecommendCommand::sortRelevence(std::unordered_map<std::string, int> productRelevence)
{
    // Copy the map into a vector of pairs so we can sort it
    std::vector<std::pair<std::string, int>> sortedRelevance(productRelevence.begin(), productRelevence.end());

    // Sort the vector
    std::sort(sortedRelevance.begin(), sortedRelevance.end(), 
        [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
            if (a.second != b.second) {
                return a.second > b.second; 
            }
            
            return a.first < b.first; 
        }
    );

    return sortedRelevance;
}

std::unordered_map<std::string, int> RecommendCommand::countSimilarities(const std::vector<std::string>& targetUserProducts)
{
    std::unordered_map<std::string, int> userWeights; 
    std::vector<std::string> userIds = m_database->getAllUserIds();

    for (const auto& user : userIds) {
        // Fetch the products for the current user in the loop
        std::vector<std::string> currentUserProducts = m_database->getProductsForUser(user);

        for (const auto& product : targetUserProducts) {
            // Check if the target user's product exists in the current user's list
            if (std::find(currentUserProducts.begin(), currentUserProducts.end(), product) != currentUserProducts.end()) {
                // product in common, Increment the weight for this user.
                ++userWeights[user]; 
            }
        }
    }
    
    return userWeights;
}

std::unordered_map<std::string, int> RecommendCommand::computeRelevence(
    const std::vector<std::string>& targetUserProducts,
    std::unordered_map<std::string, int> userWeights)
{
    std::unordered_map<std::string, int> productRelevence;

    std::string targetProduct = m_productId.front();

    // Get only the users who have watched the target product
    std::vector<std::string> targetProductWatchers = getUsersWithProduct(targetProduct);

    // Iterate through those specific users
    for (const auto& user : targetProductWatchers) {
        
        // Skip the target user themselves just in case they watched the target product
        if (user == m_userId) {
            continue;
        }

        // Get the current user's similarity weight
        int weight = userWeights[user];

        // Fetch the products for the current user
        std::vector<std::string> userProducts = m_database->getProductsForUser(user);

        // Add their weight to each valid product
        for (const auto& product : userProducts) {
            
            // Do not recommend the target product itself
            if (product == targetProduct) {
                continue;
            }

            // Do not recommend products the target user has already watched
            if (std::find(targetUserProducts.begin(), targetUserProducts.end(), product) != targetUserProducts.end()) {
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
    std::vector<std::string> allUsers = m_database->getAllUserIds();

    for (const auto& user : allUsers) {
        // Fetch the products for the current user
        std::vector<std::string> userProducts = m_database->getProductsForUser(user);

        // Check if the target product exists in their list
        if (std::find(userProducts.begin(), userProducts.end(), targetProduct) != userProducts.end()) {
            usersWithProduct.push_back(user);
        }
    }

    return usersWithProduct;
}

std::string RecommendCommand::getSyntax() const
{
    return syntax();
}
