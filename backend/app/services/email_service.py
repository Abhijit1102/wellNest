from app.core.email import send_email
from urllib.parse import urlencode
from app.templates.email_template import reset_password_email_template
from app.config import settings


def build_reset_password_url(token: str) -> str:
    query = urlencode({"token": token})
    return f"{settings.FRONTEND_URL}/auth/reset-password?{query}"


async def send_reset_password_email(to_email: str, token: str):
    reset_url = build_reset_password_url(token)

    subject = "Reset Your Password"

    # ✅ Use HTML template
    html_body = reset_password_email_template(reset_url)

    await send_email(
        to_email=to_email,
        subject=subject,
        body=html_body,  # HTML content
        is_html=True,  # 👈 IMPORTANT (update send_email)
    )
