def reset_password_email_template(reset_url: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reset Password</title>
    </head>
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9fafb;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
            <tr>
                <td align="center">
                    
                    <table width="400" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px; border:1px solid #e5e7eb;">
                        
                        <!-- Logo / Branding -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <h2 style="margin:0; color:#16a34a;">🌿 WellNest</h2>
                            </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                            <td align="center">
                                <h3 style="margin:0; color:#111827;">Reset Your Password</h3>
                            </td>
                        </tr>

                        <!-- Message -->
                        <tr>
                            <td style="padding:20px 0; color:#374151; font-size:14px; text-align:center;">
                                You requested to reset your password.<br/>
                                Click the button below to continue.
                            </td>
                        </tr>

                        <!-- Button -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <a href="{reset_url}" 
                                   style="background-color:#16a34a; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                                    Reset Password
                                </a>
                            </td>
                        </tr>

                        <!-- Fallback Link -->
                        <tr>
                            <td style="font-size:12px; color:#6b7280; text-align:center;">
                                If the button doesn't work, copy and paste this link:<br/>
                                <a href="{reset_url}" style="color:#2563eb;">{reset_url}</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding-top:20px; font-size:12px; color:#9ca3af; text-align:center;">
                                If you did not request this, you can safely ignore this email.<br/>
                                This link will expire soon.<br/><br/>
                                — WellNest Team
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    """
