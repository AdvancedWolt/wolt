#include "TxtFile.hpp"
#include "TxtFileParsing.hpp"

#include <filesystem>
#include <fstream>
#include <sstream>

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
    // Read the file line by line and populate the in-memory map.
    std::string line;
    while (std::getline(inputFile, line)) {
        std::istringstream lineStream(line);
        std::string userIdToken;
        if (!(lineStream >> userIdToken) || userIdToken.empty()) {
            continue;
        }

        const User user(userIdToken);
        bool hasAtLeastOneProduct = false;
        std::string productIdToken;
        while (lineStream >> productIdToken) {
            if (productIdToken.empty()) {
                continue;
            }
            m_productsByUser[user].insert(Product(productIdToken));
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

models::Status TxtFile::addProducts(const User& user, const std::vector<Product>& products)
{
    const auto [userIterator, userCreated] = m_productsByUser.try_emplace(user);
    auto& userProducts = userIterator->second;

    std::vector<Product> newlyInserted;
    for (const auto& product : products) {
        const auto [_, inserted] = userProducts.insert(product);
        if (inserted) {
            newlyInserted.push_back(product);
        }
    }

    if (newlyInserted.empty()) {
        if (userCreated) {
            m_productsByUser.erase(userIterator);
        }
        return models::Status::ok;
    }

    // Existing user: rewrite their line. New user: append a single new line.
    const bool diskOk = userCreated
        ? txtFileParsing::appendUserProductLine(m_filepath, user, userProducts)
        : txtFileParsing::upsertUserProductsLine(m_filepath, user, userProducts);

    if (!diskOk) {
        // Disk write failed - roll back the in-memory insertions so the
        // map matches what's on disk.
        for (const auto& product : newlyInserted) {
            userProducts.erase(product);
        }
        if (userCreated) {
            m_productsByUser.erase(userIterator);
        }
        return models::Status::noContent;
    }

    return models::Status::ok;
}

models::Status TxtFile::deleteProductsFromUser(const User& user, const std::vector<Product>& products)
{
    auto userProductsIterator = m_productsByUser.find(user);
    if (userProductsIterator == m_productsByUser.end()) {
        return models::Status::notFound;
    }

    auto& userProducts = userProductsIterator->second;
    std::vector<Product> actuallyErased;

    for (const auto& product : products) {
        if (userProducts.erase(product) > 0) {
            actuallyErased.push_back(product);
        }
    }

    if (actuallyErased.empty()) {
        return models::Status::ok;
    }

    const bool willRemoveUser = userProducts.empty();
    const bool diskOk = willRemoveUser
        ? txtFileParsing::removeUserProductsLine(m_filepath, user)
        : txtFileParsing::upsertUserProductsLine(m_filepath, user, userProducts);

    if (!diskOk) {
        // Roll back: re-insert the products we just erased.
        for (const auto& product : actuallyErased) {
            userProducts.insert(product);
        }
        return models::Status::noContent;
    }

    if (willRemoveUser) {
        m_productsByUser.erase(userProductsIterator);
    }

    return models::Status::ok;
}

// Patch behaves like add, but only for an existing user.
models::Status TxtFile::patchProducts(const User& user, const std::vector<Product>& products)
{
    if (!hasUser(user)) {
        return models::Status::notFound;
    }

    return addProducts(user, products);
}

bool TxtFile::hasUser(const User& user) const
{
    return m_productsByUser.find(user) != m_productsByUser.end();
}

std::vector<User> TxtFile::getUsersWithProduct(const Product& p) const
{
    std::vector<User> users;
    for (const auto& pair : m_productsByUser) {
        if (pair.second.find(p) != pair.second.end()) {
            users.push_back(pair.first);
        }
    }
    return users;
}
