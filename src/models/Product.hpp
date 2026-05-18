#pragma once

#include <functional>
#include <string>

class Product {
public:
    explicit Product(std::string id);

    const std::string& getId() const;

    bool operator==(const Product& other) const;

private:
    std::string m_id;
};

namespace std {
    template <>
    struct hash<Product> {
        std::size_t operator()(const Product& p) const noexcept {
            return std::hash<std::string>{}(p.getId());
        }
    };
}