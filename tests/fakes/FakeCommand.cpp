#include "FakeCommand.hpp"

std::string FakeCommand::getSyntax() const {
    return "fake\n";
}

models::CommandResult FakeCommand::execute(const models::ParsedCommand& cmd, IdbManager& db) {
    (void)cmd;
    (void)db;
    return {true, "Fake command executed successfully.\n"};
}