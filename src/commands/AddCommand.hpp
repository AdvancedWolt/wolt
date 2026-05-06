#pragma once

#include "ICommand.hpp"
#include "../db/Idatabase.hpp"
#include <memory>
#include <string>
#include <vector>

class AddCommand : public ICommand {
    private:
        std::shared_ptr<Idatabase> m_database;
        std::string m_userId;
        std::vector<std::string> m_productIds;

    public:
        static const std::string s_syntax;

        AddCommand(std::shared_ptr<Idatabase> database,
                   std::string userId,
                   std::vector<std::string> productIds);

        void execute(std::ostream& out) override;
        std::string getSyntax() const override { return s_syntax; }
};
