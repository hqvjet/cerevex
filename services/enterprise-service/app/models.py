from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, DateTime, Integer, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


# companies table (schema must match the ERD)
class Company(Base):
    __tablename__ = "companies"

    company_id: Mapped[str] = mapped_column("company_id", String, primary_key=True)
    company_name: Mapped[str] = mapped_column(String, nullable=False)
    tax_code: Mapped[str] = mapped_column(String, nullable=False)
    province: Mapped[str] = mapped_column(String, nullable=False)
    hotline: Mapped[str] = mapped_column(String, nullable=False)
    company_email: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)
    industry_type: Mapped[str] = mapped_column(String, nullable=False)
    registered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# products table (schema must match the ERD)
class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column("product_id", String, primary_key=True)
    company_id: Mapped[str] = mapped_column(String, ForeignKey("companies.company_id"), nullable=False)
    product_name: Mapped[str] = mapped_column(String, nullable=False)
    third_party_id: Mapped[str] = mapped_column(String, nullable=False)
    # Ensure DEFAULT 0 at DB level per schema
    num_positive: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    num_neutral: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    num_negative: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    short_summary: Mapped[str] = mapped_column(String, nullable=False)
    added_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
