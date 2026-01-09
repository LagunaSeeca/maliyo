import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: parseInt((process.env.SMTP_PORT || '587').trim()),
    secure: false, // TLS
    auth: {
        user: (process.env.SMTP_USER || '').trim(),
        pass: (process.env.SMTP_PASSWORD || '').trim(),
    },
})

interface SendOtpEmailParams {
    to: string
    otp: string
    type: 'REGISTRATION' | 'PASSWORD_RESET'
}

export async function sendOtpEmail({ to, otp, type }: SendOtpEmailParams): Promise<boolean> {
    const isRegistration = type === 'REGISTRATION'

    const subject = isRegistration
        ? 'Verify Your Maliyo Account'
        : 'Reset Your Maliyo Password'

    const heading = isRegistration
        ? 'Welcome to Maliyo!'
        : 'Password Reset Request'

    const message = isRegistration
        ? 'Thank you for signing up! Please use the verification code below to complete your registration:'
        : 'We received a request to reset your password. Use the code below to set a new password:'

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 24px 40px;">
                            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 12V7H5C3.9 7 3 7.9 3 9V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V12ZM5 9H19V12H5V9ZM5 17V14H19V17H5Z" fill="white"/>
                                </svg>
                            </div>
                            <h1 style="margin: 24px 0 0 0; font-size: 24px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">
                                Maliyo
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1e293b; text-align: center;">
                                ${heading}
                            </h2>
                            <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 24px; color: #64748b; text-align: center;">
                                ${message}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- OTP Code -->
                    <tr>
                        <td align="center" style="padding: 0 40px 32px 40px;">
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px 32px;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #8b5cf6; font-family: 'Courier New', monospace;">
                                    ${otp}
                                </span>
                            </div>
                            <p style="margin: 16px 0 0 0; font-size: 13px; color: #94a3b8;">
                                This code expires in <strong style="color: #64748b;">5 minutes</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Security Notice -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px;">
                            <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px;">
                                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #92400e;">
                                    <strong>Security tip:</strong> Never share this code with anyone. Maliyo will never ask for your verification code via phone or message.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #94a3b8; text-align: center;">
                                If you didn't request this ${isRegistration ? 'account' : 'password reset'}, you can safely ignore this email.
                            </p>
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #cbd5e1; text-align: center;">
                                © ${new Date().getFullYear()} Maliyo - Family Finance Manager
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

    const text = `
${heading}

${message}

Your verification code: ${otp}

This code expires in 5 minutes.

Security tip: Never share this code with anyone. Maliyo will never ask for your verification code via phone or message.

If you didn't request this ${isRegistration ? 'account' : 'password reset'}, you can safely ignore this email.

© ${new Date().getFullYear()} Maliyo - Family Finance Manager
`

    try {
        await transporter.sendMail({
            from: `"Maliyo" <${process.env.SMTP_USER || 'maliyoapp@gmail.com'}>`,
            to,
            subject,
            text,
            html,
        })
        return true
    } catch (error) {
        console.error('Failed to send email:', error)
        return false
    }
}

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}
