#include "User.hpp"


User::User(const int id) : m_id(id) {}

int User::getId() const {
    return m_id;
}
