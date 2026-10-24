# Appearance simulator

Preference tunggal `settings.display.appearance` dibaca oleh `AppearanceProvider`; pilihan Light/Dark/Automatic tersimpan per akun. UI memakai token warna yang sama pada shell, header, list, Search, dialog, About, dan account. Automatic mengikuti `prefers-color-scheme`.

Plugin lokal `SimulatorAppearance` terdaftar melalui `capacitorDidLoad` pada custom `CAPBridgeViewController`. Setter berjalan di main thread dan memperbarui trait window/controller/WebView, serta dynamic `systemBackground`. Light tetap default; Automatic melepas override trait agar mengikuti sistem. JavaScript menyerialkan panggilan native, membuang pilihan lama, dan memilih `Style.Light` untuk teks status gelap atau `Style.Dark` untuk teks status terang.

Panduan yang dibaca: [Custom native iOS code Capacitor v8](https://capacitorjs.com/docs/ios/custom-code), [iOS plugin guide v8](https://capacitorjs.com/docs/plugins/ios), dan [Status Bar](https://capacitorjs.com/docs/apis/status-bar). Plugin hanya mengubah appearance aplikasi sendiri, bukan mode sistem iOS atau Apple Account nyata.

Logo app menggunakan aset iOS 26 abu-abu yang sudah tersedia dalam proyek. Ikon menu General dan ikon khusus memakai crop ikon dari screenshot asli yang diberikan pengguna. Hanya kotak ikon yang disimpan: nama, foto akun, SSID, screenshot lengkap, dan rekaman klien tidak disalin ke repo publik. Cropping/resizing tidak mengubah isi ikon. Crop beresolusi terbatas mengikuti kualitas lampiran sumber.
