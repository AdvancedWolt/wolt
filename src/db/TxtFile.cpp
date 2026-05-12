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
        if (!(lineStream >> userIdToken)) {
            continue;
        }

        int userId = 0;
        if (!txtFileParsing::tryParseNonNegativeInt(userIdToken, userId)) {
            continue;
        }
        // Create the user object and parse the product IDs into the set.
        const User user(userId);
        bool hasAtLeastOneProduct = false;
        std::string productIdToken;
        while (lineStream >> productIdToken) {
            int productId = 0;
            if (!txtFileParsing::tryParseNonNegativeInt(productIdToken, productId)) {
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

    // Collect all users from the map keys.
    for (const auto& pair : m_productsByUser) {
        users.push_back(pair.first);
    }

    return users;
}

Status TxtFile::addProducts(const User& user, const std::vector<Product>& products)
{
    auto& userProducts = m_productsByUser[user];
    bool hasChanges = false;

    // Add only new products; duplicates are ignored by the set.
    for (const auto& product : products) {
        const auto [_, inserted] = userProducts.insert(product);
        if (inserted) {
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        return Status::ok;
    }

    // Persist only the affected user line.
    if (!txtFileParsing::upsertUserProductsLine(m_filepath, user, userProducts)) {
        return Status::noContent;
    }

    return Status::ok;
}


Status TxtFile::deleteProductsFromUser(const User& user, const std::vector<Product>& products)
{
    // check if user exits. If not, return not found without modifying the file.
    auto userProductsIterator = m_productsByUser.find(user);
    if (userProductsIterator == m_productsByUser.end()) {
        return Status::notFound;
    }

    auto& userProducts = userProductsIterator->second;
    bool hasChanges = false;

    // remove only existing products; non-existing products are ignored.
    for (const auto& product : products) {
        const size_t erasedCount = userProducts.erase(product);
        if (erasedCount > 0) {
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        return Status::ok;
    }

    // If the user has no more products, remove the user line entirely.
    if (userProducts.empty()) {
        m_productsByUser.erase(userProductsIterator);
        if (!txtFileParsing::removeUserProductsLine(m_filepath, user)) {
            return Status::noContent;
        }
        return Status::ok;
    }

    if (!txtFileParsing::upsertUserProductsLine(m_filepath, user, userProducts)) {
        return Status::noContent;
    }

    return Status::ok;
}

// Patch behaves like add, but only for an existing user.
Status TxtFile::patchProducts(const User& user, const std::vector<Product>& products)
{
    if (!doesUserExist(user)) {
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
    // Collect users that contain the requested product.
    for (const auto& pair : m_productsByUser) {
        if (pair.second.find(p) != pair.second.end()) {
            users.push_back(pair.first);
        }
    }
    return users;
}

std::vector<User> TxtFile::getUsersWithProducts(const std::vector<const Product>& targetProducts)
{
    std::vector<User> users;
    for (const auto& pair : m_productsByUser) {
        const auto& userProducts = pair.second;
        // Assume the user has all target products until one is missing.
        bool hasAllTargetProducts = true;
        for (const auto& targetProduct : targetProducts) {
            // Stop early once a required product is missing.
            if (userProducts.find(targetProduct) == userProducts.end()) {
                hasAllTargetProducts = false;
                break;
            }
        }

        // Keep users that match all target products.
        if (hasAllTargetProducts) {
            users.push_back(pair.first);
        }
    }
    return users;
}