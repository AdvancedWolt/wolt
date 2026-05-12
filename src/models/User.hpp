#pragma once

#include <functional>
#include <string>

class User {
public:
    explicit User(std::string id);

    const std::string& getId() const;

    bool operator==(const User& other) const;

private:
    std::string m_id;
};

namespace std {
    template <>
    struct hash<User> {
        std::size_t operator()(const User& u) const noexcept {
            return std::hash<std::string>{}(u.getId());
        }
    };
}