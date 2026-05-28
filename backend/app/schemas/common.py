import re
from typing import Annotated, Generic, TypeVar

from pydantic import BaseModel, BeforeValidator, Field

T = TypeVar("T")

_CONTROL_CHAR_RE = re.compile(
    '[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f'
    '\ud800-\udfff'
    '\ufdd0-\ufdef'
    '\ufffe-\uffff'
    ']'
)


def _strip_control_chars(v: str) -> str:
    if not isinstance(v, str):
        return v
    return _CONTROL_CHAR_RE.sub('', v)


SafeContent = Annotated[str, BeforeValidator(_strip_control_chars)]


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int
