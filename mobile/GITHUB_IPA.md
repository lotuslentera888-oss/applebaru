# IPA dari GitHub Actions

Workflow **Build iOS IPA (unsigned)** menggunakan runner macOS dan Xcode untuk mengompilasi Phone serta Settings menjadi aplikasi native iPhone arm64, kemudian mengemasnya ke format IPA. Ini bukan file ZIP sumber yang sekadar diganti ekstensi.

Hasil bernama `Phone-unsigned.ipa` dan `Settings-unsigned.ipa`. **Keduanya belum ditandatangani Apple, sehingga tidak bisa langsung dipasang atau dibuka di iPhone.** Signing belum dilakukan karena tidak ada sertifikat/provisioning profile Apple diberikan pada tugas ini.

## Mengambil file

Buka tab **Actions** repositori, pilih workflow **Build iOS IPA (unsigned)**, dan buka run yang berhasil. Unduh artifact `phone-unsigned-ipa` serta `settings-unsigned-ipa`, lalu ekstrak masing-masing ZIP artifact untuk memperoleh file `.ipa`. Artifact disimpan 14 hari; workflow dapat dijalankan kembali lewat **Run workflow**. Commit ini memakai bundel web revisi yang sudah disertakan di folder `mobile/*/www`.

## Memasang pada iPhone

File unsigned harus ditandatangani lewat alur signing Apple atau alat sideload yang sesuai terlebih dahulu. Gunakan akun Apple sendiri melalui UI alat tersebut; jangan memasukkan password Apple, sertifikat `.p12`, private key, atau provisioning profile ke repositori atau chat. Keanggotaan gratis Personal Team memakai profil yang berlaku tujuh hari sejak diterbitkan, bukan sejak IPA dibuild.

Workflow ini tidak melakukan login Apple, tidak menghasilkan provisioning profile, tidak mendaftarkan perangkat, dan tidak memanjangkan masa berlaku aplikasi. Signing valid, izin perangkat, dan masa berlaku aktual tetap perlu diperiksa setelah proses sideload. Distribusi melalui TestFlight atau App Store memerlukan alur Apple yang berbeda; workflow unsigned ini bukan upload ke layanan tersebut.

Mengunggah proyek ke GitHub juga tidak menerbitkan backend FastAPI/MongoDB. URL backend lama tetap dipertahankan; login pertama memerlukan backend HTTPS yang aktif.

## Build yang berhasil

Source publik: https://github.com/lotuslentera888-oss/applebaru

Run sukses: https://github.com/lotuslentera888-oss/applebaru/actions/runs/39857097030

Commit source: `734a09f1d531c40591654f28fe846f81140f52c5`. Kedua job native selesai sukses. Signing Apple dan uji iPhone fisik tidak dilakukan.
