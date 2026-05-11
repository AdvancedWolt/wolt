#pragma once

#include <string>
#include <vector>
#include "Product.hpp"
#include "User.hpp"
#include "../Status.hpp"

class IdbManger {
    public:
        virtual ~IdbManger() = default;

        virtual bool initialize() = 0;
        virtual bool load() = 0;
        virtual std::vector<Product> getProductsForUser(const User& user) const = 0;
        virtual std::vector<User> getAllUsers() const = 0;
        virtual Status addProducts(const User& user, const std::vector<Product>& products) = 0;
        virtual Status patchProducts(const User& user,const std::vector<Product>& products) = 0;
        virtual Status deleteProductsFromUser(const User& user, const std::vector<Product>& products) = 0;
        virtual bool doesUserExist(const User& user) = 0;
        virtual std::vector<User> getUsersWithProduct(const Product& p) = 0;
        virtual std::vector<User> getUsersWithProducts(const std::vector<const Product&>& targetProducts);
};
