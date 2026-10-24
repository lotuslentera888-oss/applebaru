# Revisi klien 1.2.0 (build 4)

Urutan dan grup Settings mengikuti screenshot asli yang baru diberikan: Battery masuk grup konektivitas; General dan kelompok tampilan berada sebelum Notifications. Face ID/SOS/Privacy, Game Center/iCloud/Wallet, dan Apps dipisah sebagaimana acuan. Jalur kontrol simulasi lama tetap tersedia.

Logo app kembali abu-abu dengan roda gigi putih. General memakai ikon menu tersendiri; ikon khusus yang tidak cocok dengan glyph generik diambil dari kotak ikon pada acuan pengguna. Foto akun, nama pribadi, SSID, screenshot lengkap dan video tidak disalin ke repositori.

Search dipindah ke pill transparan di bawah. Judul Settings menjadi kompak ketika halaman discroll. Viewport disesuaikan dengan VisualViewport agar pill tidak tertutup ketika area keyboard menyusut; inset landscape tetap diperhitungkan. Hanya satu elemen scroll aktif.

Light/Dark/Automatic kini diterapkan ke seluruh UI Settings, halaman detail, Account, About, field, switch dan dialog. Preference tetap per akun. Perubahan warna diterapkan sekaligus agar teks abu-abu tidak melewati permukaan abu-abu berkontras rendah. Automatic mengikuti penampilan sistem; mematikannya mempertahankan tema yang sedang terlihat. Native bridge mengatur trait window/controller/WebView dan style status bar hanya dalam aplikasi.

Phone tetap mempertahankan hasil otomatis *#06#. Serial tidak dimuat dalam lembar hasil atau QR. Barcode diberi bidang putih dan quiet zone agar bar hitam tidak menghilang di Dark; QR tetap berisi IMEI dan IMEI2. Backend tidak berubah: `https://24simulator.vip/api`.

Pengujian menggunakan fixture lokal dan API mock, tanpa mengubah data produksi. Responsif diperiksa pada lebar 320/375/390/430 di WebKit dan Chromium, dengan recheck jalur yang berubah serta viewport keyboard/landscape. Native iPhone arm64 dibuild dengan Xcode melalui GitHub Actions. Bukti build dan hasil unduhan akan dicatat setelah berhasil.

**Batas verifikasi:** preview WebKit bukan foto iPhone fisik. Dynamic Island, keyboard fisik iOS, warna layar dan instalasi perlu diperiksa pada perangkat klien. IPA tetap unsigned dan harus ditandatangani sebelum dipasang. Build ini tidak memperpanjang masa berlaku provisioning profile dan tidak menjamin tujuh hari tanpa memeriksa signing.

## Hasil uji lokal

Uji ordering, pilihan Appearance/persistence/Automatic, keterbacaan Dark di Settings/General/About/28 route generic/semua detail akun, legacy links, swipe kembali dari iCloud, QR tanpa serial dan bidang barcode lulus. Recheck final berisi 6 kelompok uji pada masing-masing WebKit dan Chromium, tanpa error JavaScript atau request tulis API. Empat kombinasi engine/tema untuk viewport keyboard, separator, dialog dan landscape juga lulus. Grid responsif 320/375/390/430 pada acceptance sebelumnya lulus; recheck dibatasi pada perubahan yang terdeteksi. Native iPhone fisik belum diuji.
