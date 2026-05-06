#include "User.hpp"


User::User(const int id) : m_id(id) {}

int User::getId() const {
    return m_id;
}

bool User::operator==(const User& other) const {
    return m_id == other.m_id;
}
