#pragma once

namespace models {

enum class Status : int {
    ok = 200,
    created = 201,
    noContent = 204,
    badRequest = 400,
    notFound = 404
};

} // namespace models
