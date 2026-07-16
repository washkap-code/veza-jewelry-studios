"""Verify admin vs staff sidebar visibility on /admin.

Usage (from /dev-server):
    ADMIN_EMAIL=... ADMIN_PASS=... \\
    STAFF_EMAIL=... STAFF_PASS=... \\
    python tests/browser/sidebar_roles.py

The dev server must already be running at http://localhost:8080.
Screenshots are written next to this file under ./screenshots/.
"""

import asyncio
import os
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
SCREENSHOTS = Path(__file__).parent / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

ADMIN_LINKS = {
    "dashboard", "products", "collections", "gemstones", "gallery",
    "orders", "journal", "commissions", "newsletter", "calendar", "settings",
}
STAFF_LINKS = {"dashboard", "gallery", "orders", "journal"}
ADMIN_ONLY_LINKS = ADMIN_LINKS - STAFF_LINKS


async def sign_in(page, email: str, password: str) -> None:
    await page.goto(f"{BASE}/studio", wait_until="domcontentloaded")
    await page.get_by_label("Email").fill(email)
    await page.get_by_label("Password").fill(password)
    await page.get_by_role("button", name="Enter").click()
    await page.wait_for_url(f"{BASE}/admin", timeout=15_000)


async def sidebar_labels(page) -> set[str]:
    nav = page.get_by_test_id("admin-sidebar")
    await nav.wait_for(state="visible", timeout=10_000)
    links = nav.locator("a")
    count = await links.count()
    labels = set()
    for i in range(count):
        text = (await links.nth(i).inner_text()).strip().lower()
        if text:
            labels.add(text)
    return labels


async def check_role(pw, role: str, email: str, password: str, expected: set[str]) -> bool:
    browser = await pw.chromium.launch(headless=True)
    context = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await context.new_page()
    try:
        await sign_in(page, email, password)
        role_attr = await page.get_by_test_id("admin-sidebar").get_attribute("data-role")
        labels = await sidebar_labels(page)
        await page.screenshot(path=str(SCREENSHOTS / f"{role}_sidebar.png"))

        ok = True
        if role_attr != role:
            print(f"[{role}] FAIL: sidebar data-role={role_attr!r}, expected {role!r}")
            ok = False
        missing = expected - labels
        if missing:
            print(f"[{role}] FAIL: missing links: {sorted(missing)}")
            ok = False
        if role == "staff":
            leaked = labels & {x.lower() for x in ADMIN_ONLY_LINKS}
            if leaked:
                print(f"[{role}] FAIL: staff sees admin-only links: {sorted(leaked)}")
                ok = False
        if ok:
            print(f"[{role}] OK — sidebar links: {sorted(labels)}")
        return ok
    finally:
        await browser.close()


async def main() -> int:
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_pass = os.environ.get("ADMIN_PASS")
    staff_email = os.environ.get("STAFF_EMAIL")
    staff_pass = os.environ.get("STAFF_PASS")

    if not all([admin_email, admin_pass, staff_email, staff_pass]):
        print("SKIP: set ADMIN_EMAIL/ADMIN_PASS/STAFF_EMAIL/STAFF_PASS to run.")
        return 0

    async with async_playwright() as pw:
        admin_ok = await check_role(pw, "admin", admin_email, admin_pass, ADMIN_LINKS)
        staff_ok = await check_role(pw, "staff", staff_email, staff_pass, STAFF_LINKS)

    return 0 if admin_ok and staff_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
