from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    report_id: Mapped[str] = mapped_column("report_id", String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    # input_file_link removed per requirement
    num_positive: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    num_neutral: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    num_negative: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    short_summary: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
