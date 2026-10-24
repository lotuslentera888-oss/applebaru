# Instalasi revisi pada iPhone

Paket ini adalah dua proyek aplikasi **iOS Capacitor**: Phone dan Settings. File APK adalah format Android dan tidak dapat diinstal pada iPhone. Paket revisi berisi kode sumber, aset ikon, serta bundel web yang diperbarui; bukan IPA yang telah ditandatangani.

## Memasang versi revisi

Gunakan Mac dengan Xcode dan Node 22+. Dari folder proyek, jalankan `./mobile/ios-setup.sh` untuk memasang dependency wrapper dan menyinkronkan bundel yang sudah disertakan. Buka `mobile/settings/ios/App/App.xcodeproj` dan `mobile/phone/ios/App/App.xcodeproj`.

Pada masing-masing target App, aktifkan **Automatically manage signing**, pilih Team sendiri, dan pilih iPhone fisik yang terhubung. Pertahankan Bundle Identifier lama jika ingin memperbarui aplikasi yang sudah terpasang; perubahan identifier membuat aplikasi baru dengan penyimpanan lokal baru. Jalankan **Run** dari Xcode. Ikuti permintaan Trust dan Developer Mode pada iPhone bila diperlukan.

Backend aplikasi memakai domain pengguna: `https://24simulator.vip`. API client menggunakan `https://24simulator.vip/api`. Login pertama dan pengambilan data perangkat memerlukan backend HTTPS yang aktif. Untuk membuild ulang dengan domain ini:

```bash
cd frontend
yarn install --frozen-lockfile
cd ..
./mobile/build-web.sh settings https://24simulator.vip
./mobile/build-web.sh phone https://24simulator.vip
./mobile/ios-setup.sh
```

Backend harus menjalankan API asli dan databasenya. Penggantian URL ini tidak menerbitkan atau mengubah layanan backend. Domain HTTPS dan endpoint `/api/auth/me` serta `/api/me/device` dapat diakses saat pengecekan; kedua endpoint dilindungi autentikasi dan merespons 401 tanpa token. Login dengan akun pengguna belum diuji.

## Agar dapat dipakai satu minggu

Menurut Apple, provisioning profile Personal Team gratis berlaku **7 hari sejak diterbitkan**. Bukan tujuh hari sejak pertama aplikasi dibuka, dan tidak bisa diperpanjang oleh kode aplikasi. Signing kedua aplikasi mendekati waktu pemasangan, cek tanggal kedaluwarsa aktual, lalu install ke iPhone. Jika butuh melewati batas tersebut, gunakan metode distribusi Apple yang sesuai melalui keanggotaan developer; masa pakai aktual tetap ditentukan profil dan jalur distribusinya. Tidak ada pembelian atau pendaftaran akun dilakukan di sini.[1]

Untuk memeriksa hasil build iPhone dari Xcode pada Mac, temukan produk `.app` melalui **Products → Show in Finder**, lalu jalankan:

```bash
./mobile/check-signing-expiry.sh /path/ke/Settings.app
./mobile/check-signing-expiry.sh /path/ke/Phone.app
```

Script hanya membaca tanggal profil. Ia tidak melakukan signing, tidak menjadwalkan refresh, dan tidak mengubah masa berlaku. Saat profil kedaluwarsa, build dan install ulang melalui Xcode diperlukan.[1]

Sesudah berhasil login dan data pertama tersimpan, session dan data perangkat terakhir tetap tersedia saat koneksi terputus. Kontrol simulasi juga disimpan lokal per akun. Revisi menghapus script/font eksternal yang tidak diperlukan dari HTML sehingga UI tidak bergantung pada CDN untuk mulai terbuka. Login ditolak, akun dicabut, data lokal dihapus, atau profil kedaluwarsa tetap dapat menghentikan penggunaan; keadaan tersebut tidak dibypass.

## Batas fungsi dan pengujian

Pengaturan Wi-Fi, Bluetooth, Face ID, baterai, serta menu lain di aplikasi merupakan simulasi. Menekan kontrolnya tidak mengubah Settings sistem, tidak menyalakan radio perangkat, dan tidak mengubah IMEI asli. Data perangkat yang diatur di backend tetap data simulasi.

Build iOS, signing, instalasi fisik, kemiripan piksel terhadap model iPhone tertentu, dan penggunaan tujuh hari belum diuji pada iPhone pengguna. Lingkungan pengerjaan ini Linux tanpa Xcode. Lakukan pemeriksaan di perangkat setelah instalasi, termasuk membuka kedua aplikasi tanpa internet dan setelah restart iPhone.

## References

[1]: https://developer.apple.com/help/account/basics/about-your-developer-account/ "Apple Developer account overview and Personal Team limitations"
