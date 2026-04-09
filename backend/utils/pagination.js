const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses and sanitizes pagination params from req.query
 */
const parsePaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Builds the pagination metadata for the response
 */
const buildPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

module.exports = { parsePaginationParams, buildPaginationMeta };