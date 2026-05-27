import logging
from pathlib import Path

from PIL import Image

from app.config import settings

logger = logging.getLogger(__name__)

SAMPLE_FILES = {
    "images/sample1.jpg": (400, 300, (70, 130, 180)),
    "images/sample2.jpg": (640, 480, (46, 139, 87)),
    "images/sample3.jpg": (800, 600, (218, 165, 32)),
    "images/sample4.jpg": (320, 240, (178, 34, 34)),
}


def ensure_sample_images() -> None:
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    for filepath_rel, (width, height, color) in SAMPLE_FILES.items():
        filepath = upload_dir / filepath_rel
        if not filepath.exists():
            filepath.parent.mkdir(parents=True, exist_ok=True)
            img = Image.new("RGB", (width, height), color)
            img.save(filepath, "JPEG", quality=85)
            logger.info("Created %s (%dx%d)", filepath_rel, width, height)
