const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format.'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters.'
        });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUppercase || !hasNumber || !hasSpecialChar) {
        return res.status(400).json({
            error: 'Password must contain at least one uppercase letter, one number, and one special character.'
        });
    }

    next();
};

const validateRegister = (req, res, next) => {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({
            error: 'Email, password and full name are required.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format.'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters.'
        });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUppercase || !hasNumber || !hasSpecialChar) {
        return res.status(400).json({
            error: 'Password must contain at least one uppercase letter, one number, and one special character.'
        });
    }

    if (full_name.trim().length < 2) {
        return res.status(400).json({
            error: 'Full name must be at least 2 characters.'
        });
    }

    next();
};

const validateTransfer = (req, res, next) => {
    const { to_account_id, amount, description } = req.body;

    if (!to_account_id || !amount) {
        return res.status(400).json({
            error: 'Destination account and amount are required.'
        });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({
            error: 'Amount must be a positive number.'
        });
    }

    if (Number(amount) > 10000) {
        return res.status(400).json({
            error: 'Single transfer limit is £10,000.'
        });
    }

    next();
};

module.exports = { validateLogin, validateRegister, validateTransfer };