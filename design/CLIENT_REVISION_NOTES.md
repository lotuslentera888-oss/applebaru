# Acuan revisi komplain klien

Revisi mengikuti video IMG_1369.MOV dan analisis timestamp yang sudah diberikan. Native Settings asli pada iPhone klien adalah pembanding visual, bukan varian ikon estetika generik.

Dokumentasi Capacitor v8: https://capacitorjs.com/docs/apis/status-bar

`Style.Dark` berarti teks TERANG untuk latar gelap; `Style.Light` berarti teks GELAP untuk latar terang. Kode lama memakai Dark dengan komentar yang keliru. Overlay true menampilkan konten di bawah status bar transparan; inset aman ditangani satu kali oleh shell web. Plugin mensyaratkan UIViewControllerBasedStatusBarAppearance=YES.

Perubahan akan memakai status bar visible/Light, latar view dan window terang, root WebView edge-to-edge, dan padding env(safe-area-inset-*) hanya pada shell. iPhone fisik tetap diperlukan untuk memastikan tampilan Dynamic Island/status bar benar-benar sesuai. Tidak ada klaim 100% identik tanpa uji perangkat.

Halaman akun bersifat simulasi lokal; tidak meminta password Apple atau melakukan login Apple/penambahan pembayaran. Backend tetap https://24simulator.vip.
