#include "AddCommand.hpp"

AddCommand::AddCommand(std::shared_ptr<Idatabase> database,
                       std::string userId,
                       std::vector<std::string> productIds)
    : m_database(std::move(database)),
      m_userId(std::move(userId)),
      m_productIds(std::move(productIds))
{}

std::string AddCommand::syntax()
{
    return "add [userid] [productid1] [productid2] ...";
}

void AddCommand::execute(std::ostream& out)
{
    // for now we don't need to output anything , just to get rid of the unused parameter warning.
    (void)out;

    if (m_database == nullptr || m_productIds.empty()) {
        return;
    }

    const User user(std::stoi(m_userId));
    std::vector<Product> products;
    products.reserve(m_productIds.size());
    for (const std::string& productId : m_productIds) {
        products.emplace_back(std::stoi(productId));
    }

    m_database->addProducts(user, products);
}
