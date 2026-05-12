#include "models/Product.hpp"

Product::Product(std::string id) : m_id(std::move(id)) {}

const std::string& Product::getId() const { return m_id; }

bool Product::operator==(const Product& other) const { return m_id == other.m_id; }