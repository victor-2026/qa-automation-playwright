import logging
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import Base, engine, get_db
from app.services.seed import seed_data

logger = logging.getLogger(__name__)

router = APIRouter(tags=["System"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@router.post("/reset")
async def reset_database() -> dict:
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSession(engine) as session:
            await seed_data(session)
            await session.commit()
        return {"status": "reset", "message": "Database reset and re-seeded successfully"}
    except Exception as e:
        logger.exception("Database reset failed")
        return {"status": "error", "message": str(e)}


def _walk(directory: Path, prefix: str = "") -> list[str]:
    files = []
    for entry in sorted(directory.iterdir()):
        rel = f"{prefix}/{entry.name}" if prefix else entry.name
        if entry.is_dir():
            files.extend(_walk(entry, rel))
        else:
            files.append(f"{rel} ({entry.stat().st_size}b)")
    return files


@router.get("/diagnostic/uploads")
async def diagnostic_uploads() -> dict:
    upload_dir = Path(settings.UPLOAD_DIR)
    try:
        if not upload_dir.exists():
            return {"exists": False, "files": [], "UPLOAD_DIR": str(upload_dir)}
        files = _walk(upload_dir)
        return {
            "exists": True,
            "files": files,
            "UPLOAD_DIR": str(upload_dir),
            "count": len(files),
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/diagnostic/pillow")
async def diagnostic_pillow() -> dict:
    try:
        from PIL import Image
        img = Image.new("RGB", (10, 10), (255, 0, 0))
        import io
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=85)
        return {"pillow": True, "jpeg_support": True, "size": len(buf.getvalue())}
    except ImportError as e:
        return {"pillow": False, "error": str(e)}
    except Exception as e:
        return {"pillow": True, "jpeg_error": str(e)}
