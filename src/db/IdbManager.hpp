#pragma once

#include <string>
#include <vector>
#include "models/Product.hpp"
#include "models/User.hpp"
#include "Status.hpp"

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
        virtual std::vector<User> getUsersWithProducts(const std::vector<Product>& targetProducts) const = 0;

        /*---------------------------------Commands---------------------------------------*/
        virtual Status addProducts(const User& user, const std::vector<Product>& products) = 0;
        virtual Status patchProducts(const User& user,const std::vector<Product>& products) = 0;
        virtual Status deleteProductsFromUser(const User& user, const std::vector<Product>& products) = 0;
        
        /*---------------------------------Querys---------------------------------------*/
        virtual bool hasUser(const User& user) const = 0;
        
};
