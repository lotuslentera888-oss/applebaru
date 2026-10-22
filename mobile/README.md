# 📱 iPhone Simulator — 2 Aplikasi iOS Native (Capacitor)

Repo ini membungkus web app React menjadi **2 aplikasi iOS native terpisah**
(bukan PWA) memakai Capacitor. Tampilan & logika sama, hanya dikemas jadi app iOS.

| App | Folder | Bundle ID | Ikon di HP |
|-----|--------|-----------|-----------|
| **Phone**    | `mobile/phone`    | `com.iphonesim.phone`    | hijau "Phone" |
| **Settings** | `mobile/settings` | `com.iphonesim.settings` | perak "Settings" |

> 📲 **Tujuan:** install ke iPhone sendiri **tanpa** publish ke App Store,
> **tanpa** akun berbayar (cukup **Apple ID gratis**).
> Panduan super-detail ada di **[`INSTALL_IOS.md`](./INSTALL_IOS.md)**.
> README ini adalah versi ringkas **dari nol**.

---

## ✅ Bagian 1 — Yang SUDAH beres (tidak perlu kamu kerjakan)

Supaya tenang, ini semua sudah disiapkan di dalam repo:

- ✔️ Project iOS untuk **kedua** app sudah di-generate & siap dibuka Xcode:
  - `mobile/phone/ios/App/App.xcodeproj`
  - `mobile/settings/ios/App/App.xcodeproj`
- ✔️ Pakai **Swift Package Manager** → **TIDAK perlu CocoaPods / `pod install`**.
- ✔️ Web build produksi sudah dibundel & menunjuk backend lewat **HTTPS**.
- ✔️ **Icon + splash** custom sudah terpasang (Phone hijau, Settings perak).
- ✔️ Bundle ID, nama app, izin, target iOS 15 sudah benar.
- ✔️ Mode **offline** (About/Wi‑Fi/Bluetooth tetap tampil tanpa internet).

Jadi tugasmu tinggal: **install beberapa tool di Mac → jalankan 1 script →
buka Xcode → Run**. Detailnya di bawah.

---

## ⚠️ Bagian 2 — Hal paling penting

**Build iOS WAJIB di macOS + Xcode.** Ini aturan Apple, tidak bisa dari
Windows/Linux. Kamu tetap butuh **sebuah Mac** (punya sendiri / pinjam / sewa Mac
cloud seperti MacinCloud). Semua langkah di bawah dilakukan **di Mac**.

---

## 🧰 Bagian 3 — Yang harus kamu INSTALL di Mac (sekali saja)

Ini daftar semua yang perlu dipasang, urut. Kerjakan satu per satu.

### 3.1 Xcode
- Buka **Mac App Store** → cari **Xcode** → **Install** (ukurannya besar, sabar).
- Setelah selesai, **buka Xcode sekali** supaya ia menyelesaikan setup tambahan.
- Lalu jalankan di aplikasi **Terminal**:
  ```bash
  xcode-select --install
  ```

### 3.2 Homebrew (untuk memasang Node dengan mudah)
Tempel di Terminal:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Ikuti instruksinya sampai selesai.

### 3.3 Node.js versi 22+ (WAJIB 22 ke atas)
```bash
brew install node@22
```
Cek berhasil:
```bash
node -v      # harus muncul v22.x.x
```
> Kalau `node -v` bukan v22, jalankan: `brew link --overwrite --force node@22`
> lalu buka Terminal baru dan cek lagi.

### 3.4 Yarn
```bash
npm install -g yarn
```
Cek: `yarn -v` (muncul angka versi).

### 3.5 Apple ID gratis
Kamu cukup punya **Apple ID biasa** (yang dipakai di App Store). **Tidak perlu**
bayar Apple Developer Program. Nanti dipakai di Xcode (langkah signing).

> 🎉 **Tidak perlu install CocoaPods.** Project ini pakai Swift Package Manager,
> Xcode yang urus dependency otomatis.

---

## 📥 Bagian 4 — Ambil kode ke Mac

1. Di Emergent, klik tombol **"Save to Github"** (di kotak chat) untuk mengunggah
   repo ini ke akun GitHub-mu.
2. Di Mac, buka **Terminal** lalu:
   ```bash
   git clone <URL-REPO-GITHUB-KAMU>
   cd <nama-folder-repo>
   ```
   (Ganti `<URL-REPO-GITHUB-KAMU>` dengan link repo GitHub-mu.)

---

## ⚙️ Bagian 5 — Setup otomatis (1 perintah)

Dari **root repo** (folder hasil clone), jalankan:
```bash
chmod +x mobile/ios-setup.sh
./mobile/ios-setup.sh
```

Script ini otomatis untuk **kedua app**:
- `yarn install` → **memasang `node_modules`** (dependency yang tidak ikut di
  GitHub, jadi harus dipasang di sini — inilah "install" yang kamu maksud).
- `npx cap sync ios` → menyinkronkan web build + konfigurasi ke project iOS.

> Selesai tanpa error merah = siap lanjut. (Butuh internet.)

---

## 🖥️ Bagian 6 — Buka di Xcode

```bash
open mobile/phone/ios/App/App.xcodeproj
open mobile/settings/ios/App/App.xcodeproj
```
Saat pertama dibuka, Xcode akan **mengunduh Swift Packages** otomatis. Tunggu
sampai progress di pojok atas Xcode selesai.

---

## ✍️ Bagian 7 — Signing pakai Apple ID gratis

Lakukan untuk **tiap** app (Phone lalu Settings):

1. Klik nama project **App** di panel kiri → pilih **TARGET: App**.
2. Buka tab **Signing & Capabilities**.
3. Centang **Automatically manage signing**.
4. **Team** → **Add an Account…** → login Apple ID gratis → pilih
   **"(Namamu) — Personal Team"**.
5. **Bundle Identifier** biarkan (`com.iphonesim.phone` / `com.iphonesim.settings`).
   Kalau ditolak "sudah dipakai", tambah sufiks: `com.iphonesim.phone.namamu`.

---

## ▶️ Bagian 8 — Colok iPhone & Run

1. Sambungkan iPhone ke Mac via kabel. Di iPhone pilih **Trust** + passcode.
2. Di Xcode (bar atas, dekat tombol ▶) pilih **iPhone-mu** sebagai target.
3. Tekan **Run ▶** (`Cmd + R`). Xcode build + pasang app ke iPhone.
4. Kalau app tak mau buka ("Untrusted Developer"):
   **iPhone → Settings → General → VPN & Device Management → (Apple ID kamu) →
   Trust**, lalu buka app lagi.
5. Ulangi Bagian 6–8 untuk app **Settings**.

Selesai! Ada **2 ikon terpisah** di Home Screen: **Phone** & **Settings**
(app native, bukan PWA). 🎉

---

## 🔁 Setelah 7 hari (khusus Apple ID gratis)

App akan "expired". Cukup colok iPhone → buka Xcode → **Run ▶** lagi
(diperbarui 7 hari lagi). Akun berbayar = berlaku 1 tahun.

---

## 🔑 Login di aplikasi

- **User device**: `testuser` / `test1234`
- **Admin**: `admin@iphone.local` / `admin123`

Layar About/Wi‑Fi/Bluetooth punya **mode offline** (data terakhir tetap tampil +
banner "Tidak ada koneksi").

---

## 🌐 Ganti alamat backend (opsional)
```bash
./mobile/build-web.sh phone    https://backend-kamu.com
./mobile/build-web.sh settings https://backend-kamu.com
cd mobile/phone    && npx cap sync ios
cd ../settings     && npx cap sync ios
```
Lalu **Run ▶** ulang. (Backend harus **HTTPS**.)

## 🎨 Ganti icon / splash (opsional)
Ganti `mobile/<app>/resources/icon.png` (1024×1024) &
`mobile/<app>/resources/splash.png` (2732×2732), lalu:
```bash
cd mobile/phone && npx @capacitor/assets generate --ios && npx cap sync ios
cd ../settings  && npx @capacitor/assets generate --ios && npx cap sync ios
```

---

## 🆘 Troubleshooting singkat

| Masalah | Solusi |
|--------|--------|
| `Capacitor CLI requires NodeJS >= 22` | Update Node: `brew install node@22`, cek `node -v`. |
| Xcode minta signing | Signing & Capabilities → Add Account → Personal Team. |
| "Bundle identifier not available" | Tambah sufiks: `com.iphonesim.phone.namamu`. |
| "Untrusted Developer" | iPhone → Settings → General → VPN & Device Management → Trust. |
| App putih/kosong | Pastikan sudah jalan `./mobile/ios-setup.sh`. |
| Swift Packages gagal | Mac harus online; Xcode → File → Packages → Reset Package Caches. |
| App "expired" | Colok iPhone, buka Xcode, Run ▶ lagi. |

Butuh langkah lebih rinci lagi? Buka **[`INSTALL_IOS.md`](./INSTALL_IOS.md)**.
