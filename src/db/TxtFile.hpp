#pragma once

#include "IdbManager.hpp"
#include <string>
#include <unordered_map>
#include <unordered_set>

class TxtFile : public IdbManager {
    private:
        using ProductsByUser = std::unordered_map<User, std::unordered_set<Product>>;

        std::string m_filepath;
        ProductsByUser m_productsByUser;

    public:
        explicit TxtFile(const std::string& filepath);
        /*---------------------------------Initialization---------------------------------------*/
        bool initialize() override;
        bool load() override;

        /*---------------------------------Getters---------------------------------------*/
        std::vector<Product> getProductsForUser(const User& user) const override;
        std::vector<User> getAllUsers() const override;
        std::vector<User> getUsersWithProduct(const Product& p) const override;

        /*---------------------------------Commands---------------------------------------*/
        models::Status postProducts(const User& user, const std::vector<Product>& products) override;
        models::Status deleteProductsFromUser(const User& user, const std::vector<Product>& products) override;
        models::Status patchProducts(const User& user,const std::vector<Product>& products) override;

        /*---------------------------------Querys---------------------------------------*/
        bool hasUser(const User& user) const override;
};
