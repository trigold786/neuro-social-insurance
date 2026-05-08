import hashlib
import secrets
import asyncio
import logging
import re
from typing import Optional
from ..config import settings

logger = logging.getLogger(__name__)

SMS_CODE_CHARS = "0123456789"
EMAIL_CODE_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def _is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def _is_valid_phone(phone: str) -> bool:
    pattern = r'^1[3-9]\d{9}$'
    return bool(re.match(pattern, phone))


def generate_code(channel: str = "sms") -> str:
    """Generate cryptographically secure verification code.

    When SMS/email is disabled, we still generate a secure random code
    instead of a predictable one to prevent bypass attacks.
    """
    if channel == "email":
        return "".join(secrets.choice(EMAIL_CODE_CHARS) for _ in range(6))
    return "".join(secrets.choice(SMS_CODE_CHARS) for _ in range(6))


def hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


async def send_sms_code(phone: str, code: str) -> bool:
    if not settings.aliyun_sms_enabled:
        logger.info("[MOCK SMS] To %s: code=%s", phone, code)
        return True

    if not _is_valid_phone(phone):
        logger.warning("[SMS] Invalid phone number: %s", phone)
        return False

    try:
        from alibabacloud_dysmsapi20170525.client import Client
        from alibabacloud_dysmsapi20170525 import models as dysmsapi_models
        from alibabacloud_tea_openapi import models as open_api_models

        config = open_api_models.Config(
            access_key_id=settings.aliyun_access_key_id,
            access_key_secret=settings.aliyun_access_key_secret,
            endpoint="dysmsapi.aliyuncs.com",
        )
        client = Client(config)

        req = dysmsapi_models.SendSmsRequest(
            phone_numbers=phone,
            sign_name=settings.aliyun_sms_sign_name,
            template_code=settings.aliyun_sms_template_code,
            template_param=f'{{"code":"{code}"}}',
        )
        resp = await asyncio.to_thread(client.send_sms, req)
        if resp.body and resp.body.code == "OK":
            logger.info("[SMS] Sent to %s, biz_id=%s", phone, resp.body.biz_id)
            return True
        else:
            logger.error("[SMS] Failed: code=%s, message=%s", resp.body.code if resp.body else "N/A", resp.body.message if resp.body else "N/A")
            return False
    except Exception as e:
        logger.error("[SMS ERROR] %s", e)
        return False


async def send_email_code(email: str, code: str, purpose: str = "注册") -> bool:
    if not settings.smtp_enabled:
        logger.info("[MOCK EMAIL] To %s: [%s] code=%s", email, purpose, code)
        return True

    if not _is_valid_email(email):
        logger.warning("[EMAIL] Invalid email address: %s", email)
        return False

    try:
        from aiosmtplib import SMTP
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        subject = f"NSI 社保定制速算器 - {purpose}验证码"
        html = f"""<html><body style="font-family:-apple-system,sans-serif;color:#333;">
<h2>NSI 验证码</h2>
<p>您正在进行 <strong>{purpose}</strong> 操作。</p>
<p style="font-size:24px;font-weight:bold;color:#0ea5e9;letter-spacing:4px;">{code}</p>
<p>验证码10分钟内有效，请勿泄露给他人。</p>
<hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
<p style="font-size:12px;color:#999;">如非本人操作，请忽略此邮件。</p>
</body></html>"""

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = email
        msg.attach(MIMEText(html, "html", "utf-8"))

        smtp = SMTP(hostname=settings.smtp_host, port=settings.smtp_port, use_tls=True)
        await smtp.connect()
        await smtp.login(settings.smtp_username, settings.smtp_password)
        await smtp.send_message(msg)
        await smtp.quit()
        logger.info("[EMAIL] Sent to %s for %s", email, purpose)
        return True
    except Exception as e:
        logger.error("[EMAIL ERROR] %s", e)
        return False
