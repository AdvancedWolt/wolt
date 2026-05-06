#pragma once

#include "ICommand.hpp"
#include <memory>
#include <string>
#include <vector>

class HelpCommand : public ICommand {
    private:
        static const std::string s_syntax;

        const std::vector<std::shared_ptr<ICommand>>& m_commands;

    public:
        static std::string syntax() { return s_syntax; }

        explicit HelpCommand(const std::vector<std::shared_ptr<ICommand>>& commands);

        void execute(std::ostream& out) override;
        std::string getSyntax() const override { return s_syntax; }
};

