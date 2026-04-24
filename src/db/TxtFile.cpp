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

const Idatabase::ProductsByUser& TxtFile::getProductsByUser() const
{
    return m_productsByUser;
}

bool TxtFile::addProducts(const std::string& userId,
                          const std::vector<std::string>& productIds)
{
    std::ofstream outputFile(m_filepath, std::ios::app);
    if (!outputFile.is_open()) {
        return false;
    }

    for (const std::string& productId : productIds) {
        outputFile << userId << '\t' << productId << std::endl;
        if (!outputFile.good()) {
            return false;
        }

        m_productsByUser[userId].push_back(productId);
    }

    return true;
}
