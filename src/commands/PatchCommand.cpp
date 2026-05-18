#include "PatchCommand.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

#include <vector>

std::string PatchCommand::getSyntax() const
{
    return "PATCH, arguments: [userid] [productid1] [productid2] ...\n";
}

models::Response PatchCommand::execute(const models::ParsedCommand& cmd, IdbManager& db)
{
    if (cmd.args.size() < 2) {
        return models::Response::badRequest();
    }

    const User user(cmd.args[0]);

    // PATCH is valid only if user already exists
    if (!db.hasUser(user)) {
        return models::Response::notFound();
    }

    std::vector<Product> products;
    products.reserve(cmd.args.size() - 1);

    for (std::size_t i = 1; i < cmd.args.size(); ++i) {
        products.emplace_back(cmd.args[i]);
    }

    if (db.postProducts(user, products) != models::Status::ok) {
        return models::Response::badRequest();
    }

    return models::Response::noContent();
}