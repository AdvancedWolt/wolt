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

std::vector<std::string> buildUserProductsLines(const int userId,
                                                const std::unordered_set<Product>& products)
{
    std::vector<int> productIds;
    productIds.reserve(products.size());
    for (const Product& product : products) {
        productIds.push_back(product.getId());
    }

    std::sort(productIds.begin(), productIds.end());

    std::vector<std::string> lines;
    lines.reserve(productIds.size());
    for (const int productId : productIds) {
        std::ostringstream lineStream;
        lineStream << userId << '\t' << productId;
        lines.push_back(lineStream.str());
    }

    return lines;
}

bool upsertUserProductsLine(const std::string& filepath,
                            const User& user,
                            const std::unordered_set<Product>& products)
{
    const int targetUserId = user.getId();
    const std::vector<std::string> updatedLines = buildUserProductsLines(targetUserId, products);

    std::vector<std::string> lines;
    std::ifstream inputFile(filepath);
    if (inputFile.is_open()) {
        std::string line;
        while (std::getline(inputFile, line)) {
            std::istringstream lineStream(line);
            std::string userIdToken;
            if (lineStream >> userIdToken) {
                int parsedUserId = 0;
                if (tryParseNonNegativeInt(userIdToken, parsedUserId) && parsedUserId == targetUserId) {
                    // Drop every existing line for this user; replacements are appended below.
                    continue;
                }
            }

            lines.push_back(line);
        }

        if (!inputFile.good() && !inputFile.eof()) {
            return false;
        }
    }

    lines.insert(lines.end(), updatedLines.begin(), updatedLines.end());

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

bool appendUserProductLines(const std::string& filepath,
                            const User& user,
                            const std::vector<Product>& products)
{
    if (products.empty()) {
        return true;
    }

    std::ofstream outputFile(filepath, std::ios::app);
    if (!outputFile.is_open()) {
        return false;
    }

    const int userId = user.getId();
    for (const Product& product : products) {
        outputFile << userId << '\t' << product.getId() << '\n';
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
