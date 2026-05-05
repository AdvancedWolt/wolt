#pragma once

#include "ICommand.hpp"

// A fake command used for testing
class FakeCommand : public ICommand {
    public:
        void execute(std::ostream& out) override;
        std::string getSyntax() const override;
};
