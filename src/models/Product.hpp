#pragma once
#include <string>
#include <functional>

struct Product {
    std::string id;

    Product(const std::string& newId) : id(newId) {}

    bool operator==(const Product& other) const { return id == other.id; }
};

namespace std {
    template <>
    struct hash<Product> {
        std::size_t operator()(const Product& p) const noexcept {
            return std::hash<std::string>{}(p.id);
        }
    };
}