import aiosmtplib
from email.message import EmailMessage
from app.config import settings


async def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    message = EmailMessage()
    message["From"] = settings.EMAIL_SENDER
    message["To"] = to_email
    message["Subject"] = subject

    if is_html:
        message.add_alternative(body, subtype="html")  
    else:
        message.set_content(body)  # plain text

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_SERVER,
        port=settings.SMTP_PORT,
        username=settings.EMAIL_SENDER,
        password=settings.EMAIL_PASSWORD,
        start_tls=True,
    )    