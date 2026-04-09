const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Employee } = require('../model');
const { comparePassword } = require('../utils/passwordHelper');
const { AppError } = require('../utils/errorHandler');

// local strategy
passport.use(
    new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
        },
        async(email, password, done) => {
            try {
                // check if employee exists
                const employee = await Employee.findOne({ where: { email } });
                if (!employee) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // check if account is active
                if (!employee.is_active) {
                    return done(null, false, { message: 'Account deactivated, contact admin' });
                }

                // check password
                const isMatch = await comparePassword(password, employee.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // check if password has been changed
                //if (!employee.is_password_changed) {
                //return done(null, false, {
                // message: 'Please change your temporary password before continuing'
                //});
                //}

                // success
                return done(null, employee);

            } catch (err) {
                return done(err);
            }
        }
    )
);

// google strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async(accessToken, refreshToken, profile, done) => {
        try {
            // check if employee exists with google id
            const employee = await Employee.findOne({ where: { google_id: profile.id } });
            if (employee) return done(null, employee);

            // check if email already registered locally — link google account
            const existing = await Employee.findOne({
                where: { email: profile.emails[0].value },
            });

            if (existing) {
                // link google id to existing account
                existing.google_id = profile.id;
                await existing.save();
                return done(null, existing);
            }

            // employee not pre-registered by admin — deny access
            return done(null, false, {
                message: 'Account not found, contact admin to register you',
            });
        } catch (err) {
            return done(err);
        }
    }
));

module.exports = passport;