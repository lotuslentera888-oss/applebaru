# 📲 Panduan Install ke iPhone TANPA App Store

Dokumen ini menjelaskan cara meng-install **2 aplikasi iOS** dari repo ini
langsung ke iPhone milikmu (development / on-device), **tanpa** perlu publish ke
App Store dan **tanpa** akun Apple Developer berbayar (cukup **Apple ID gratis**).

| App | Folder project | Bundle ID | Muncul di iPhone sebagai |
|-----|----------------|-----------|--------------------------|
| **Phone**    | `mobile/phone/ios/App/App.xcodeproj`    | `com.iphonesim.phone`    | ikon hijau "Phone" |
| **Settings** | `mobile/settings/ios/App/App.xcodeproj` | `com.iphonesim.settings` | ikon perak "Settings" |

> Kedua project sudah **di-generate & Xcode-ready** (Capacitor 8 + Swift Package
> Manager, TANPA CocoaPods). Web build produksi sudah dibundel di dalamnya dan
> menunjuk backend lewat HTTPS. Icon + splash custom sudah terpasang.

---

## ⚠️ Yang WAJIB kamu tahu dulu (penting)

1. **Build iOS HANYA bisa di macOS + Xcode.** Ini aturan Apple, tidak bisa
   dilewati dari Windows/Linux. Kamu tetap butuh sebuah **Mac** untuk langkah
   build & install. Pilihan kalau tidak punya Mac:
   - Pinjam Mac (teman/kantor), atau
   - Sewa Mac cloud (mis. **MacinCloud**, **MacStadium**) lalu colok iPhone via
     fitur remote (agak ribet untuk device fisik), atau
   - Pakai Mac mini/MacBook bekas.
2. Dengan **Apple ID gratis (Personal Team)** ada batasan wajar:
   - Sertifikat app **kedaluwarsa tiap 7 hari** → tinggal **Run ulang** dari Xcode
     untuk memperbarui.
   - Maksimal **3 app** hasil sideload per device (kita hanya 2, aman).
   - Beberapa capability premium tidak tersedia (tidak kita pakai).
   Kalau punya **Apple Developer Program** ($99/th), sertifikat berlaku 1 tahun.
3. iPhone dan Mac harus terhubung (kabel USB Lightning/USB-C, atau Wi-Fi setelah
   sekali colok).

---

## 🧰 Prasyarat di Mac (sekali saja)

Install ini di Mac:

- **Xcode** — dari Mac App Store (gratis). Buka sekali agar selesai instalasi
  komponen tambahan.
- **Command Line Tools**:
  ```bash
  xcode-select --install
  ```
- **Node 22+** (Capacitor 8 butuh Node ≥ 22). Cara termudah pakai Homebrew:
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install node@22
  ```
  Pastikan `node -v` menampilkan v22.x.
- **Yarn**:
  ```bash
  npm install -g yarn
  ```

> Kamu **tidak perlu** CocoaPods. Project ini pakai Swift Package Manager; Xcode
> yang mengurus dependency secara otomatis.

---

## 1) Ambil kode ke Mac

Kalau repo sudah di GitHub (pakai tombol **"Save to Github"** di Emergent):

```bash
git clone <URL-REPO-GITHUB-KAMU>
cd <nama-folder-repo>
```

---

## 2) Setup sekali jalan (restore dependency + sync)

Dari **root repo**:

```bash
chmod +x mobile/ios-setup.sh
./mobile/ios-setup.sh
```

Script ini otomatis untuk **kedua app**:
- `yarn install` → mengembalikan `node_modules` (dibutuhkan Swift Package Manager
  karena `node_modules` sengaja tidak ikut di-commit).
- `npx cap sync ios` → menyinkronkan web build + konfigurasi ke project iOS.

> Mau satu app saja? `./mobile/ios-setup.sh phone` atau
> `./mobile/ios-setup.sh settings`.

---

## 3) Buka project di Xcode

```bash
open mobile/phone/ios/App/App.xcodeproj
# dan
open mobile/settings/ios/App/App.xcodeproj
```

Saat pertama dibuka, Xcode akan **resolve Swift Packages** (butuh internet, tunggu
beberapa saat sampai selesai — lihat progress di pojok atas Xcode).

---

## 4) Signing pakai Apple ID gratis (Personal Team)

Lakukan untuk **tiap** app (Phone & Settings):

1. Di panel kiri, klik project **App** (paling atas) → pilih **TARGET: App**.
2. Buka tab **Signing & Capabilities**.
3. Centang **Automatically manage signing**.
4. Di **Team**, klik **Add an Account…** → login dengan **Apple ID gratis** kamu
   → lalu pilih team **"(Namamu) — Personal Team"**.
5. **Bundle Identifier** biarkan apa adanya:
   - Phone: `com.iphonesim.phone`
   - Settings: `com.iphonesim.settings`
   > Kalau Xcode bilang bundle ID sudah dipakai orang lain, tambahkan sufiks unik,
   > mis. `com.iphonesim.phone.namamu`. (ID bebas untuk pemakaian pribadi.)
6. Pastikan tidak ada tanda error merah di bagian Signing.

---

## 5) Colok iPhone & Run

1. Sambungkan iPhone ke Mac (USB). Di iPhone muncul **"Trust This Computer?"** →
   pilih **Trust**, masukkan passcode.
2. Di Xcode, bar atas (di sebelah tombol ▶), pilih **device iPhone kamu** sebagai
   target (bukan simulator, karena kita mau install ke HP fisik).
3. Tekan tombol **Run ▶** (atau `Cmd + R`).
4. Xcode akan build + memasang app ke iPhone.

### Pertama kali: percayai developer cert di iPhone
Kalau app tidak mau terbuka dan muncul "Untrusted Developer":

`iPhone → Settings → General → VPN & Device Management → (Apple ID kamu) →
Trust`

Setelah itu buka lagi aplikasinya dari Home Screen.

5. Ulangi langkah 4–5 (dan bagian ini) untuk app **Settings**.

Selesai — kamu akan punya **2 ikon terpisah** di Home Screen: **Phone** (hijau) dan
**Settings** (perak). Keduanya app native (bukan PWA).

---

## 🔁 Setelah 7 hari (Apple ID gratis)

App akan berhenti bisa dibuka ("expired"). Cukup:
1. Colok iPhone ke Mac.
2. Buka project di Xcode → **Run ▶** lagi.
Sertifikat langsung diperbarui 7 hari lagi. (Pakai akun berbayar → berlaku 1 tahun.)

---

## 🔑 Login di dalam aplikasi

Aplikasi butuh login ke backend (lewat HTTPS). Akun uji yang tersedia:

- **User device**: username `testuser` / password `test1234`
- **Admin panel**: email `admin@iphone.local` / password `admin123`

> Layar About, Wi-Fi, dan Bluetooth punya **mode offline**: kalau tidak ada
> internet, data terakhir tetap tampil dengan banner "Tidak ada koneksi —
> menampilkan data tersimpan".

---

## 🌐 Ganti alamat backend (opsional)

Secara default app menunjuk ke backend production yang sudah diset. Kalau backend
kamu pindah URL, rebuild web bundle lalu sync lagi:

```bash
# dari root repo
./mobile/build-web.sh phone    https://backend-kamu.com
./mobile/build-web.sh settings https://backend-kamu.com

cd mobile/phone    && npx cap sync ios
cd ../settings     && npx cap sync ios
```
Lalu **Run ▶** ulang di Xcode.

> Syarat: backend harus **HTTPS** (App Transport Security iOS memblokir HTTP biasa).

---

## 🎨 Ganti icon / splash (opsional)

1. Ganti file sumber:
   - `mobile/phone/resources/icon.png`  &  `mobile/phone/resources/splash.png`
   - `mobile/settings/resources/icon.png` & `mobile/settings/resources/splash.png`
   (icon 1024×1024, splash 2732×2732, PNG, tanpa transparansi untuk icon)
2. Regenerate:
   ```bash
   cd mobile/phone    && npx @capacitor/assets generate --ios && npx cap sync ios
   cd ../settings     && npx @capacitor/assets generate --ios && npx cap sync ios
   ```
3. Run ▶ ulang di Xcode.

> Icon & splash bawaan repo ini dibuat oleh script `mobile/make_icons.py`
> (butuh Python + Pillow). Jalankan `python3 mobile/make_icons.py` untuk membuat ulang.

---

## 📦 Bikin file .IPA (opsional, untuk simpan/kirim)

Kalau butuh file `.ipa` (mis. untuk arsip atau install via alat lain):

1. Di Xcode: menu **Product → Archive** (target device = "Any iOS Device").
2. Setelah selesai, jendela **Organizer** terbuka → **Distribute App**.
3. Pilih **Development** (atau **Ad Hoc** kalau perlu untuk device tertentu).
4. Ikuti wizard → hasil `.ipa` disimpan ke folder yang kamu pilih.

> Dengan Personal Team gratis, `.ipa` hasilnya untuk **development/ad-hoc** saja
> (bukan untuk App Store) dan tetap tunduk pada batas 7 hari.

---

## 🆘 Troubleshooting cepat

| Masalah | Solusi |
|--------|--------|
| `The Capacitor CLI requires NodeJS >= 22` | Update Node ke 22+ (`brew install node@22`), cek `node -v`. |
| Xcode: "No account / signing required" | Signing & Capabilities → Add Account (Apple ID) → pilih Personal Team. |
| "Bundle identifier is not available" | Tambah sufiks unik: `com.iphonesim.phone.namamu`. |
| App tidak mau dibuka: "Untrusted Developer" | iPhone → Settings → General → VPN & Device Management → Trust. |
| Layar app putih/kosong | Pastikan sudah jalan `./mobile/ios-setup.sh` (butuh `node_modules` + `cap sync`). |
| Swift Packages gagal resolve | Pastikan Mac online; File → Packages → Reset Package Caches, lalu build ulang. |
| Login gagal di app | Cek koneksi internet & URL backend (HTTPS). Akun: `testuser` / `test1234`. |
| Setelah beberapa hari app "expired" | Colok iPhone, buka Xcode, Run ▶ lagi. |

---

## ✅ Ringkas alur (cheat sheet)

```bash
# di Mac, sekali:
brew install node@22 && npm i -g yarn && xcode-select --install

# tiap kali dari repo:
git clone <repo> && cd <repo>
chmod +x mobile/ios-setup.sh && ./mobile/ios-setup.sh
open mobile/phone/ios/App/App.xcodeproj      # set Team → Run ▶
open mobile/settings/ios/App/App.xcodeproj   # set Team → Run ▶
```

Selamat mencoba! 🎉
