#pragma once

#include "ICommand.hpp"
#include "../db/Idatabase.hpp"
#include <memory>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>

class RecommendCommand : public ICommand {
    private:
        std::shared_ptr<Idatabase> m_database;
        std::string m_userId;
        std::vector<std::string> m_productId;

        std::unordered_map<std::string, int> countSimilarities(const std::vector<std::string>& products);
        std::unordered_map<std::string, int> computeRelevence(const std::vector<std::string>& targetUserProducts,
     std::unordered_map<std::string, int> userWeights);
        std::vector<std::string> getUsersWithProduct(const std::string& targetProduct);

        std::vector<std::pair<std::string, int>> sortRelevence(std::unordered_map<std::string, int> productRelevence);

    public:
        static const std::string s_syntax;

        RecommendCommand(std::shared_ptr<Idatabase> database,
                         std::string userId,
                         std::vector<std::string> productId);

        void execute(std::ostream& out) override;
        std::string getSyntax() const override { return s_syntax; }
};
