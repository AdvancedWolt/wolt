#pragma once

#include "Idatabase.hpp"
#include <string>

class TxtFile : public Idatabase {
    private:
        std::string m_filepath;
        ProductsByUser m_productsByUser;

    public:
        explicit TxtFile(const std::string& filepath);

        bool initialize() override;
        bool load() override;
        const ProductsByUser& getProductsByUser() const override;
        bool addProducts(const std::string& userId,
                         const std::vector<std::string>& productIds) override;
};
