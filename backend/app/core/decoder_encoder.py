import asyncio
from cryptography.fernet import Fernet
from app.config import settings

cipher = Fernet(settings.FERNET_KEY.encode())

async def encrypt_text(plain_text: str) -> str:
    encrypted = await asyncio.to_thread(
        cipher.encrypt,
        plain_text.encode()
    )
    return encrypted.decode()

async def decrypt_text(encrypted_text: str) -> str:
    decrypted = await asyncio.to_thread(
        cipher.decrypt,
        encrypted_text.encode()
    )
    return decrypted.decode()