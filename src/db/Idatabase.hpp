#pragma once

#include "models/User.hpp"
#include "models/Product.hpp"
#include <string>
#include <vector>

class Idatabase {
    public:
        virtual ~Idatabase() = default;

        virtual bool initialize() = 0;
        virtual bool load() = 0;
        virtual bool hasUser(const User& user) const = 0;
        virtual std::vector<Product> getProductsForUser(const User& user) const = 0;
        virtual std::vector<User> getAllUsers() const = 0;
        virtual bool addProducts(const User& user, const std::vector<Product>& products) = 0;
};