#pragma once

#include <string>
#include <vector>
#include "Product.hpp"
#include "User.hpp"

class Idatabase {
    public:
        virtual ~Idatabase() = default;

        virtual bool initialize() = 0;
        virtual bool load() = 0;
        virtual std::vector<Product> getProductsForUser(const User& user) const = 0;
        virtual std::vector<User> getAllUsers() const = 0;
        virtual bool addProducts(const User& user, const std::vector<Product>& products) = 0;
};
