#ifndef ICommand_HPP
#define ICommand_HPP

#include <strstream>
#include <string>

class ICommand {
    public:
        // Virtual destructor ensures derived class destructors are called, preventing memory leaks. 
        virtual ~ICommand() {}
        
        // using os
        virtual void execute(std::ostream& out) = 0;
        virtual std::string getSyntax() = 0;
};

#endif
