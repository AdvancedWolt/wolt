#include "PostCommand.hpp"

#include <algorithm>
#include <cctype>


const std::string PostCommand::s_syntax = "post [userid] [productid1] [productid2] ...";

PostCommand::PostCommand(std::shared_ptr<IdbManger> database,
                         std::string userId,
                         std::vector<std::string> productIds)
    : m_database(std::move(database)),
      m_userId(std::move(userId)),
      m_productIds(std::move(productIds))
{}

void PostCommand::execute(std::ostream& out)
{
    // for now we don't need to output anything , just to get rid of the unused parameter warning.
    (void)out;

    if (m_database == nullptr || m_productIds.empty() || m_userId.empty()) {
        return;
    }

    const bool isNumericUserId = std::all_of(m_userId.begin(), m_userId.end(),
        [](char character) { return std::isdigit(static_cast<unsigned char>(character)) != 0; });
    if (!isNumericUserId) {
        return;
    }

    const auto userId = std::stoi(m_userId);
    if(userId < 0) {
        return;
    }    

    const User user(userId);
    std::vector<Product> products;
    products.reserve(m_productIds.size());
    for (const std::string& productId : m_productIds) {
        products.emplace_back(std::stoi(productId));
    }

    m_database->addProducts(user, products);
}
