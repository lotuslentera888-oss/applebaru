# iPhone Simulator — revisi iOS 26

Proyek React + FastAPI + MongoDB ini dikemas menjadi dua aplikasi iPhone berbasis Capacitor: **Settings** dan **Phone**. Paket ini bukan APK Android dan bukan IPA signed. Kode backend serta alur login/editor asli dipertahankan; tidak ada deployment layanan baru.

Versi terbaru **1.1.0 (3)** mengikuti komplain video klien. [Kedua IPA berhasil dibuild di GitHub](https://github.com/lotuslentera888-oss/applebaru/actions/runs/40072657378); file unsigned perlu signing sebelum instalasi. Rincian dan hasil pengujian tersedia di [catatan revisi klien](mobile/REVISI_KLIEN_1.1.0.md).

## Revisi

Ikon Settings memakai varian putih/perak terang berdasarkan pembanding klien. Ikon menu 32 px menampilkan glyph SF Symbols asli dari SDK Apple bila tersedia. Status bar memakai teks gelap di atas latar native putih dengan safe-area satu kali. About/detail memakai judul kompak dan tanggal tidak memisahkan tahun sendiri. Kartu akun membuka Apple Account/iCloud-style dengan kontrol lokal; editor perangkat tetap tersedia terpisah. Gesture dari tepi kiri memicu navigasi kembali. Reduced motion mengikuti preferensi sistem/browser.

Hasil `*#06#` kini muncul otomatis setelah kode lengkap; Serial Number dihapus, termasuk dari payload QR. Serial pada About dan editor perangkat tetap tersedia. Nama Wi-Fi Telkomsel yang sebelumnya hardcoded dihapus; kondisi awal tidak terhubung. Pilihan Wi-Fi/Bluetooth, toggle, selection, dan slider merupakan simulasi tersimpan lokal per akun. Menu Settings dan General yang sebelumnya toast kini mempunyai halaman detail. Fingerprint sumber/bundel mencegah pengemasan IPA dengan UI lama.

## Memasang pada iPhone

Panduan utama revisi adalah [mobile/REVISI_INSTALASI.md](mobile/REVISI_INSTALASI.md). Gunakan panduan ini untuk penjelasan masa berlaku tujuh hari dan pemeriksaan tanggal provisioning profile. Panduan lama di `mobile/README.md` dan `mobile/INSTALL_IOS.md` masih disimpan untuk referensi, tetapi ketentuan signing dan ekspor IPA mengikuti panduan revisi serta opsi aktual yang tersedia di Xcode.

Pada Mac dengan Node 22+ dan Xcode, jalankan `./mobile/ios-setup.sh`, lalu buka project masing-masing, pilih Team dan iPhone, dan **Run**. Backend aplikasi adalah `https://24simulator.vip`, dengan API pada `/api`. Untuk build web ulang, gunakan `./mobile/build-web.sh settings https://24simulator.vip` dan perintah yang sama untuk Phone.

## Struktur

```text
frontend/          Source UI React bersama dan konfigurasi build
backend/           API asli FastAPI + MongoDB, tidak diubah
mobile/phone/      Wrapper iOS Phone dan bundel lokal
mobile/settings/   Wrapper iOS Settings dan bundel lokal
design/references/ Acuan ikon/tampilan dan catatan sumber
scripts/           Server lokal dan uji regresi dengan API mock
test_reports/      Bukti pengujian revisi, bukan uji iPhone fisik
```

## Batas penggunaan

Aplikasi ini simulasi, bukan Settings atau Phone sistem. Tidak mengubah Wi-Fi, Bluetooth, IMEI, Face ID, atau perangkat asli. Profil Apple gratis berlaku tujuh hari sejak diterbitkan; kode tidak dapat memanjangkan masa berlakunya. Build native, signing, instalasi, dan penggunaan tujuh hari harus dilakukan dan diperiksa di Mac/iPhone pengguna.
