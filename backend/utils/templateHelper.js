const welcomeTemplate = (name, email, temporaryPassword) => ({
    subject: 'Welcome to the Eumes Co. Ltd — Your Login Credentials',
    html: `
    <h2>Welcome ${name}</h2>
    <p>Your account has been created. Here are your login credentials:</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
    <p>Please log in and change your password immediately.</p>
    <a href="${process.env.FRONTEND_URL}/login">Login Here</a>
  `,
});

const passwordResetTemplate = (name, temporaryPassword) => ({
    subject: 'Your Password Has Been Reset',
    html: `
    <h2>Hello ${name}</h2>
    <p>Your password has been reset by admin.</p>
    <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
    <p>Please log in and change your password immediately.</p>
    <a href="${process.env.FRONTEND_URL}/login">Login Here</a>
  `,
});

const accountDeactivatedTemplate = (name) => ({
    subject: 'Your Account Has Been Deactivated',
    html: `
    <h2>Hello ${name}</h2>
    <p>Your account has been deactivated.</p>
    <p>Please contact HR or admin for more information.</p>
  `,
});

const forgotPasswordTemplate = (name, resetLink) => ({
    subject: 'Reset Your Password',
    html: `
        <h2>Hello ${name}</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
    `,
});

module.exports = {
    welcomeTemplate,
    passwordResetTemplate,
    accountDeactivatedTemplate,
    forgotPasswordTemplate
};