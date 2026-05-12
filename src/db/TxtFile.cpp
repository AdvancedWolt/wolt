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

        const std::string userIdText = line.substr(0, separatorPosition);
        const std::string productIdText = line.substr(separatorPosition + 1);

        if (!userIdText.empty() && !productIdText.empty()) {
            m_productsByUser[User(userIdText)].insert(Product(productIdText));
        }
    }

    return inputFile.good() || inputFile.eof();
}

std::vector<Product> TxtFile::getProductsForUser(const User& user) const
{
    const auto userProductsIterator = m_productsByUser.find(user);
    if (userProductsIterator == m_productsByUser.end()) {
        return {};
    }

    return std::vector<Product>(userProductsIterator->second.begin(),
                                userProductsIterator->second.end());
}

std::vector<User> TxtFile::getAllUsers() const
{
    std::vector<User> users;
    users.reserve(m_productsByUser.size());

    for (const auto& pair : m_productsByUser) {
        users.push_back(pair.first);
    }

    return users;
}

bool TxtFile::addProducts(const User& user, const std::vector<Product>& products)
{
    std::ofstream outputFile(m_filepath, std::ios::app);
    if (!outputFile.is_open()) {
        return false;
    }

    auto& userProducts = m_productsByUser[user];

    for (const Product& product : products) {
        if (userProducts.find(product) != userProducts.end()) {
            continue;
        }

        outputFile << user.getId() << '\t' << product.getId() << std::endl;
        if (!outputFile.good()) {
            return false;
        }

        userProducts.insert(product);
    }

    return true;
}

bool TxtFile::hasUser(const User& user) const
{
    return m_productsByUser.find(user) != m_productsByUser.end();
}