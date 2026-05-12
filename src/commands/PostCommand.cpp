#include "PostCommand.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

std::string PostCommand::getSyntax() const
{
    return "POST, arguments: [userid] [productid1] [productid2] ...\n";
}

models::CommandResult PostCommand::execute(const models::ParsedCommand& cmd, IdbManager& db)
{
    if (cmd.args.size() < 2) {
        return {false, "400 Bad Request\n"};
    }

    const User user(cmd.args[0]);

    // POST is valid only if the user doesn't already exist.
    if (db.hasUser(user)) {
        return {false, "404 Not Found\n"};
    }

    std::vector<Product> products;
    products.reserve(cmd.args.size() - 1);
    for (std::size_t i = 1; i < cmd.args.size(); ++i) {
        products.emplace_back(cmd.args[i]);
    }

    if (db.addProducts(user, products) != Status::ok) {
        return {false, "400 Bad Request\n"};
    }

    return {true, "201 Created\n"};
}
