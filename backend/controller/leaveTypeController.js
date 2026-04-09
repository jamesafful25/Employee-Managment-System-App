const leaveTypeService = require('../service/leaveTypeService');

const createLeaveType = async(req, res, next) => {
    try {
        const leaveType = await leaveTypeService.createLeaveType(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Leave type created successfully',
            data: leaveType,
        });
    } catch (err) {
        next(err);
    }
};

const getAllLeaveTypes = async(req, res, next) => {
    try {
        const leaveTypes = await leaveTypeService.getAllLeaveTypes();
        res.status(200).json({
            status: 'success',
            data: leaveTypes,
        });
    } catch (err) {
        next(err);
    }
};

const getLeaveTypeById = async(req, res, next) => {
    try {
        const leaveType = await leaveTypeService.getLeaveTypeById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: leaveType,
        });
    } catch (err) {
        next(err);
    }
};

const updateLeaveType = async(req, res, next) => {
    try {
        const leaveType = await leaveTypeService.updateLeaveType(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Leave type updated successfully',
            data: leaveType,
        });
    } catch (err) {
        next(err);
    }
};

const deleteLeaveType = async(req, res, next) => {
    try {
        await leaveTypeService.deleteLeaveType(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Leave type deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createLeaveType,
    getAllLeaveTypes,
    getLeaveTypeById,
    updateLeaveType,
    deleteLeaveType,
};