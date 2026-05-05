#include "TxtFile.hpp"
#include <filesystem>
#include <fstream>

TxtFile::TxtFile(const std::string& filepath) : m_filepath(filepath)
{}

bool TxtFile::initialize()
{
    const std::filesystem::path filePath(m_filepath);
    // Make sure the directory and file exist before appending data.
    const std::filesystem::path parentPath = filePath.parent_path();

    if (!parentPath.empty()) {
        std::error_code errorCode;
        std::filesystem::create_directories(parentPath, errorCode);
        if (errorCode) {
            return false;
        }
    }

    if (std::filesystem::exists(filePath)) {
        return true;
    }

    std::ofstream outputFile(m_filepath, std::ios::app);
    return outputFile.good();
}

bool TxtFile::load()
{
    std::ifstream inputFile(m_filepath);
    if (!inputFile.is_open()) {
        return false;
    }

    m_productsByUser.clear();

    std::string line;
    while (std::getline(inputFile, line)) {
        const std::size_t separatorPosition = line.find('\t');
        if (separatorPosition == std::string::npos) {
            continue;
        }

        const std::string userId = line.substr(0, separatorPosition);
        const std::string productId = line.substr(separatorPosition + 1);

        if (!userId.empty() && !productId.empty()) {
            m_productsByUser[userId].push_back(productId);
        }
    }

    return inputFile.good() || inputFile.eof();
}

std::vector<Product> TxtFile::getProductsForUser(const User& user) const
{
    const auto userProductsIterator = m_productsByUser.find(std::to_string(user.getId()));
    if (userProductsIterator == m_productsByUser.end()) {
        return {};
    }

    std::vector<Product> products;
    for (const auto& productId : userProductsIterator->second) {
        products.emplace_back(std::stoi(productId));
    }
    return products;
}

std::vector<User> TxtFile::getAllUsers() const
{
    std::vector<User> users;
    
    // Reserve memory in advance to avoid unnecessary reallocations
    users.reserve(m_productsByUser.size());
    
    for (const auto& pair : m_productsByUser) {
        // pair.first contains the userId (the key)
        users.push_back(User(std::stoi(pair.first)));
    }
    
    return users;
}

bool TxtFile::addProducts(const User& user, const std::vector<Product>& products)
{
    std::ofstream outputFile(m_filepath, std::ios::app);
    if (!outputFile.is_open()) {
        return false;
    }

    const std::string userId = std::to_string(user.getId());

    for (const Product& product : products) {
        const std::string productId = std::to_string(product.getId());
        outputFile << userId << '\t' << productId << std::endl;
        if (!outputFile.good()) {
            return false;
        }

        m_productsByUser[userId].push_back(productId);
    }

    return true;
}
