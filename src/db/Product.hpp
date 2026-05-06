#pragma once

#include <functional>

class Product{
private:
    int m_id;
public:
    Product(const int id);
    int getId() const;
    bool operator==(const Product& other) const;
};

namespace std {
    template <>
    struct hash<Product> {
        std::size_t operator()(const Product& product) const noexcept {
            return std::hash<int>{}(product.getId());
        }
    };
}