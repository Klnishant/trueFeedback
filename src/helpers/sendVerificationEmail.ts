import { resend } from "@/lib/resend";
import  verficationEmail from "../../emails/verificationEmail"
import { apiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail (
    email: string,
    username: string,
    verifycode: string
): Promise<apiResponse> {
    try {
        await resend.emails.send({
            from: 'nishantkaushal075@gmail.com',
            to: email,
            subject: "Mystery message",
            react: verficationEmail({username,otp: verifycode})
        });

        return ({success: true,
            message: 'verification code send successfully'});
    } catch (error) {
        console.error("Error sending verification email",error)
        
        return ({
            success: false,
            message: "failed to send verification email"
        });
    }
}