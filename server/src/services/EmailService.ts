
export const sendVerificationEmail = async (email: string, token: string) => {
    console.log(`[EmailService] Sending verification email to ${email} with token: ${token}`);
    console.log(`[EmailService] Link: http://localhost:3000/auth/verify-email/${token}`);
    return true;
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    console.log(`[EmailService] Sending password reset email to ${email} with token: ${token}`);
    console.log(`[EmailService] Link: http://localhost:3000/auth/reset-password/${token}`);
    return true;
};
