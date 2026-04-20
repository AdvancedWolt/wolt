#ifndef ICommand_HPP
#define ICommand_HPP

class ICommand {
    public:

        // Virtual destructor ensures derived class destructors are called, preventing memory leaks. 
        virtual ~ICommand() {}

        virtual void execute() = 0;
};

#endif
