#ifndef HELPCOMMAND_HPP
#define HELPCOMMAND_HPP

#include "ICommand.hpp"
#include <map>          
#include <string>       
#include <ostream>      

class HelpCommand : public ICommand {
    private:
        const std::map<int, ICommand*>& commands;

    public: 
        HelpCommand(const std::map<int, ICommand*>& allCommands);
        void execute(std::ostream& out) override;
        virtual std::string getSyntax() override;
};

#endif
