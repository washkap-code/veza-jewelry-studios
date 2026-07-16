"""Verify /admin access control.

- Admin (is_admin=true) can reach /admin and sees the admin sidebar.
- Non-admin authenticated user (client) is blocked — the "Restricted"
  panel renders and no admin sidebar is present.
- Unauthenticated visitor is redirected off /admin to /account.

Usage (from /dev-server):
    ADMIN_EMAIL=... ADMIN_PASS=... \\
    CLIENT_EMAIL=... CLIENT_PASS=... \\
    python tests/browser/admin_access.py

Dev server must be running at http://localhost:8080. Screenshots go
to tests/browser/screenshots/.
"""

import asyncio
import os
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
SCREENSHOTS = Path(__file__).parent / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)


async def sign_in_via_account(page, email: str, password: str) -> None:
    """Sign in a non-admin (client) user via /account."""
    await page.goto(f"{BASE}/account", wait_until="domcontentloaded")
    await page.get_by_label("Email").first.fill(email)
    await page.get_by_label("Password").first.fill(password)
    # /account has both sign-in and sign-up; click the sign-in submit.
    await page.get_by_role("button", name="Sign in").first.click()
    await page.wait_for_load_state("networkidle")


async def sign_in_via_studio(page, email: str, password: str) -> None:
    """Sign in an admin user via /studio."""
    await page.goto(f"{BASE}/studio", wait_until="domcontentloaded")
    await page.get_by_label("Email").fill(email)
    await page.get_by_label("Password").fill(password)
    await page.get_by_role("button", name="Enter").click()
    await page.wait_for_url(f"{BASE}/admin", timeout=15_000)


async def check_admin(pw, email: str, password: str) -> bool:
    browser = await pw.chromium.launch(headless=True)
    ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await ctx.new_page()
    try:
        await sign_in_via_studio(page, email, password)
        sidebar = page.get_by_test_id("admin-sidebar")
        await sidebar.wait_for(state="visible", timeout=10_000)
        role = await sidebar.get_attribute("data-role")
        await page.screenshot(path=str(SCREENSHOTS / "admin_access_admin.png"))
        if role != "admin":
            print(f"[admin] FAIL: data-role={role!r}, expected 'admin'")
            return False
        if not page.url.startswith(f"{BASE}/admin"):
            print(f"[admin] FAIL: url={page.url}, expected /admin")
            return False
        print("[admin] OK — reached /admin with admin sidebar")
        return True
    except Exception as e:
        print(f"[admin] FAIL: {e}")
        await page.screenshot(path=str(SCREENSHOTS / "admin_access_admin_fail.png"))
        return False
    finally:
        await browser.close()


async def check_client_blocked(pw, email: str, password: str) -> bool:
    browser = await pw.chromium.launch(headless=True)
    ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await ctx.new_page()
    try:
        await sign_in_via_account(page, email, password)
        await page.goto(f"{BASE}/admin", wait_until="domcontentloaded")
        # Give the auth context time to settle.
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(SCREENSHOTS / "admin_access_client.png"))

        sidebar_count = await page.get_by_test_id("admin-sidebar").count()
        if sidebar_count > 0:
            print("[client] FAIL: admin sidebar rendered for non-admin user")
            return False

        # Either redirected away from /admin, or Restricted panel shown.
        if not page.url.startswith(f"{BASE}/admin"):
            print(f"[client] OK — redirected off /admin to {page.url}")
            return True
        body = (await page.locator("body").inner_text()).lower()
        if "restricted" in body or "atelier only" in body:
            print("[client] OK — Restricted panel shown, no admin sidebar")
            return True
        print("[client] FAIL: still on /admin without Restricted panel")
        return False
    except Exception as e:
        print(f"[client] FAIL: {e}")
        await page.screenshot(path=str(SCREENSHOTS / "admin_access_client_fail.png"))
        return False
    finally:
        await browser.close()


async def check_anonymous_blocked(pw) -> bool:
    browser = await pw.chromium.launch(headless=True)
    ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
    page = await ctx.new_page()
    try:
        await page.goto(f"{BASE}/admin", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(SCREENSHOTS / "admin_access_anon.png"))
        sidebar_count = await page.get_by_test_id("admin-sidebar").count()
        if sidebar_count > 0:
            print("[anon] FAIL: admin sidebar rendered for unauthenticated visitor")
            return False
        if page.url.startswith(f"{BASE}/admin"):
            body = (await page.locator("body").inner_text()).lower()
            if "restricted" in body or "atelier only" in body:
                print("[anon] OK — Restricted panel shown")
                return True
            print(f"[anon] FAIL: still on /admin url={page.url}")
            return False
        print(f"[anon] OK — redirected to {page.url}")
        return True
    finally:
        await browser.close()


async def main() -> int:
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_pass = os.environ.get("ADMIN_PASS")
    client_email = os.environ.get("CLIENT_EMAIL")
    client_pass = os.environ.get("CLIENT_PASS")

    if not all([admin_email, admin_pass, client_email, client_pass]):
        print("SKIP: set ADMIN_EMAIL/ADMIN_PASS/CLIENT_EMAIL/CLIENT_PASS to run.")
        return 0

    async with async_playwright() as pw:
        a = await check_admin(pw, admin_email, admin_pass)
        c = await check_client_blocked(pw, client_email, client_pass)
        n = await check_anonymous_blocked(pw)

    return 0 if (a and c and n) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
