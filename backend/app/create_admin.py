import asyncio
from datetime import datetime
from .config import settings
from .core.security import hash_password
from .core.database import mongodb
from .models.user import User
from .schemas.user import UserRole, UserConsentSchema

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

    # 3. Create User Object matching your updated User Model
    admin_user = {
        "email": email,
        "password_hash": hash_password(password),
        "full_name": "System Administrator",
        "role": UserRole.ADMIN,
        "is_active": True,
        "profile": {
            "age": None,
            "timezone": "UTC",
            "avatar_url": None
        },
        "consent": {
            "data_collection": True,
            "ai_training": True
        },
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    # 4. Insert into DB
    try:
        result = await users_collection.insert_one(admin_user)
        if result.inserted_id:
            print(f"✅ Admin user created successfully!")
            print(f"📧 Email: {email}")
            print(f"🔑 Role: {UserRole.ADMIN}")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
    finally:
        await mongodb.close()

if __name__ == "__main__":
    asyncio.run(create_admin())