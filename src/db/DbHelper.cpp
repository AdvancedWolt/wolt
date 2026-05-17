#include "DbHelper.hpp"

#include "models/Product.hpp"
#include "models/User.hpp"

#include <utility>
#include <vector>

namespace dbHelper {

ProductsByUser buildProductsByUser(const IdbManager& db)
{
    ProductsByUser productsByUser;
    for (const User& user : db.getAllUsers()) {
        const std::vector<Product> userProducts = db.getProductsForUser(user);
        std::unordered_set<std::string> ids;
        ids.reserve(userProducts.size());
        for (const Product& product : userProducts) {
            ids.insert(product.getId());
        }
        productsByUser.emplace(user.getId(), std::move(ids));
    }
    return productsByUser;
}

} // namespace dbHelper
