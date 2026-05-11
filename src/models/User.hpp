#pragma once
#include <string>
#include <functional>

struct User {
    std::string id;

    User(const std::string& newId) : id(newId) {}

    bool operator==(const User& other) const { return id == other.id; }
};

namespace std {
    template <>
    struct hash<User> {
        std::size_t operator()(const User& u) const noexcept {
            return std::hash<std::string>{}(u.id);
        }
    };
}