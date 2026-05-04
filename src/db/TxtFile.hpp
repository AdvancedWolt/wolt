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
        std::vector<std::string> getProductsForUser(const std::string& userId) const override;
        std::vector<std::string> getAllUserIds() const override;
        bool addProducts(const std::string& userId,
                         const std::vector<std::string>& productIds) override;
};
