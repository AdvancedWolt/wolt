#pragma once

#include "commands/ICommand.hpp" 

class HelpCommand : public ICommand {
private:
    std::vector<std::string> m_syntaxes;

public:
    HelpCommand(const std::vector<std::string>& syntaxes);

    std::string getSyntax() const override;
    models::CommandResult execute(const models::ParsedCommand& cmd, Idatabase& db) override;
};