#pragma once

#include "Status.hpp"

#include <string>

namespace models {

// Wire response from a command. Status code + optional body.
// Construct via the static factories so the status/body shape stays consistent.
class Response {
public:
    static Response ok(std::string body = "");
    static Response created();
    static Response badRequest();
    static Response notFound();
    static Response noContent();

    Status status() const { return m_status; }
    const std::string& body() const { return m_body; }

    // Status line, then a blank line + body iff body is non-empty.
    std::string toWire() const;

private:
    Response(Status status, std::string body);
    Response(Status status);
    Status m_status;
    std::string m_body;
};

} // namespace models
