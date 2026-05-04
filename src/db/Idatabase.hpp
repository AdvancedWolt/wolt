#pragma once

#include <string>
#include <vector>

class Idatabase {
    public:
        virtual ~Idatabase() = default;

        virtual bool initialize() = 0;
        virtual bool load() = 0;
        virtual std::vector<std::string> getProductsForUser(const std::string& userId) const = 0;
        virtual std::vector<std::string> getAllUserIds() const = 0;
        virtual bool addProducts(const std::string& userId,
                                 const std::vector<std::string>& productIds) = 0;
};
