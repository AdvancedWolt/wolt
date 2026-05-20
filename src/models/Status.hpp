#pragma once

namespace models {

enum class Status : int {
    none = 0,
    ok = 200,
    created = 201,
    noContent = 204,
    badRequest = 400,
    notFound = 404
};

} // namespace models
