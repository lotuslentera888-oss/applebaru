"""Backend tests for account-based iPhone Settings API."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get(
    "REACT_APP_BACKEND_URL"
) else None

# Fallback: read from frontend/.env
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

ADMIN_ID = "admin@iphone.local"
ADMIN_PW = "admin123"
USER1_PW = "user123"
DEFAULT_IMEI = "356789104532198"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"identifier": ADMIN_ID, "password": ADMIN_PW})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session", autouse=True)
def _reset_db_state():
    """Ensure DB starts clean: delete non-user1 accounts, reset user1 device."""
    r = requests.post(f"{API}/auth/login", json={"identifier": ADMIN_ID, "password": ADMIN_PW})
    if r.status_code != 200:
        return
    h = {"Authorization": f"Bearer {r.json()['token']}"}
    accs = requests.get(f"{API}/admin/accounts", headers=h).json()
    for a in accs:
        if a["username"] != "user1":
            requests.delete(f"{API}/admin/accounts/{a['id']}", headers=h)
        else:
            requests.put(
                f"{API}/admin/accounts/{a['id']}",
                headers=h,
                json={"label": "Andi's iPhone", "device": {"imei": DEFAULT_IMEI, "device_name": "iPhone"}},
            )
    yield


# ---- Auth ----
class TestAuth:
    def test_login_admin(self):
        r = requests.post(f"{API}/auth/login", json={"identifier": ADMIN_ID, "password": ADMIN_PW})
        assert r.status_code == 200
        d = r.json()
        assert d["role"] == "admin"
        assert "token" in d

    def test_login_user1(self):
        r = requests.post(f"{API}/auth/login", json={"identifier": "user1", "password": USER1_PW})
        assert r.status_code == 200
        d = r.json()
        assert d["role"] == "user"
        assert d["username"] == "user1"

    def test_login_bad(self):
        r = requests.post(f"{API}/auth/login", json={"identifier": "user1", "password": "wrong"})
        assert r.status_code == 401

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_admin(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"


# ---- Role protection ----
class TestRoles:
    def test_user_cannot_access_admin(self):
        tok = requests.post(f"{API}/auth/login", json={"identifier": "user1", "password": USER1_PW}).json()["token"]
        r = requests.get(f"{API}/admin/accounts", headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 403

    def test_admin_cannot_access_me_device(self, admin_headers):
        r = requests.get(f"{API}/me/device", headers=admin_headers)
        assert r.status_code == 403


# ---- Admin account CRUD + user device flow (single flow to leave DB clean) ----
class TestAccountFlow:
    created_id = None

    def test_list_accounts_has_user1(self, admin_headers):
        r = requests.get(f"{API}/admin/accounts", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        usernames = [a["username"] for a in data]
        assert "user1" in usernames
        # Sanity check: user1 imei
        u1 = next(a for a in data if a["username"] == "user1")
        assert u1["device"]["imei"] == DEFAULT_IMEI

    def test_create_account_budi(self, admin_headers):
        r = requests.post(
            f"{API}/admin/accounts",
            headers=admin_headers,
            json={"username": "budi", "password": "budi123", "label": "Budi's iPhone"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["username"] == "budi"
        assert d["device"]["imei"] == DEFAULT_IMEI  # default seeded
        TestAccountFlow.created_id = d["id"]

    def test_duplicate_username_rejected(self, admin_headers):
        r = requests.post(
            f"{API}/admin/accounts",
            headers=admin_headers,
            json={"username": "budi", "password": "x"},
        )
        assert r.status_code == 400

    def test_admin_updates_budi_device(self, admin_headers):
        r = requests.put(
            f"{API}/admin/accounts/{TestAccountFlow.created_id}",
            headers=admin_headers,
            json={"device": {"imei": "358888888888888"}},
        )
        assert r.status_code == 200
        assert r.json()["device"]["imei"] == "358888888888888"

    def test_budi_login_and_device_reads_new_imei(self):
        r = requests.post(f"{API}/auth/login", json={"identifier": "budi", "password": "budi123"})
        assert r.status_code == 200
        tok = r.json()["token"]
        r2 = requests.get(f"{API}/me/device", headers={"Authorization": f"Bearer {tok}"})
        assert r2.status_code == 200
        assert r2.json()["imei"] == "358888888888888"

    def test_admin_resets_budi_password(self, admin_headers):
        r = requests.put(
            f"{API}/admin/accounts/{TestAccountFlow.created_id}",
            headers=admin_headers,
            json={"password": "newpass123"},
        )
        assert r.status_code == 200
        # New password works
        r2 = requests.post(f"{API}/auth/login", json={"identifier": "budi", "password": "newpass123"})
        assert r2.status_code == 200
        # Old fails
        r3 = requests.post(f"{API}/auth/login", json={"identifier": "budi", "password": "budi123"})
        assert r3.status_code == 401

    def test_user_edits_own_device(self):
        # user1 self-edit then revert
        tok = requests.post(f"{API}/auth/login", json={"identifier": "user1", "password": USER1_PW}).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        r = requests.put(f"{API}/me/device", headers=h, json={"imei": "356111222333444", "device_name": "Punya Budi"})
        assert r.status_code == 200
        assert r.json()["imei"] == "356111222333444"
        r2 = requests.get(f"{API}/me/device", headers=h)
        assert r2.json()["imei"] == "356111222333444"
        assert r2.json()["device_name"] == "Punya Budi"
        # Revert
        r3 = requests.put(f"{API}/me/device", headers=h, json={"imei": DEFAULT_IMEI, "device_name": "iPhone"})
        assert r3.status_code == 200
        assert r3.json()["imei"] == DEFAULT_IMEI

    def test_delete_budi(self, admin_headers):
        r = requests.delete(
            f"{API}/admin/accounts/{TestAccountFlow.created_id}", headers=admin_headers
        )
        assert r.status_code == 200
        # Verify gone
        r2 = requests.get(f"{API}/admin/accounts", headers=admin_headers)
        assert not any(a["username"] == "budi" for a in r2.json())

    def test_final_state(self, admin_headers):
        r = requests.get(f"{API}/admin/accounts", headers=admin_headers)
        data = r.json()
        assert len(data) == 1
        assert data[0]["username"] == "user1"
        assert data[0]["device"]["imei"] == DEFAULT_IMEI
        assert data[0]["device"]["device_name"] == "iPhone"
