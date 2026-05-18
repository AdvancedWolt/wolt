#include "TxtFileParsing.hpp"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <vector>

namespace txtFileParsing {

namespace {

std::string buildUserProductsLine(const std::string& userId,
                                  const std::unordered_set<Product>& products)
{
    std::vector<std::string> productIds;
    productIds.reserve(products.size());
    for (const Product& product : products) {
        productIds.push_back(product.getId());
    }
    std::sort(productIds.begin(), productIds.end());

    std::ostringstream lineStream;
    lineStream << userId;
    for (const std::string& productId : productIds) {
        lineStream << '\t' << productId;
    }
    return lineStream.str();
}

}  // namespace

bool upsertUserProductsLine(const std::string& filepath,
                            const User& user,
                            const std::unordered_set<Product>& products)
{
    const std::string& targetUserId = user.getId();
    const std::string newLine = buildUserProductsLine(targetUserId, products);

    std::vector<std::string> lines;
    std::ifstream inputFile(filepath);
    if (inputFile.is_open()) {
        std::string line;
        while (std::getline(inputFile, line)) {
            std::istringstream lineStream(line);
            std::string userIdToken;
            if (lineStream >> userIdToken && userIdToken == targetUserId) {
                // Drop the existing line for this user; it gets replaced.
                continue;
            }
            lines.push_back(line);
        }
        if (!inputFile.good() && !inputFile.eof()) {
            return false;
        }
    }

    lines.push_back(newLine);

    std::ofstream outputFile(filepath, std::ios::trunc);
    if (!outputFile.is_open()) {
        return false;
    }

    for (const std::string& currentLine : lines) {
        outputFile << currentLine << '\n';
        if (!outputFile.good()) {
            return false;
        }
    }

    return outputFile.good();
}

bool appendUserProductLine(const std::string& filepath,
                           const User& user,
                           const std::unordered_set<Product>& products)
{
    if (products.empty()) {
        return true;
    }

    std::ofstream outputFile(filepath, std::ios::app);
    if (!outputFile.is_open()) {
        return false;
    }

    outputFile << buildUserProductsLine(user.getId(), products) << '\n';
    return outputFile.good();
}

bool removeUserProductsLine(const std::string& filepath, const User& user)
{
    const std::string& targetUserId = user.getId();
    std::ifstream inputFile(filepath);
    if (!inputFile.is_open()) {
        return false;
    }

    std::vector<std::string> lines;
    std::string line;

    while (std::getline(inputFile, line)) {
        std::istringstream lineStream(line);
        std::string userIdToken;
        if (lineStream >> userIdToken && userIdToken == targetUserId) {
            continue;
        }

        lines.push_back(line);
    }

    if (!inputFile.good() && !inputFile.eof()) {
        return false;
    }

    std::ofstream outputFile(filepath, std::ios::trunc);
    if (!outputFile.is_open()) {
        return false;
    }

    for (const std::string& currentLine : lines) {
        outputFile << currentLine << '\n';
        if (!outputFile.good()) {
            return false;
        }
    }

    return outputFile.good();
}

} // namespace txtFileParsing
