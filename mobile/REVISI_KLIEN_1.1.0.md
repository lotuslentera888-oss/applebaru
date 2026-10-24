# Revisi komplain klien — 1.1.0 (3)

Backend tetap **https://24simulator.vip**. Revisi ini mengikuti video komplain Settings/Phone dari klien.

Settings memakai varian ikon putih/perak terang, backing window/WebView putih, status bar LIGHT (teks gelap), overlay edge-to-edge, dan satu lapisan safe-area pada shell. Semua halaman detail memakai judul kompak di tengah; font sistem diterapkan eksplisit. Nilai tanggal menjaga hari/bulan/tahun tetap bersama agar tahun Warranty tidak berdiri sendiri. Simbol menu memakai ekspor SF Symbols asli dari macOS saat build, dengan fallback untuk simbol yang tidak tersedia.

Kartu teratas kini membuka Apple Account/iCloud-style. Nama/email profil dan switch akun tersimpan lokal per akun; tidak ada login Apple, pengumpulan password Apple, pembayaran, atau sinkronisasi iCloud sungguhan. Device Editor tetap tersedia terpisah, dengan back ke akun jika dibuka dari akun. Halaman detail Cellular dan gesture back yang diterima klien dipertahankan.

Phone mempertahankan baseline keypad sederhana dari arsip awal. Kode **\*#06#** membuka hasil otomatis setelah karakter terakhir; Call tetap tersedia sebagai fallback. Menutup hasil tidak memicu loop. Serial Number tidak ditampilkan pada hasil atau payload QR. Jika data perangkat belum tersedia, lembar hasil tetap terbuka dengan pemberitahuan yang sesuai, bukan identitas yang dibuat-buat.

Uji yang sudah berjalan: 11 kelompok regresi baseline, 9 kelompok keluhan pada Chromium, dan 9 kelompok keluhan pada WebKit. Pengujian memakai API mock; tidak ada akses atau perubahan database produksi. QR IMEI berhasil didekode. Koreksi pengelompokan tanggal diperiksa lagi secara terfokus setelah inspeksi visual.

Script build kini menyimpan fingerprint sumber frontend, bundel web, backend, dan versi. Build IPA menolak bundel stale/mismatch sebelum kompilasi Xcode. Ini mencegah source baru terkemas dengan UI lama.

## Instalasi dan batas hasil

IPA dibuild untuk **iPhone arm64**, bukan simulator, tanpa sertifikat atau provisioning profile. File **unsigned** harus ditandatangani sebelum dapat dipasang. Masa berlaku instalasi bergantung pada profile signing, bukan revisi UI ini.

Tidak ada iPhone fisik yang tersedia pada lingkungan pengerjaan. Karena itu **100% identik dengan Settings asli atau seluruh perilaku di iPhone klien belum dapat dijamin**. Setelah signing, pastikan versi terpasang 1.1.0 (3), lalu bandingkan area atas/Dynamic Island, ikon native, kartu akun, About, gesture back, dan hasil kode dengan video acuan.

Build GitHub untuk revisi ini akan dicatat setelah kompilasi berhasil.
