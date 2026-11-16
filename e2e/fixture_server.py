"""Serve the production income-tax route over an isolated synthetic SQLite ledger.

No application lifespan, credential access, personal database or external provider
is started. The temporary directory is removed when this process exits normally.
"""

from datetime import date
from pathlib import Path
import sqlite3
import sys
from tempfile import TemporaryDirectory

API_SRC = Path(__file__).resolve().parents[2] / "neg-finance-api" / "src"
sys.path.insert(0, str(API_SRC))

import api
import income_tax
from fastapi import FastAPI
import uvicorn


def create_fixture(path: Path) -> None:
    with sqlite3.connect(path) as connection:
        connection.executescript("""
            CREATE TABLE asset_markets (code TEXT, currency_code TEXT);
            CREATE TABLE asset_categories (
                code TEXT, market_code TEXT, asset_type_code TEXT);
            CREATE TABLE brokerage_category_settings (category_code TEXT, state TEXT);
            INSERT INTO asset_markets VALUES ('BR', 'BRL'), ('USA', 'USD');
            INSERT INTO asset_categories VALUES
                ('BR_SHARES', 'BR', 'SHARE'), ('USA_SHARES', 'USA', 'SHARE');
            INSERT INTO brokerage_category_settings VALUES
                ('BR_SHARES', 'archived'), ('USA_SHARES', 'enabled');
            CREATE TABLE BR_SHARES (
                ticker TEXT, id INTEGER, date TEXT, op TEXT,
                qtd REAL, amount REAL, mean_price REAL);
            INSERT INTO BR_SHARES VALUES
                ('IRTEST3', 1, '10/12/2024', 'C', 10, 10, 12.345),
                ('IRTEST3', 2, '20/06/2025', 'V', 10, 0, 0),
                ('NOVO3', 3, '10/01/2026', 'C', 2, 2, 15);
            CREATE TABLE USA_SHARES (
                ticker TEXT, id INTEGER, date TEXT, op TEXT,
                qtd REAL, amount REAL, mean_price REAL);
            INSERT INTO USA_SHARES VALUES
                ('FOREIGN', 1, '10/12/2024', 'C', 1.25, 1.25, 20.125);
        """)


if __name__ == "__main__":
    with TemporaryDirectory(prefix="neg-finance-income-tax-e2e-") as directory:
        database = Path(directory) / "synthetic.db"
        create_fixture(database)
        app = FastAPI()
        # Reuse production route registration, response model and dependency.
        app.include_router(api.app.router)
        app.dependency_overrides[api.get_income_tax_db_url] = lambda: f"sqlite:///{database.as_posix()}"
        income_tax.local_today = lambda: date(2026, 11, 16)
        uvicorn.run(app, host="127.0.0.1", port=18000, lifespan="off")
