# Ikon sumber asli — 1.2.1 (5)

Ikon Settings memakai file asli 146x146 dari pengguna, SHA-256 `73bc5d99c4a13278f906b60c8c98bad2f6d673ebd04efeeafd80f71565dc4a9a`. Resource sumber dan ikon web disalin byte-identik. Tidak ada redraw, recolor, sharpen, atau image generation. Aset AppIcon aktif diubah ukurannya ke 1024x1024 untuk syarat iOS tanpa mengubah desain. Xcode/iOS melakukan rasterisasi dan corner masking sesuai perangkat.

General, UI Light/Dark, backend dan fitur Phone tidak diubah. Kedua bundle shared dibuild ulang agar fingerprint source cocok. Hasil native baru akan diperiksa terhadap file sumber setelah unduhan.

Build [40077541908](https://github.com/lotuslentera888-oss/applebaru/actions/runs/40077541908) berhasil. Kedua IPA 1.2.1 build 5 tervalidasi. Ikon web di dalam kedua IPA byte-identik dengan file asli pengguna. Ikon native diekstrak langsung dari IPA Settings dan encoding PNG CgBI dikonversi untuk preview tanpa menggambar ulang. Resolusi bitmap native yang diekstrak 120x120; perbedaan pixel dari file 146x146 karena proses konversi ukuran tetap dibedakan dari kesamaan byte sumber.
