#pragma once

#include "commands/ICommand.hpp"
#include "db/IdbManager.hpp"
#include "models/User.hpp"
#include "models/Product.hpp"

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>

class GetCommand : public ICommand {
public:
    GetCommand() = default;

    models::CommandResult execute(const models::ParsedCommand& cmd, IdbManager& db) override;
    std::string getSyntax() const override;

private:
    static constexpr std::size_t MAX_RECOMMENDATIONS = 10;

    std::unordered_map<std::string, int> countSimilarities(
        IdbManager& db,
        const std::string& targetUserId,
        const std::vector<std::string>& targetUserProducts);

    std::unordered_map<std::string, int> computeRelevence(
        IdbManager& db,
        const std::string& targetUserId,
        const std::string& targetProduct,
        const std::vector<std::string>& targetUserProducts,
        const std::unordered_map<std::string, int>& userWeights);

    std::vector<std::string> getUsersWithProduct(
        IdbManager& db,
        const std::string& targetProduct);

    std::vector<std::pair<std::string, int>> sortRelevence(
        const std::unordered_map<std::string, int>& productRelevence);
};