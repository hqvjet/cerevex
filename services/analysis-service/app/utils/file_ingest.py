from __future__ import annotations

from io import BytesIO
from typing import List, Tuple, Optional
import pandas as pd


ALLOWED_MIME = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
ALLOWED_EXT = {".csv", ".xls", ".xlsx"}


class SchemaError(ValueError):
    pass


def _read_any(file_bytes: bytes, filename: str) -> pd.DataFrame:
    name = filename.lower()
    bio = BytesIO(file_bytes)
    if name.endswith(".csv"):
        try:
            return pd.read_csv(bio)
        except UnicodeDecodeError:
            bio.seek(0)
            return pd.read_csv(bio, encoding="utf-8-sig")
    elif name.endswith(".xlsx") or name.endswith(".xls"):
        return pd.read_excel(bio)
    else:
        raise ValueError("Unsupported file type")


def validate_and_extract(df: pd.DataFrame) -> Tuple[List[Optional[str]], List[str]]:
    cols = {c.strip().lower(): c for c in df.columns}
    if "content" not in cols:
        raise SchemaError("Missing required column 'content'")
    content_col = cols["content"]
    title_col = cols.get("title")

    # Filter to rows with non-null content first to keep alignment
    filtered = df[df[content_col].notna()].copy()
    filtered[content_col] = filtered[content_col].astype(str)

    contents = filtered[content_col].tolist()
    if title_col and title_col in filtered.columns:
        titles_series = filtered[title_col].fillna("").astype(str)
        titles = [t if t != "" else None for t in titles_series.tolist()]
    else:
        titles = [None] * len(contents)

    return titles, contents
