#include "TxtFileParsing.hpp"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <vector>

namespace txtFileParsing {

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

std::string buildUserProductsLine(const int userId,
                                  const std::unordered_set<Product>& products)
{
    std::vector<int> productIds;
    productIds.reserve(products.size());
    for (const Product& product : products) {
        productIds.push_back(product.getId());
    }

    std::sort(productIds.begin(), productIds.end());

    std::ostringstream line;
    line << userId;
    for (const int productId : productIds) {
        line << '\t' << productId;
    }

    return line.str();
}

bool upsertUserProductsLine(const std::string& filepath,
                            const User& user,
                            const std::unordered_set<Product>& products)
{
    const int targetUserId = user.getId();
    const std::string updatedLine = buildUserProductsLine(targetUserId, products);

    std::ifstream inputFile(filepath);
    if (!inputFile.is_open()) {
        std::ofstream outputFile(filepath, std::ios::app);
        if (!outputFile.is_open()) {
            return false;
        }

        outputFile << updatedLine << '\n';
        return outputFile.good();
    }

    std::vector<std::string> lines;
    std::string line;
    bool replacedExistingLine = false;

    while (std::getline(inputFile, line)) {
        std::istringstream lineStream(line);
        std::string userIdToken;
        if (lineStream >> userIdToken) {
            int parsedUserId = 0;
            if (tryParseNonNegativeInt(userIdToken, parsedUserId) && parsedUserId == targetUserId) {
                if (!replacedExistingLine) {
                    lines.push_back(updatedLine);
                    replacedExistingLine = true;
                }
                continue;
            }
        }

        lines.push_back(line);
    }

    if (!inputFile.good() && !inputFile.eof()) {
        return false;
    }

    if (!replacedExistingLine) {
        lines.push_back(updatedLine);
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

bool removeUserProductsLine(const std::string& filepath, const User& user)
{
    const int targetUserId = user.getId();
    std::ifstream inputFile(filepath);
    if (!inputFile.is_open()) {
        return false;
    }

    std::vector<std::string> lines;
    std::string line;

    while (std::getline(inputFile, line)) {
        std::istringstream lineStream(line);
        std::string userIdToken;
        if (lineStream >> userIdToken) {
            int parsedUserId = 0;
            if (tryParseNonNegativeInt(userIdToken, parsedUserId) && parsedUserId == targetUserId) {
                continue;
            }
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
