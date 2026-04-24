#pragma once

#include <string>
#include <unordered_map>
#include <vector>

class Idatabase {
    public:
        using ProductsByUser = std::unordered_map<std::string, std::vector<std::string>>;

        virtual ~Idatabase() = default;

        virtual bool initialize() = 0;
        virtual bool load() = 0;
        virtual const ProductsByUser& getProductsByUser() const = 0;
        virtual bool addProducts(const std::string& userId,
                                 const std::vector<std::string>& productIds) = 0;
};
