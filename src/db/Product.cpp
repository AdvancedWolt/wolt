#include "Product.hpp"

Product::Product(const int id) : m_id(id) {}

int Product::getId() const {
    return m_id;
}

bool Product::operator==(const Product& other) const {
    return m_id == other.m_id;
}
