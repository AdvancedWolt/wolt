#ifndef HELPCOMMAND_HPP
#define HELPCOMMAND_HPP

#include "ICommand.hpp"
#include <vector>          
#include <string>       
#include <ostream>      

class HelpCommand : public ICommand {
    private:
        // Store a list of all commands 
        const std::vector<ICommand*>& commands;
    public: 
        HelpCommand(const std::vector<ICommand*>& allCommands);
        void execute(std::ostream& out) override;
        virtual std::string getSyntax() override;
};

#endif
