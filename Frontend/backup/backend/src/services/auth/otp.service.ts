export const sendOtp = async (phone: string) => {
    // TODO: Integrate with actual SMS provider (e.g., Twilio, AWS SNS)
    console.log(`[OTP Service] Sending OTP to ${phone}`);
    return { otpSent: true, message: 'OTP sent for verification' };
};

export const verifyOtp = async (phone: string, otp: string) => {
    // TODO: Verify against Redis or Database
    console.log(`[OTP Service] Verifying OTP ${otp} for ${phone}`);
    // Mock logic: allow '1234' as valid OTP for development
    if (otp === '1234') return true;
    return false;
};
