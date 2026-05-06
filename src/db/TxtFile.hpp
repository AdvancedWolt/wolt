#pragma once

#include "Idatabase.hpp"
#include <string>
#include <unordered_map>
#include <unordered_set>

class TxtFile : public Idatabase {
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
        bool addProducts(const User& user, const std::vector<Product>& products) override;
};
