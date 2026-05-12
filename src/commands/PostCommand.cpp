#include "PostCommand.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

std::string PostCommand::getSyntax() const
{
    return "POST, arguments: [userid] [productid1] [productid2] ...\n";
}

models::Response PostCommand::execute(const models::ParsedCommand& cmd, IdbManager& db)
{
    if (cmd.args.size() < 2) {
        return models::Response::badRequest();
    }

    const User user(cmd.args[0]);

    // POST is valid only if the user doesn't already exist.
    if (db.hasUser(user)) {
        return models::Response::notFound();
    }

    std::vector<Product> products;
    products.reserve(cmd.args.size() - 1);
    for (std::size_t i = 1; i < cmd.args.size(); ++i) {
        products.emplace_back(cmd.args[i]);
    }

    if (db.addProducts(user, products) != models::Status::ok) {
        return models::Response::badRequest();
    }

    return models::Response::created();
}
