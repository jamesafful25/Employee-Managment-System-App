const transporter = require('../config/email');
const {
    welcomeTemplate,
    passwordResetTemplate,
    accountDeactivatedTemplate,
    forgotPasswordTemplate
} = require('../utils/templateHelper');

//send a notification mail to the newly created user/employee
const sendWelcomeEmail = async(employee, temporaryPassword) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    const template = welcomeTemplate(name, employee.email, temporaryPassword);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: template.subject,
        html: template.html,
    });
};

//send a notification mail to reset password
const sendPasswordResetEmail = async(employee, temporaryPassword) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    const template = passwordResetTemplate(name, temporaryPassword);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: template.subject,
        html: template.html,
    });
};

//send a notification mail for account deactivation
const sendAccountDeactivatedEmail = async(employee) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    const template = accountDeactivatedTemplate(name);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: template.subject,
        html: template.html,
    });
};

//send a notification mail for leave approval 
const sendLeaveApprovedEmail = async(employee, leave) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: 'Leave Approved',
        html: `
            <h3>Hello ${name},</h3>
            <p>Your leave request has been <b>approved</b>.</p>
            <p><b>Start:</b> ${leave.start_date}</p>
            <p><b>End:</b> ${leave.end_date}</p>
        `,
    });
};

//send a notification mail for leave rejection
const sendLeaveRejectedEmail = async(employee, leave) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: 'Leave Rejected',
        html: `
            <h3>Hello ${name},</h3>
            <p>Your leave request has been <b>rejected</b>.</p>
        `,
    });
};

//send an employee payslip
const sendPayslipEmail = async(employee, payroll) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: 'Payslip',
        html: `
            <h3>Hello ${name},</h3>
            <p>Your payslip for <b>${payroll.month}/${payroll.year}</b> is ready.</p>
            <p><b>Basic Salary:</b> ${payroll.basic_salary}</p>
            <p><b>Bonus:</b> ${payroll.bonus}</p>
            <p><b>Deductions:</b> ${payroll.deductions}</p>
            <p><b>Net Salary:</b> ${payroll.net_salary}</p>
        `,
    });
};

//send a notification mail for forgot password
const sendForgotPasswordEmail = async(employee, resetLink) => {
    const name = `${employee.first_name} ${employee.last_name}`;
    const template = forgotPasswordTemplate(name, resetLink);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: template.subject,
        html: template.html,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendAccountDeactivatedEmail,
    sendLeaveApprovedEmail,
    sendLeaveRejectedEmail,
    sendPayslipEmail,
    sendForgotPasswordEmail,
};