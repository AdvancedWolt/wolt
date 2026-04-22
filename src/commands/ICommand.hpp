#pragma once

#include <ostream>
#include <string>

class ICommand {
    public:
        // Virtual destructor ensures derived class destructors are called, preventing memory leaks. 
        virtual ~ICommand() {}
        
        virtual void execute(std::ostream& out) = 0;
        virtual std::string getSyntax() const = 0;
};
