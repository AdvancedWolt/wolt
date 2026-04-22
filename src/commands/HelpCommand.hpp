#pragma once

#include "ICommand.hpp"
#include <vector>          
#include <string>       
#include <ostream>      

class HelpCommand : public ICommand {
    private:
        const std::vector<ICommand*>& commands;

    public: 
        HelpCommand(const std::vector<ICommand*>& allCommands);
        void execute(std::ostream& out) override;
        virtual std::string getSyntax() const override;
};
