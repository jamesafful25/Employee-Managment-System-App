const { parsePaginationParams } = require('../utils/pagination');

const paginationMiddleware = (req, res, next) => {
    req.pagination = parsePaginationParams(req.query);
    next();
};
module.exports = paginationMiddleware;