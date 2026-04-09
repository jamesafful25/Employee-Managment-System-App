const { Performance, Employee } = require('../model');
const { AppError } = require('../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { Op } = require('sequelize');

//creating a rating for an employee
const createReview = async(reviewerId, data) => {
    if (reviewerId === data.employee_id) throw new AppError('You cannot review yourself', 400);
    const employee = await Employee.findByPk(data.employee_id);
    if (!employee) throw new AppError('Employee not found', 404);
    if (data.rating < 1 || data.rating > 5) throw new AppError('Rating must be between 1 and 5', 400);

    const review = await Performance.create({
        employee_id: data.employee_id,
        reviewed_by: reviewerId,
        rating: data.rating,
        goals: data.goals,
        comments: data.comments,
        review_date: data.review_date || new Date(),
    });
    return review;
};

//getting an employees's own rating/performance review
const getMyPerformance = async(employeeId, query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Performance.findAndCountAll({
        distinct: true,
        where: { employee_id: employeeId },
        include: [
            { model: Employee, as: 'reviewer', attributes: ['id', 'first_name', 'last_name', 'position'] },
        ],
        limit,
        offset,
        order: [
            ['review_date', 'DESC']
        ],
    });
    const averageRating = rows.length > 0 ?
        parseFloat((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length).toFixed(1)) :
        0;
    return { data: rows, averageRating, meta: buildPaginationMeta(count, page, limit) };
};

//getting of an employees rating/performance review
const getEmployeePerformance = async(employeeId, query) => {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Performance.findAndCountAll({
        distinct: true,
        where: { employee_id: employeeId },
        include: [
            { model: Employee, as: 'reviewer', attributes: ['id', 'first_name', 'last_name', 'position'] },
        ],
        limit,
        offset,
        order: [
            ['review_date', 'DESC']
        ],
    });
    const averageRating = rows.length > 0 ?
        parseFloat((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length).toFixed(1)) :
        0;
    return { data: rows, averageRating, meta: buildPaginationMeta(count, page, limit) };
};

//getting of all employees rating/performance 
const getAllPerformance = async(query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Performance.findAndCountAll({
        distinct: true,
        include: [
            { model: Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'position'] },
            { model: Employee, as: 'reviewer', attributes: ['id', 'first_name', 'last_name'] },
        ],
        limit,
        offset,
        order: [
            ['review_date', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//uptading of employees rating/performance
const updateReview = async(reviewId, reviewerId, data) => {
    const review = await Performance.findByPk(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.reviewed_by !== reviewerId) throw new AppError('You can only update your own reviews', 403);
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new AppError('Rating must be between 1 and 5', 400);
    }
    if (data.rating !== undefined) review.rating = data.rating;
    if (data.goals !== undefined) review.goals = data.goals;
    if (data.comments !== undefined) review.comments = data.comments;
    if (data.review_date !== undefined) review.review_date = data.review_date;
    await review.save();
    return review;
};

//deletion of employee rating/performance review
const deleteReview = async(reviewId) => {
    const review = await Performance.findByPk(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    await review.destroy();
    return { message: 'Review deleted successfully' };
};

//generation of erformance report
const getPerformanceReport = async(query) => {
    const { startDate, endDate, departmentId } = query;

    const reviews = await Performance.findAll({
        where: {
            review_date: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [{
                model: Employee,
                as: 'employee',
                where: departmentId ? { department_id: departmentId } : {},
                attributes: ['id', 'first_name', 'last_name', 'position', 'department_id'],
            },
            { model: Employee, as: 'reviewer', attributes: ['id', 'first_name', 'last_name'] },
        ],
    });

    const employeeRatings = {};
    reviews.forEach((review) => {
        const id = review.employee_id;
        if (!employeeRatings[id]) {
            employeeRatings[id] = {
                first_name: review.employee.first_name,
                last_name: review.employee.last_name,
                position: review.employee.position,
                ratings: [],
                average: 0,
            };
        }
        employeeRatings[id].ratings.push(review.rating);
    });

    Object.values(employeeRatings).forEach((emp) => {
        emp.average = parseFloat(
            (emp.ratings.reduce((sum, r) => sum + r, 0) / emp.ratings.length).toFixed(1)
        );
    });

    const summary = {
        totalReviews: reviews.length,
        overallAverageRating: reviews.length > 0 ?
            parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)) : 0,
        topPerformers: Object.values(employeeRatings)
            .filter(e => e.average >= 4)
            .sort((a, b) => b.average - a.average),
        lowPerformers: Object.values(employeeRatings)
            .filter(e => e.average < 3)
            .sort((a, b) => a.average - b.average),
    };

    return { summary, employeeRatings, records: reviews };
};

module.exports = {
    createReview,
    getMyPerformance,
    getEmployeePerformance,
    getAllPerformance,
    updateReview,
    deleteReview,
    getPerformanceReport,
};