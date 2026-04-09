const departmentService = require('../service/departmentService');

const createDepartment = async(req, res, next) => {
    try {
        const department = await departmentService.createDepartment(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Department created successfully',
            data: department,
        });
    } catch (err) {
        next(err);
    }
};

const getAllDepartments = async(req, res, next) => {
    try {
        const result = await departmentService.getAllDepartments(req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getDepartmentById = async(req, res, next) => {
    try {
        const department = await departmentService.getDepartmentById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: department,
        });
    } catch (err) {
        next(err);
    }
};

const updateDepartment = async(req, res, next) => {
    try {
        const department = await departmentService.updateDepartment(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Department updated successfully',
            data: department,
        });
    } catch (err) {
        next(err);
    }
};

const deleteDepartment = async(req, res, next) => {
    try {
        await departmentService.deleteDepartment(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Department deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

const assignManager = async(req, res, next) => {
    try {
        const department = await departmentService.assignManager(req.params.id, req.body.employeeId);
        res.status(200).json({
            status: 'success',
            message: 'Manager assigned successfully',
            data: department,
        });
    } catch (err) {
        next(err);
    }
};

const assignEmployeeToDept = async(req, res, next) => {
    try {
        const employee = await departmentService.assignEmployeeToDept(req.params.id, req.body.employeeId);
        res.status(200).json({
            status: 'success',
            message: 'Employee assigned to department successfully',
            data: employee,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    assignManager,
    assignEmployeeToDept,
};