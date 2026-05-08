import hashlib
import base64
import re
from cryptography.fernet import Fernet
from argon2 import PasswordHasher
from ..config import settings

def _derive_fernet_key(secret: str) -> bytes:
    return base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())

_fernet = Fernet(_derive_fernet_key(settings.jwt_secret))

ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=1)

def hash_phone(phone: str) -> str:
    """手机号 SHA256 哈希（用于查重）"""
    return hashlib.sha256(phone.encode()).hexdigest()

def hash_email(email: str) -> str:
    """邮箱 SHA256 哈希（用于查重）"""
    return hashlib.sha256(email.encode()).hexdigest()

def encrypt_pii(plaintext: str) -> bytes:
    """AES-256-GCM 通过 Fernet 加密 PII"""
    return _fernet.encrypt(plaintext.encode())

def decrypt_pii(ciphertext: bytes) -> str:
    """解密 PII"""
    return _fernet.decrypt(ciphertext).decode()

def hash_password(password: str) -> str:
    """Argon2id 密码哈希"""
    return ph.hash(password)

def verify_password(password: str, hash_str: str) -> bool:
    """验证密码"""
    try:
        ph.verify(hash_str, password)
        return True
    except Exception:
        return False


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements.

    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 digit
    - At least 1 special character

    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "密码长度至少8位"
    if not re.search(r'[A-Z]', password):
        return False, "密码需包含大写字母"
    if not re.search(r'[a-z]', password):
        return False, "密码需包含小写字母"
    if not re.search(r'\d', password):
        return False, "密码需包含数字"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "密码需包含特殊字符(!@#$%^&*等)"
    return True, ""
