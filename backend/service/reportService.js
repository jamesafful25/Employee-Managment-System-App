const { generatePDF, generateExcel } = require('../utils/reportHelper');
const { getAttendanceReport } = require('./attendanceService');
const { getLeaveReport } = require('./leaveService');
const { getPayrollReport } = require('./payrollService');
const { getPerformanceReport } = require('./performanceService');

//getting an employee name
const getEmployeeName = (employee) => {
    if (!employee) return '-';
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || '-';
};

//get/download an employee attendance report
const exportAttendanceReport = async(query, format, res) => {
    const report = await getAttendanceReport(query);
    const title = 'Attendance Report';
    const columns = ['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours Worked', 'Status'];

    const rows = [];
    report.forEach((item) => {
        item.records.forEach((record) => {
            rows.push([
                getEmployeeName(item.employee),
                record.date,
                record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '-',
                record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '-',
                record.hours_worked !== null && record.hours_worked !== undefined ? record.hours_worked : '0.00',
                record.status,
            ]);
        });
    });

    if (format === 'pdf') return generatePDF(title, columns, rows, res);
    if (format === 'excel') return generateExcel(title, columns, rows, res);
};

//get/download an employee leave report
const exportLeaveReport = async(query, format, res) => {
    const report = await getLeaveReport(query);
    const title = 'Leave Report';
    const columns = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status', 'Approved By'];

    const rows = report.records.map((leave) => [
        getEmployeeName(leave.employee),
        leave.leaveType ? leave.leaveType.name : '-',
        leave.start_date,
        leave.end_date,
        leave.total_days,
        leave.status,
        getEmployeeName(leave.approver),
    ]);

    if (format === 'pdf') return generatePDF(title, columns, rows, res);
    if (format === 'excel') return generateExcel(title, columns, rows, res);
};

//get/download payroll report
const exportPayrollReport = async(query, format, res) => {
    const { month, year, departmentId } = query;
    const report = await getPayrollReport(Number(month), Number(year), departmentId);
    const title = `Payroll Report - ${month}-${year}`;
    const columns = ['Employee', 'Position', 'Basic Salary', 'Bonus', 'Tax Rate', 'Tax Amount', 'Deductions', 'Net Salary', 'Status'];

    const rows = report.records.map((payroll) => [
        getEmployeeName(payroll.employee),
        payroll.employee ? payroll.employee.position || '-' : '-',
        payroll.basic_salary,
        payroll.bonus,
        `${payroll.tax_rate || 0}%`,
        payroll.tax_amount || 0,
        payroll.deductions,
        payroll.net_salary,
        payroll.status,
    ]);

    if (format === 'pdf') return generatePDF(title, columns, rows, res);
    if (format === 'excel') return generateExcel(title, columns, rows, res);
};

//get/download performance report
const exportPerformanceReport = async(query, format, res) => {
    const report = await getPerformanceReport(query);
    const title = 'Performance Report';
    const columns = ['Employee', 'Position', 'Rating', 'Goals', 'Comments', 'Reviewed By', 'Review Date'];

    const rows = report.records.map((review) => [
        getEmployeeName(review.employee),
        review.employee ? review.employee.position || '-' : '-',
        review.rating,
        review.goals || '-',
        review.comments || '-',
        getEmployeeName(review.reviewer),
        review.review_date,
    ]);

    if (format === 'pdf') return generatePDF(title, columns, rows, res);
    if (format === 'excel') return generateExcel(title, columns, rows, res);
};

module.exports = {
    exportAttendanceReport,
    exportLeaveReport,
    exportPayrollReport,
    exportPerformanceReport,
};