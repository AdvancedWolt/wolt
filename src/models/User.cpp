#include "models/User.hpp"

User::User(std::string id) : m_id(std::move(id)) {}

const std::string& User::getId() const { return m_id; }

bool User::operator==(const User& other) const { return m_id == other.m_id; }