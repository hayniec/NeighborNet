
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
    toEmail: string,
    inviteCode: string,
    communityName: string,
    senderName?: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY is missing. Email skipped.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'KithGrid <onboarding@resend.dev>', // Use this for testing/free tier
            to: [toEmail],
            subject: `You've been invited to join ${communityName} on KithGrid!`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Welcome to KithGrid!</h1>
                    <p>You have been invited to join the <strong>${communityName}</strong> community${senderName ? ' by ' + senderName : ''}.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0; color: #4b5563;">Your Invitation Code:</p>
                        <h2 style="margin: 10px 0; letter-spacing: 5px; color: #4f46e5; font-size: 32px;">${inviteCode}</h2>
                    </div>

                    <p>To accept this invitation:</p>
                    <ol>
                        <li>Visit <a href="https://kithgrid.netlify.app/join">KithGrid</a></li>
                        <li>Enter your email (${toEmail}) and the code above.</li>
                    </ol>
                    
                    <p>See you in the neighborhood!</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
}
