#ifndef HELPCOMMAND_HPP
#define HELPCOMMAND_HPP

#include "ICommand.hpp"

class HelpCommand : public ICommand {
    public: 
        void execute() override;
};

#endif
