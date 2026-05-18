#include "DeleteCommand.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

#include <algorithm>

std::string DeleteCommand::getSyntax() const
{
    return "DELETE, arguments: [userid] [productid1] [productid2] ...\n";
}

models::Response DeleteCommand::execute(const models::ParsedCommand& cmd, IdbManager& db)
{
    if (cmd.args.size() < 2) {
        return models::Response::badRequest();
    }

    const User user(cmd.args[0]);

    // Delete is valid only if the user already exists.
    if (!db.hasUser(user)) {
        return models::Response::notFound();
    }

    std::vector<Product> products;
    products.reserve(cmd.args.size() - 1);

    for (std::size_t i = 1; i < cmd.args.size(); ++i) {
        products.emplace_back(cmd.args[i]);
    }

    // Delete is valid only if the products already exists in the user watch list.
    auto existing = db.getProductsForUser(user);

    for (const auto& p : products) {
        if (!std::ranges::contains(existing, p)) {
            return models::Response::notFound(); 
        }
    }

    if (db.deleteProductsFromUser(user, products) != models::Status::ok) {
        return models::Response::badRequest();
    }

    return models::Response::noContent();
}
