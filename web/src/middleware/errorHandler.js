function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({ error: "Internal server error" });
}

module.exports = { errorHandler };
