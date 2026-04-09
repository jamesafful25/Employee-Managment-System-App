const employeeService = require('../service/employeeService');
const { AppError } = require('../utils/errorHandler');

const getAllEmployees = async(req, res, next) => {
    try {
        const result = await employeeService.getAllEmployees(req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getEmployeeById = async(req, res, next) => {
    try {
        const employee = await employeeService.getEmployeeById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: employee,
        });
    } catch (err) {
        next(err);
    }
};

const getMyProfile = async(req, res, next) => {
    try {
        const employee = await employeeService.getEmployeeById(req.employee.id);
        res.status(200).json({
            status: 'success',
            data: employee,
        });
    } catch (err) {
        next(err);
    }
};

const updateEmployee = async(req, res, next) => {
    try {
        const employee = await employeeService.updateEmployee(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Employee updated successfully',
            data: employee,
        });
    } catch (err) {
        next(err);
    }
};

const deactivateEmployee = async(req, res, next) => {
    try {
        await employeeService.deactivateEmployee(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Employee deactivated successfully',
        });
    } catch (err) {
        next(err);
    }
};

const activateEmployee = async(req, res, next) => {
    try {
        await employeeService.activateEmployee(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Employee activated successfully',
        });
    } catch (err) {
        next(err);
    }
};

const deleteEmployee = async(req, res, next) => {
    try {
        await employeeService.deleteEmployee(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Employee deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

const changeRole = async(req, res, next) => {
    try {

        const employee = await employeeService.changeRole(req.params.id, req.body.role);
        res.status(200).json({
            status: 'success',
            message: 'Employee role updated successfully',
            data: employee,
        });
    } catch (err) {
        next(err);
    }
};



module.exports = {
    getAllEmployees,
    getEmployeeById,
    getMyProfile,
    updateEmployee,
    deactivateEmployee,
    activateEmployee,
    deleteEmployee,
    changeRole,
};