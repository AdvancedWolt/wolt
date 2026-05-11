#pragma once

#include "IdbManger.hpp"
#include <string>
#include <unordered_map>
#include <unordered_set>

class TxtFile : public IdbManger {
    private:
        using ProductsByUser = std::unordered_map<User, std::unordered_set<Product>>;

        std::string m_filepath;
        ProductsByUser m_productsByUser;

    public:
        explicit TxtFile(const std::string& filepath);

        bool initialize() override;
        bool load() override;
        std::vector<Product> getProductsForUser(const User& user) const override;
        std::vector<User> getAllUsers() const override;
        Status addProducts(const User& user, const std::vector<Product>& products) override;        
        Status deleteProductsFromUser(const User& user, const std::vector<Product>& products) override;
        Status patchProducts(const User& user,const std::vector<Product>& products) override;
        bool doesUserExist(const User& user) override;
        std::vector<User> getUsersWithProduct(const Product& p) override;
        std::vector<User> getUsersWithProducts(const std::vector<const Product&>& targetProducts) override;
};
