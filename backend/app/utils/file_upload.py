ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "heic"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_image(size: int, filename: str) -> bool:
    if size > MAX_FILE_SIZE:
        return False
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS
