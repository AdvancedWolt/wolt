#pragma once

#include "Status.hpp"

#include <string>

namespace models {

class Response {
public:
    static Response ok(std::string body = "");
    static Response created();
    static Response badRequest();
    static Response notFound();
    static Response noContent();

    static Response bodyOnly(std::string body);

    Status status() const { return m_status; }
    const std::string& body() const { return m_body; }

    std::string toWire() const;

private:
    Response(Status status, std::string body);
    Response(Status status);

    Status m_status;
    std::string m_body;
};

} // namespace models