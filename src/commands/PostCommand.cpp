#include "PostCommand.hpp"
#include "models/User.hpp"
#include <stdexcept>

std::string PostCommand::getSyntax() const 
{
    std::ostringstream oss;
    oss << "POST [userid] [productid1] [productid2] ..." << std::endl;
    return oss.str();
}


models::CommandResult execute(const models::ParsedCommand& cmd, Idatabase& db)
{
    // Check for valid syntax length (needs at least userid and one productid)
    if (cmd.args.size() < 2) {
        return {false, "400 Bad Request\n"};
    }

    const std::string userId = cmd.args[0];

    const User user(userId);

    /* commented out, DB doesn't have the right functions yet.
    // POST is only valid if the user DOES NOT exist yet.
    if (db.hasUser(userId)) { 
        return {false, "404 Not Found\n"};
    }
        */
}