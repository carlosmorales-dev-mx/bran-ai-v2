import time
from typing import Callable, TypeVar

from fastapi import HTTPException

T = TypeVar("T")


DEFAULT_PERMISSION_DETAIL = (
    "El proveedor del modelo rechazó el acceso del proyecto/API key. "
    "Revisa permisos, API key o cambia de modelo/proveedor."
)

DEFAULT_QUOTA_DETAIL = (
    "Se alcanzó el límite temporal del modelo. "
    "Intenta más tarde o usa otra API key/modelo."
)

DEFAULT_TEMPORARY_DETAIL = (
    "El modelo está saturado temporalmente. "
    "Intenta de nuevo en unos segundos."
)


def is_permission_error(error: Exception) -> bool:
    text = str(error).lower()

    return (
        "403" in text
        or "401" in text
        or "permission_denied" in text
        or "permission denied" in text
        or "denied access" in text
        or "project has been denied access" in text
        or "api key" in text
        or "unauthorized" in text
        or "authentication" in text
    )


def is_quota_error(error: Exception) -> bool:
    text = str(error).lower()

    return (
        "429" in text
        or "resource_exhausted" in text
        or "quota exceeded" in text
        or "quota" in text
        or "rate-limits" in text
        or "free_tier_requests" in text
        or "generate_content_free_tier_requests" in text
        or "too many requests" in text
    )


def is_temporary_model_error(error: Exception) -> bool:
    text = str(error).lower()

    return (
        "503" in text
        or "unavailable" in text
        or "high demand" in text
        or "temporarily" in text
        or "deadline" in text
        or "timeout" in text
    )


def retry_model_call(
    fn: Callable[[], T],
    attempts: int = 3,
    delay_seconds: int = 2,
    *,
    permission_detail: str = DEFAULT_PERMISSION_DETAIL,
    quota_detail: str = DEFAULT_QUOTA_DETAIL,
    temporary_detail: str = DEFAULT_TEMPORARY_DETAIL,
    log_context: str = "model call",
) -> T:
    last_error: Exception | None = None

    for attempt in range(attempts):
        try:
            return fn()

        except HTTPException:
            raise

        except Exception as error:
            last_error = error

            if is_permission_error(error):
                raise HTTPException(
                    status_code=403,
                    detail=permission_detail,
                ) from error

            if is_quota_error(error):
                raise HTTPException(
                    status_code=429,
                    detail=quota_detail,
                ) from error

            if not is_temporary_model_error(error):
                raise

            if attempt < attempts - 1:
                wait = delay_seconds * (attempt + 1)
                print(
                    f"Temporary model error in {log_context}. "
                    f"Retry {attempt + 1}/{attempts} in {wait}s:",
                    error,
                )
                time.sleep(wait)

    raise HTTPException(
        status_code=503,
        detail=temporary_detail,
    ) from last_error