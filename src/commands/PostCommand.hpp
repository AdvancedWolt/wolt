#pragma once

#include "ICommand.hpp"
#include "db/IdbManager.hpp"
#include <memory>
#include <string>
#include <vector>

class PostCommand : public ICommand {
    private:
        std::shared_ptr<IdbManager> m_database;
        std::string m_userId;
        std::vector<std::string> m_productIds;

    public:
        static const std::string s_syntax;

        PostCommand(std::shared_ptr<IdbManager> database,
                    std::string userId,
                    std::vector<std::string> productIds);

        void execute(std::ostream& out) override;
        std::string getSyntax() const override { return s_syntax; }
};
