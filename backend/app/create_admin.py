import asyncio
from app.config import settings
from app.core.security import hash_password
from app.core.database import mongodb
from app.models.user import User
from app.schemas.user import UserRole
from app.core.time_zone import get_iso_timestamp  # ✅ Use ISO helper

async def create_admin():
    # 1. Connect to MongoDB
    await mongodb.connect()
    db = mongodb.get_db()
    users_collection = db["users"]

    # 2. Prepare Admin Data
    email = "admin@gmail.com"
    password = "admin123"

    # Check if admin already exists
    existing_admin = await users_collection.find_one({"email": email})
    if existing_admin:
        print(f"❌ User with email {email} already exists.")
        await mongodb.close()
        return

    # 3. Generate ISO string for timestamps
    now_iso = get_iso_timestamp()

    # 4. Create User Object matching your updated ISO User Model
    admin_user = {
        "email": email.lower(),
        "password_hash": hash_password(password),
        "full_name": "System Administrator",
        "role": UserRole.ADMIN,
        "is_active": True,
        "profile": {"age": None, "timezone": "UTC", "avatar_url": None},
        "consent": {"data_collection": True, "ai_training": True},
        "created_at": now_iso,
        "updated_at": now_iso,
        "last_login": now_iso, # Added this to match your User model
    }

    # 5. Insert into DB
    try:
        result = await users_collection.insert_one(admin_user)
        if result.inserted_id:
            print(f"✅ Admin user created successfully!")
            print(f"📧 Email: {email}")
            print(f"🔑 Role: {UserRole.ADMIN}")
            print(f"🕒 Created At: {now_iso}")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
    finally:
        await mongodb.close()

if __name__ == "__main__":
    asyncio.run(create_admin())