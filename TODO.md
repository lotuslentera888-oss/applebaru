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

- [ ] Backend kedua aplikasi memakai `https://24simulator.vip`, dengan API pada `/api`; URL preview lama dihapus dari konfigurasi dan bundel aktif. Bundel Phone/Settings dibuild ulang, perubahan disimpan di GitHub, dan dua IPA baru diserahkan setelah build native berhasil. Signing serta uji login akun/iPhone fisik tidak termasuk perubahan domain ini.
