#pragma once

#include "commands/ICommand.hpp"
#include "db/DbHelper.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>

class GetCommand : public ICommand {
public:
    GetCommand() = default;

    models::Response execute(const models::ParsedCommand& cmd, IdbManager& db) override;
    std::string getSyntax() const override;

private:
    static constexpr std::size_t MAX_RECOMMENDATIONS = 10;

    std::unordered_map<std::string, int> countSimilarities(
        const std::string& targetUserId,
        const std::unordered_set<std::string>& targetUserProducts,
        const dbHelper::ProductsByUser& productsByUser);

    std::unordered_map<std::string, int> computeRelevance(
        const std::string& targetUserId,
        const std::string& targetProduct,
        const std::unordered_set<std::string>& targetUserProducts,
        const std::unordered_map<std::string, int>& userWeights,
        const dbHelper::ProductsByUser& productsByUser);

    std::vector<std::pair<std::string, int>> sortRelevance(
        const std::unordered_map<std::string, int>& productRelevance);
};
