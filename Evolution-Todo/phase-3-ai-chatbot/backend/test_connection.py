# test_connection.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_db():
    # Original URL
    DATABASE_URL = "postgresql://neondb_owner:npg_yDxLXQem9HF6@ep-raspy-hall-a1j5lrm2-pooler.ap-southeast-1.aws.neon.tech/neondb"
    
    # asyncpg ke liye convert karo (without sslmode)
    ASYNC_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    # SSL context ke saath engine banao
    engine = create_async_engine(
        ASYNC_URL,
        connect_args={
            "ssl": "require"  # Yaha SSL enable karo
        }
    )
    
    try:
        async with engine.connect() as conn:
            print("✅ Database connected successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await engine.dispose()

asyncio.run(test_db())