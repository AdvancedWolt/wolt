#include "models/Response.hpp"

#include <array>
#include <format>
#include <string_view>
#include <utility>

namespace models {
namespace {

constexpr std::array<std::pair<Status, std::string_view>, 5> kStatusPhrases = {{
    {Status::ok,         "Ok"},
    {Status::created,    "Created"},
    {Status::noContent,  "No Content"},
    {Status::badRequest, "Bad Request"},
    {Status::notFound,   "Not Found"},
}};

std::string_view phraseFor(Status status)
{
    for (const auto& [s, phrase] : kStatusPhrases) {
        if (s == status) return phrase;
    }
    return {};
}

std::string statusLine(Status status)
{
    if (status == Status::none) {
        return "";
    }
    return std::format("{} {}\n", static_cast<int>(status), phraseFor(status));
}

} // namespace

Response::Response(Status status, std::string body)
    : m_status(status), m_body(std::move(body))
{}

Response::Response(Status status)
    : m_status(status), m_body("")
{}

Response Response::ok(std::string body) { return Response(Status::ok, std::move(body)); }
Response Response::created()            { return Response(Status::created); }
Response Response::badRequest()         { return Response(Status::badRequest); }
Response Response::notFound()           { return Response(Status::notFound); }
Response Response::noContent()          { return Response(Status::noContent); }

Response Response::bodyOnly(std::string body)
{
    return Response(Status::none, std::move(body));
}

std::string Response::toWire() const
{
    if (m_status == Status::none) {
        std::string out = m_body;
        if (!out.empty() && out.back() != '\n') {
            out += '\n';
        }
        return out;
    }

    std::string line = statusLine(m_status);

    if (m_body.empty()) {
        return line;
    }
    
    return line + "\n" + m_body + (m_body.back() == '\n' ? "" : "\n");
}

} // namespace models