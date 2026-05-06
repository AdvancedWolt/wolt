#pragma once

#include "ICommand.hpp"

// A fake command used for testing
class FakeCommand : public ICommand {
    public:
        static const std::string s_syntax;

        void execute(std::ostream& out) override;
        std::string getSyntax() const override { return s_syntax; }
};
