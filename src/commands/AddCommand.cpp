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

    m_database->addProducts(m_userId, m_productIds);
}

std::string AddCommand::getSyntax() const
{
    return syntax();
}
