# Revisi iOS 26

- [x] Logo Settings dibuat lebih mirip referensi iOS 26, dan dipakai konsisten di launcher serta ikon native.
- [x] Serial number di layar *#06# dihilangkan, termasuk dari muatan QR di layar tersebut. Data About/editor tetap dipertahankan.
- [x] Isi Settings lebih rinci dan lebih banyak yang bisa diklik; menu yang sebelumnya hanya toast menjadi halaman simulasi dengan kontrol lokal yang tersimpan.
- [x] Tombol back memakai animasi slide kembali ala iPhone; tersedia gesture dari tepi kiri dan dukungan reduced motion.
- [x] Nama Wi-Fi Telkomsel yang di-hardcode dihapus; kondisi awal tidak terhubung dan label jaringan di Settings kosong.
- [x] Logo di dalam Settings diperbesar dan ikon menu diselaraskan dengan gaya iOS 26.
- [x] Bundel web Phone dan Settings diperbarui di folder www dan public iOS, serta diperiksa melalui build dan pengujian interaksi.
- [ ] Persyaratan bisa dipakai satu minggu di iPhone: panduan signing dan pemeriksaan tanggal kedaluwarsa disediakan. Build, signing, instalasi, dan uji tujuh hari pada iPhone fisik memerlukan Mac/Xcode serta perangkat; tidak dapat diverifikasi di Linux ini.

Aplikasi tetap simulasi, bukan pengganti Pengaturan/Phone sistem iOS. Kontrol lokal tidak mengubah pengaturan perangkat asli. Tidak ada penerbitan atau perubahan backend production.

## GitHub dan IPA

- [x] Unggah source revisi ke repositori publik `lotuslentera888-oss/applebaru`, sesuai izin pengguna, tanpa credential signing atau metadata lingkungan internal.
- [x] GitHub Actions mengompilasi dua aplikasi native iPhone arm64 dengan Xcode 26+, lalu menghasilkan `Phone-unsigned.ipa` dan `Settings-unsigned.ipa`.
- [x] Unduh kedua IPA hasil build dan serahkan kepada pengguna dengan penjelasan bahwa signing diperlukan sebelum instalasi.

## Domain backend pengguna

- [x] Backend kedua aplikasi memakai `https://24simulator.vip`, dengan API pada `/api`; URL preview lama dihapus dari konfigurasi dan bundel aktif. Bundel Phone/Settings dibuild ulang, perubahan disimpan di GitHub, dan dua IPA baru diserahkan setelah build native berhasil. Signing serta uji login akun/iPhone fisik tidak termasuk perubahan domain ini.

## Revisi komplain video klien

- [x] Settings memakai ikon native putih/terang sesuai pembanding klien, disinkronkan dengan ikon web dan asset catalog iOS.
- [x] Latar Settings menyambung terang sampai area status bar; konten aman terhadap Dynamic Island, tanpa inset ganda atau pita hitam yang disengaja. Kesesuaian fisik tetap perlu diuji pada iPhone klien.
- [x] Tipografi sistem diterapkan eksplisit; halaman About dan detail memakai header kompak, ukuran/spacing lebih rapi, serta nilai tidak pecah di tengah kata/angka.
- [x] Kartu akun membuka Apple Account/iCloud-style, bukan Device Info; informasi/control simulasi dapat diklik dan Device Editor lama tetap tersedia melalui jalur terpisah.
- [x] Simbol Cellular disesuaikan; halaman Cellular, clickability menu, serta swipe back yang diterima klien tetap dipertahankan.
- [x] Phone mempertahankan baseline visual lama, hasil *#06# muncul saat kode lengkap dan tetap dapat dibuka dengan Call; Serial Number tetap tidak ada di lembar hasil maupun QR.
- [x] Backend tetap https://24simulator.vip; dua bundel dibuild, pengujian regresi lulus, kode diunggah ke applebaru, dan dua IPA baru diserahkan sebagai unsigned. Signing dan bukti 100% identik pada iPhone fisik tidak diklaim tanpa pengujian perangkat.
