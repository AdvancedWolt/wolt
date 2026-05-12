#pragma once

#include <string>
#include <vector>
#include "models/Product.hpp"
#include "models/User.hpp"
#include "models/Status.hpp"

class IdbManager {
    public:
        virtual ~IdbManager() = default;

        /*---------------------------------Initialization---------------------------------------*/
        virtual bool initialize() = 0;
        virtual bool load() = 0;

        /*---------------------------------Getters---------------------------------------*/
        virtual std::vector<Product> getProductsForUser(const User& user) const = 0;
        virtual std::vector<User> getAllUsers() const = 0;
        virtual std::vector<User> getUsersWithProduct(const Product& p) const = 0;

        /*---------------------------------Commands---------------------------------------*/
        virtual models::Status addProducts(const User& user, const std::vector<Product>& products) = 0;
        virtual models::Status patchProducts(const User& user,const std::vector<Product>& products) = 0;
        virtual models::Status deleteProductsFromUser(const User& user, const std::vector<Product>& products) = 0;

        /*---------------------------------Querys---------------------------------------*/
        virtual bool hasUser(const User& user) const = 0;

};
