#pragma once

#include <functional>

class User{
private:
    int m_id;
public:
    User(const int id);
    int getId() const;
    bool operator==(const User& other) const;
};

namespace std {
    template <>
    struct hash<User> {
        std::size_t operator()(const User& user) const noexcept {
            return std::hash<int>{}(user.getId());
        }
    };
}