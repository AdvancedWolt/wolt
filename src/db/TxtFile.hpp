#pragma once

#include "Idatabase.hpp"
#include <string>
#include <unordered_map>

class TxtFile : public Idatabase {
    private:
        using ProductsByUser = std::unordered_map<std::string, std::vector<std::string>>;

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
