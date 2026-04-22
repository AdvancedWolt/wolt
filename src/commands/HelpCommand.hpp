#pragma once

#include "ICommand.hpp"
#include <vector>          

class HelpCommand : public ICommand {
    private:
        const std::vector<std::shared_ptr<ICommand>>& commands;

    public: 
        HelpCommand(const std::vector<std::shared_ptr<ICommand>>& allCommands);
        void execute(std::ostream& out) override;
        virtual std::string getSyntax() const override;
};

