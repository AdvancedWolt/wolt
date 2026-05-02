#pragma once

#include "ICommand.hpp"
#include <string>

class SyntaxCommand : public ICommand {
    private:
        std::string m_syntax;

    public:
        explicit SyntaxCommand(std::string syntax);

        void execute(std::ostream& out) override;
        std::string getSyntax() const override;
};
