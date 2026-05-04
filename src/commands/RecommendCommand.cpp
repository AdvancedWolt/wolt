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
        out << "[DEBUG] Command failed early: Database is null or Product ID is empty.\n";
        return;
    }

    // DEBUG: Check how many users the database actually has loaded
    std::vector<std::string> allUsers = m_database->getAllUserIds();
    if (allUsers.empty()) {
        out << "[DEBUG] Database is completely empty! addProducts() probably failed to open the file.\n";
        return;
    }

    std::vector<std::string> targetUserProducts = m_database->getProductsForUser(m_userId);
    
    // DEBUG: Check if the target user actually has products
    if (targetUserProducts.empty()) {
        out << "[DEBUG] Target user '" << m_userId << "' has 0 products in memory.\n";
        return;
    }

    std::unordered_map<std::string, int> userWeights = countSimilarities(targetUserProducts);
    std::unordered_map<std::string, int> productRelevence = computeRelevence(targetUserProducts, userWeights);

    // DEBUG: Check if computeRelevence found any matching products
    if (productRelevence.empty()) {
        out << "[DEBUG] productRelevence is empty. Target product ID: '" << m_productId.front() << "'\n";
        out << "[DEBUG] Number of users who watched the target product: " << getUsersWithProduct(m_productId.front()).size() << "\n";
        return;
    }

    // --- Original Sorting and Printing Logic ---
    std::vector<std::pair<std::string, int>> sortedRelevance(productRelevence.begin(), productRelevence.end());

    std::sort(sortedRelevance.begin(), sortedRelevance.end(), 
        [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
            if (a.second != b.second) {
                return a.second > b.second; 
            }
            return a.first < b.first; 
        }
    );

    for (size_t i = 0; i < sortedRelevance.size(); ++i) {
        out << sortedRelevance[i].first;
        if (i < sortedRelevance.size() - 1) {
            out << " ";
        }
    }
    
    if (!sortedRelevance.empty()) {
        out << "\n";
    }
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

    // Assuming the target product is the first item in your m_productId vector 
    // based on your command syntax: "recommend [userid] [productid]"
    if (m_productId.empty()) {
        return productRelevence;
    }
    std::string targetProduct = m_productId.front();

    // 1. Get only the users who have watched the target product
    std::vector<std::string> targetProductWatchers = getUsersWithProduct(targetProduct);

    // 2. Iterate through those specific users
    for (const auto& user : targetProductWatchers) {
        
        // Skip the target user themselves just in case they watched the target product
        if (user == m_userId) {
            continue;
        }

        // Get the current user's similarity weight
        int weight = userWeights[user];
        
        // Small optimization: If weight is 0, they don't contribute to relevance
        if (weight == 0) {
            continue;
        }

        // Fetch the products for the current user
        std::vector<std::string> userProducts = m_database->getProductsForUser(user);

        // 3. Add their weight to each valid product
        for (const auto& product : userProducts) {
            
            // Rule A: Do not recommend the target product itself
            if (product == targetProduct) {
                continue;
            }

            // Rule B: Do not recommend products the target user has already watched
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
