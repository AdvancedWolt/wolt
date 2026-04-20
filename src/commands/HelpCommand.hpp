#ifndef HELPCOMMAND_HPP
#define HELPCOMMAND_HPP

#include "ICommand.hpp"

class HelpCommand : public ICommand {
    public: 
        void execute(std::ostream& out) override;
        virtual std::string getSyntax() override;
};

#endif
