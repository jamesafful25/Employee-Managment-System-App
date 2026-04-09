const payrollService = require('../service/payrollService');

const generatePayroll = async(req, res, next) => {
    try {
        const { month, year } = req.body;
        const payrolls = await payrollService.generatePayroll(month, year);
        res.status(201).json({
            status: 'success',
            message: `Payroll generated successfully for ${month}/${year}`,
            data: payrolls,
        });
    } catch (err) {
        next(err);
    }
};

const getMyPayroll = async(req, res, next) => {
    try {
        const result = await payrollService.getMyPayroll(req.employee.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getEmployeePayroll = async(req, res, next) => {
    try {
        const result = await payrollService.getEmployeePayroll(req.params.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getAllPayroll = async(req, res, next) => {
    try {
        const result = await payrollService.getAllPayroll(req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const updatePayroll = async(req, res, next) => {
    try {
        const payroll = await payrollService.updatePayroll(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Payroll updated successfully',
            data: payroll,
        });
    } catch (err) {
        next(err);
    }
};

const markAsPaid = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'fail',
                message: 'Payroll ID is required'
            });
        }

        const payroll = await payrollService.markAsPaid(id);

        res.status(200).json({
            status: 'success',
            message: 'Payroll marked as paid successfully',
            data: payroll,
        });

    } catch (err) {
        next(err);
    }
};

const getPayrollReport = async(req, res, next) => {
    try {
        const { month, year, departmentId } = req.query;

        // Validation 
        if (!month || !year) {
            return res.status(400).json({
                status: 'fail',
                message: 'month and year are required'
            });
        }

        //Convert to numbers 
        const monthNum = Number(String(month).trim());
        const yearNum = Number(String(year).trim());

        // validate numeric conversion
        if (isNaN(monthNum) || isNaN(yearNum)) {
            return res.status(400).json({
                status: 'fail',
                message: 'month and year must be valid numbers'
            });
        }


        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                status: 'fail',
                message: 'month must be between 1 and 12'
            });
        }

        const report = await payrollService.getPayrollReport(
            monthNum,
            yearNum,
            departmentId
        );

        res.status(200).json({
            status: 'success',
            data: report,
        });

    } catch (err) {
        next(err);
    }
};



module.exports = {
    generatePayroll,
    getMyPayroll,
    getEmployeePayroll,
    getAllPayroll,
    updatePayroll,
    markAsPaid,
    getPayrollReport,
};