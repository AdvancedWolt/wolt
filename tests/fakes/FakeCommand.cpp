#include "FakeCommand.hpp"

std::string FakeCommand::getSyntax() const {
    return "fake\n";
}

models::Response FakeCommand::execute(const models::ParsedCommand& cmd, IdbManager& db) {
    (void)cmd;
    (void)db;
    return models::Response::ok("Fake command executed successfully.\n");
}
