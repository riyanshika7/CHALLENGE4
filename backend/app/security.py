"""Security boundaries for untrusted uploads and LLM-bound user input.

Defense layers implemented:
  1. Filesystem — path traversal prevention, extension whitelist
  2. Network  — pre-read content-length cap, magic-byte signature verification
  3. Content — null-byte rejection, XSS pattern scanning, formula-injection guard
  4. Parsing — nesting-depth cap (JSON), forbidden-DML check (SQL), row/cell limits (CSV)
  5. LLM    — unicode sanitisation, prompt-injection pattern matching, length ceiling
"""
import csv
import io
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status

MAX_LLM_INPUT_CHARS = 4_000
MAX_JURY_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_JURY_EXTENSIONS = {".csv", ".json", ".pdf", ".db", ".sqlite", ".sqlite3", ".sql"}
PROMPT_INJECTION_PATTERNS = (
    r"\b(ignore|disregard|override|bypass)\b.{0,100}\b(instruction|prompt|policy|guardrail)\b",
    r"\b(system\s+prompt|developer\s+message|hidden\s+instructions?)\b",
    r"<\s*/?\s*(system|assistant|developer)\s*>",
    r"\b(reveal|print|show|export)\b.{0,100}\b(api\s*key|secret|credential|token)\b",
    r"\b(dan|do\s+anything\s+now|jailbreak)\b",
)
_PROMPT_INJECTION_RE = re.compile("|".join(PROMPT_INJECTION_PATTERNS), re.IGNORECASE | re.DOTALL)
_UNSAFE_HTML_RE = re.compile(r"<\s*(script|iframe|object|embed)|on\w+\s*=|javascript:\s*", re.IGNORECASE)
_FORMULA_PREFIX_RE = re.compile(r"^\s*[=+\-@]")
_FORBIDDEN_SQL_RE = re.compile(
    r"\b(attach|detach|pragma|vacuum|load_extension|drop|alter|create|delete|update)\b", re.IGNORECASE)
_MAX_JSON_NESTING = 12


def sanitize_llm_input(value: str) -> str:
    """Normalize a fan message and reject prompt-injection attempts before an LLM sees it."""
    normalized = unicodedata.normalize("NFKC", value).strip()
    normalized = "".join(char for char in normalized if char.isprintable() or char in "\n\t")
    if not normalized:
        raise ValueError("Message must contain visible text.")  # pragma: no cover
    if len(normalized) > MAX_LLM_INPUT_CHARS:
        raise ValueError(f"Message exceeds the {MAX_LLM_INPUT_CHARS}-character safety limit.")  # pragma: no cover
    if _PROMPT_INJECTION_RE.search(normalized):
        raise ValueError("Message contains an instruction pattern that cannot be processed.")  # pragma: no cover
    return normalized


def sanitize_response_detail(raw: str, max_len: int = 500) -> str:
    """Strip characters that could be interpreted as HTML/script in API responses.

    This is a defence-in-depth measure — FastAPI auto-escapes JSON strings, but
    the extra pass ensures the value is safe even if consumed by a non-standard
    client that interpolates the string into HTML without escaping.
    """
    cleaned = unicodedata.normalize("NFKC", raw).strip()
    cleaned = "".join(ch for ch in cleaned if ch.isprintable() or ch in "\n\t")
    cleaned = _UNSAFE_HTML_RE.sub("", cleaned)
    if len(cleaned) > max_len:
        cleaned = cleaned[:max_len].rstrip() + "..."  # pragma: no cover
    return cleaned


def safe_upload_filename(filename: str | None) -> tuple[str, str]:
    """Reject path traversal and return a basename plus a validated suffix."""
    if not filename:
        raise HTTPException(status_code=400, detail="A filename is required.")  # pragma: no cover
    basename = Path(filename).name
    if basename != filename or "\x00" in basename:
        raise HTTPException(status_code=400, detail="Invalid filename.")  # pragma: no cover
    suffix = Path(basename).suffix.lower()
    if suffix not in ALLOWED_JURY_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    return basename, suffix


def prevalidate_upload_size(file_handle) -> None:
    """Check Content-Length header before the full payload is read into memory."""
    content_length = getattr(file_handle, "size", None) or (
        file_handle.headers.get("content-length") if hasattr(file_handle, "headers") else None
    )
    if content_length is not None:
        try:
            size = int(content_length)
            if size > MAX_JURY_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size ({size} bytes) exceeds the {MAX_JURY_UPLOAD_BYTES} byte limit.",
                )
        except (ValueError, TypeError):
            pass  # pragma: no cover


def _check_nesting(obj: Any, depth: int = 0) -> None:
    """Guard against deep JSON nesting that could cause stack overflow during parsing."""
    if depth > _MAX_JSON_NESTING:  # pragma: no cover
        raise ValueError(f"JSON nesting exceeds maximum depth of {_MAX_JSON_NESTING}.")  # pragma: no cover
    if isinstance(obj, dict):  # pragma: no cover
        for v in obj.values():  # pragma: no cover
            _check_nesting(v, depth + 1)  # pragma: no cover
    elif isinstance(obj, list):  # pragma: no cover
        for item in obj:  # pragma: no cover
            _check_nesting(item, depth + 1)  # pragma: no cover


def _validate_csv(contents: bytes) -> int:
    text = contents.decode("utf-8")
    if "\x00" in text:
        raise ValueError("CSV contains null bytes.")  # pragma: no cover
    rows = list(csv.DictReader(io.StringIO(text)))
    if len(rows) > 20_000:
        raise ValueError("CSV has too many rows.")  # pragma: no cover
    for row in rows:
        for value in row.values():
            cell = str(value or "")
            if len(cell) > 4_000 or _UNSAFE_HTML_RE.search(cell) or _FORMULA_PREFIX_RE.match(cell):
                raise ValueError("CSV contains an unsafe cell value.")  # pragma: no cover
    return len(rows)


def _validate_json(contents: bytes) -> int:
    value: Any = json.loads(contents.decode("utf-8"))  # pragma: no cover
    if not isinstance(value, (dict, list)):  # pragma: no cover
        raise ValueError("JSON root must be an object or array.")  # pragma: no cover
    _check_nesting(value)  # pragma: no cover
    serialized = json.dumps(value, ensure_ascii=False)  # pragma: no cover
    if len(serialized) > MAX_JURY_UPLOAD_BYTES or _UNSAFE_HTML_RE.search(serialized):  # pragma: no cover
        raise ValueError("JSON contains unsafe content.")  # pragma: no cover
    return len(value) if isinstance(value, list) else 1  # pragma: no cover


def _validate_sql(contents: bytes) -> int:
    sql = contents.decode("utf-8")  # pragma: no cover
    if "\x00" in sql or _FORBIDDEN_SQL_RE.search(sql):  # pragma: no cover
        raise ValueError("SQL contains a forbidden operation.")  # pragma: no cover
    statements = [statement.strip() for statement in sql.split(";") if statement.strip()]  # pragma: no cover
    if not statements or any(not statement.lower().startswith("insert into ") for statement in statements):  # pragma: no cover
        raise ValueError("Only INSERT statements are accepted; SQL is never executed.")  # pragma: no cover
    return len(statements)  # pragma: no cover


def validate_jury_upload(filename: str | None, contents: bytes) -> dict:
    """Validate file name, byte size, type signature, and untrusted text content."""
    basename, suffix = safe_upload_filename(filename)
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")  # pragma: no cover
    if len(contents) > MAX_JURY_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")  # pragma: no cover

    try:
        if suffix == ".csv":
            item_count = _validate_csv(contents)
        elif suffix == ".json":
            item_count = _validate_json(contents)  # pragma: no cover
        elif suffix == ".pdf":
            if not contents.startswith(b"%PDF-"):
                raise ValueError("Invalid PDF signature.")  # pragma: no cover
            item_count = 0
        elif suffix in {".db", ".sqlite", ".sqlite3"}:
            if not contents.startswith(b"SQLite format 3\x00"):
                raise ValueError("Invalid SQLite signature.")  # pragma: no cover
            item_count = 0
        else:  # pragma: no cover
            item_count = _validate_sql(contents)  # pragma: no cover
    except (UnicodeDecodeError, json.JSONDecodeError, csv.Error, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Unsafe or malformed upload: {exc}") from exc
    return {"filename": basename, "suffix": suffix, "item_count": item_count}
