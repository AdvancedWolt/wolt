#include "TxtFile.hpp"
#include <algorithm>
#include <filesystem>
#include <fstream>
#include <sstream>

namespace {

bool tryParseNonNegativeInt(const std::string& text, int& value)
{
    if (text.empty()) {
        return false;
    }

    for (const char character : text) {
        if (character < '0' || character > '9') {
            return false;
        }
    }

    value = std::stoi(text);
    return true;
}

bool persistProductsByUser(const std::string& filepath,
                          const std::unordered_map<User, std::unordered_set<Product>>& productsByUser)
{
    std::ofstream outputFile(filepath, std::ios::trunc);
    if (!outputFile.is_open()) {
        return false;
    }

    std::vector<int> userIds;
    userIds.reserve(productsByUser.size());
    for (const auto& pair : productsByUser) {
        if (!pair.second.empty()) {
            userIds.push_back(pair.first.getId());
        }
    }

    std::sort(userIds.begin(), userIds.end());

    for (const int userId : userIds) {
        const auto iterator = productsByUser.find(User(userId));
        if (iterator == productsByUser.end() || iterator->second.empty()) {
            continue;
        }

        std::vector<int> productIds;
        productIds.reserve(iterator->second.size());
        for (const Product& product : iterator->second) {
            productIds.push_back(product.getId());
        }

        std::sort(productIds.begin(), productIds.end());

        outputFile << userId << '\t';
        for (std::size_t index = 0; index < productIds.size(); ++index) {
            if (index > 0) {
                outputFile << ' ';
            }

            outputFile << productIds[index];
        }
        outputFile << '\n';

        if (!outputFile.good()) {
            return false;
        }
    }

    return outputFile.good();
}

}

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
        std::istringstream lineStream(line);
        std::string userIdToken;
        if (!(lineStream >> userIdToken)) {
            continue;
        }

        int userId = 0;
        if (!tryParseNonNegativeInt(userIdToken, userId)) {
            continue;
        }

        const User user(userId);
        bool hasAtLeastOneProduct = false;
        std::string productIdToken;
        while (lineStream >> productIdToken) {
            int productId = 0;
            if (!tryParseNonNegativeInt(productIdToken, productId)) {
                continue;
            }

            m_productsByUser[user].insert(Product(productId));
            hasAtLeastOneProduct = true;
        }

        if (!hasAtLeastOneProduct) {
            m_productsByUser.erase(user);
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

Status TxtFile::addProducts(const User& user, const std::vector<Product>& products)
{
    auto& userProducts = m_productsByUser[user];
    bool hasChanges = false;

    for (const auto& product : products) {
        const auto [_, inserted] = userProducts.insert(product);
        if (inserted) {
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        return Status::ok;
    }

    if (!persistProductsByUser(m_filepath, m_productsByUser)) {
        return Status::noContent;
    }

    return Status::ok;
}


Status TxtFile::deleteProductsFromUser(const User& user, const std::vector<Product>& products)
{
    auto userProductsIterator = m_productsByUser.find(user);
    if (userProductsIterator == m_productsByUser.end()) {
        return Status::notFound;
    }

    auto& userProducts = userProductsIterator->second;
    bool hasChanges = false;

    for (const auto& product : products) {
        const size_t erasedCount = userProducts.erase(product);
        if (erasedCount > 0) {
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        return Status::ok;
    }

    if (userProducts.empty()) {
        m_productsByUser.erase(userProductsIterator);
    }

    if (!persistProductsByUser(m_filepath, m_productsByUser)) {
        return Status::noContent;
    }

    return Status::ok;
}

Status TxtFile::patchProducts(const User& user,const std::vector<Product>& products)
{
    if(!doesUserExist(user)) {
        return Status::notFound;
    }
    return addProducts(user, products);
}

bool TxtFile::doesUserExist(const User& user)
{
    return m_productsByUser.find(user) != m_productsByUser.end();
}

std::vector<User> TxtFile::getUsersWithProduct(const Product& p)
{
    std::vector<User> users;
    for (const auto& pair : m_productsByUser) {
        if (pair.second.find(p) != pair.second.end()) {
            users.push_back(pair.first);
        }
    }
    return users;
}