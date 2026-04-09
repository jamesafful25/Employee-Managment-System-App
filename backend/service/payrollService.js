const { Payroll, Employee } = require('../model');
const { AppError } = require('../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { sendPayslipEmail } = require('./emailService');
const { Op } = require('sequelize');

//calculation of net salary
const calculateNetSalary = (basicSalary, bonus, deductions, taxAmount) => {
    return parseFloat((
        parseFloat(basicSalary || 0) +
        parseFloat(bonus || 0) -
        parseFloat(taxAmount || 0) -
        parseFloat(deductions || 0)
    ).toFixed(2));
};

//calculation of tax amount
const calculateTaxAmount = (basicSalary, bonus, taxRate, taxMethod) => {
    const rate = parseFloat(taxRate || 0) / 100;
    if (taxMethod === 'gross') {
        const gross = parseFloat(basicSalary || 0) + parseFloat(bonus || 0);
        return parseFloat((gross * rate).toFixed(2));
    }
    return parseFloat((parseFloat(basicSalary || 0) * rate).toFixed(2));
};

//generation of payroll records
const generatePayroll = async(month, year) => {
    const employees = await Employee.findAll({ where: { is_active: true } });
    const payrolls = await Promise.all(employees.map(async(employee) => {
        const existing = await Payroll.findOne({
            where: { employee_id: employee.id, month, year },
        });
        if (existing) return null;
        const netSalary = calculateNetSalary(employee.basic_salary || 0, 0, 0);
        return Payroll.create({
            employee_id: employee.id,
            month,
            year,
            basic_salary: employee.basic_salary || 0,
            bonus: 0,
            deductions: 0,
            net_salary: netSalary,
        });
    }));
    return payrolls.filter(Boolean);
};

//updating of payroll records
const updatePayroll = async(payrollId, data) => {
    const payroll = await Payroll.findByPk(payrollId);
    if (!payroll) throw new AppError('Payroll not found', 404);
    if (payroll.status === 'paid') throw new AppError('Cannot update a paid payroll', 400);

    if (data.basic_salary !== undefined) payroll.basic_salary = parseFloat(data.basic_salary);
    if (data.bonus !== undefined) payroll.bonus = parseFloat(data.bonus);
    if (data.deductions !== undefined) payroll.deductions = parseFloat(data.deductions);
    if (data.tax_rate !== undefined) payroll.tax_rate = parseFloat(data.tax_rate);
    if (data.tax_method !== undefined) payroll.tax_method = data.tax_method;

    // recalculate tax amount
    payroll.tax_amount = calculateTaxAmount(
        payroll.basic_salary,
        payroll.bonus,
        payroll.tax_rate,
        payroll.tax_method
    );

    // recalculate net salary
    payroll.net_salary = calculateNetSalary(
        payroll.basic_salary,
        payroll.bonus,
        payroll.deductions,
        payroll.tax_amount
    );

    await payroll.save();
    return payroll;
};

//marking/ticking of paid employee
const markAsPaid = async(payrollId) => {
    const payroll = await Payroll.findByPk(payrollId, {
        include: [{ model: Employee, as: 'employee' }],
    });
    if (!payroll) throw new AppError('Payroll not found', 404);
    if (payroll.status === 'paid') throw new AppError('Payroll already marked as paid', 400);
    payroll.status = 'paid';
    payroll.paid_at = new Date();
    await payroll.save();
    try {
        await sendPayslipEmail(payroll.employee, payroll);
    } catch (err) {
        console.error('Payslip email failed:', err.message);
    }
    return payroll;
};

//getting of an employee own payroll records
const getMyPayroll = async(employeeId, query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Payroll.findAndCountAll({
        where: { employee_id: employeeId },
        limit,
        offset,
        order: [
            ['year', 'DESC'],
            ['month', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//getting of all payroll records
const getAllPayroll = async(query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Payroll.findAndCountAll({
        include: [{
            model: Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'position'],
        }],
        limit,
        offset,
        order: [
            ['year', 'DESC'],
            ['month', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//getting of an employee payroll reocrds
const getEmployeePayroll = async(employeeId, query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Payroll.findAndCountAll({
        where: { employee_id: employeeId },
        limit,
        offset,
        order: [
            ['year', 'DESC'],
            ['month', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//getting of payroll report
const getPayrollReport = async(month, year, departmentId) => {
    const payrolls = await Payroll.findAll({
        where: { month, year },
        include: [{
            model: Employee,
            as: 'employee',
            where: departmentId ? { department_id: departmentId } : {},
            attributes: ['id', 'first_name', 'last_name', 'position', 'department_id'],
        }],
    });

    const summary = {
        totalEmployees: payrolls.length,
        totalBasicSalary: payrolls.reduce((sum, p) => sum + parseFloat(p.basic_salary), 0),
        totalBonus: payrolls.reduce((sum, p) => sum + parseFloat(p.bonus), 0),
        totalDeductions: payrolls.reduce((sum, p) => sum + parseFloat(p.deductions), 0),
        totalNetSalary: payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary), 0),
        totalPaid: payrolls.filter(p => p.status === 'paid').length,
        totalPending: payrolls.filter(p => p.status === 'pending').length,
    };

    return { summary, records: payrolls };
};

module.exports = {
    generatePayroll,
    updatePayroll,
    markAsPaid,
    getMyPayroll,
    getAllPayroll,
    getPayrollReport,
    getEmployeePayroll,
};