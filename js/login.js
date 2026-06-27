document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Ambil elemen form login
    const loginForm = document.getElementById('login-form');
    const messageElement = document.getElementById('login-message');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('login-button');

    // 2. Cek apakah form ada di halaman ini (penting agar tidak error di index.html)
    if (loginForm) {

        // Data Login Dummy (Hardcoded untuk simulasi)
        const validEmail = "admin@iot.com";
        const validPassword = "admin";

        // 3. Tambahkan event listener saat tombol 'Masuk' ditekan
        loginForm.addEventListener('submit', function(e) {
            
            e.preventDefault(); // Mencegah reload halaman

            // Ubah tombol jadi loading
            const originalText = submitButton.innerText;
            submitButton.innerText = "Memproses...";
            submitButton.disabled = true;
            submitButton.style.opacity = "0.7";

            // Hapus pesan lama
            messageElement.innerText = "";
            messageElement.className = "";

            // Simulasi proses login (delay 1 detik)
            setTimeout(function() {
                
                const inputEmailVal = emailInput.value;
                const inputPassVal = passwordInput.value;

                if (inputEmailVal === validEmail && inputPassVal === validPassword) {
                    // JIKA SUKSES
                    messageElement.innerText = "Login Berhasil! Mengalihkan...";
                    messageElement.className = "success"; // Warna Hijau (dari CSS)
                    
                    // =========================================================
                    // TAMBAHAN: Pasang tiket login aktif di browser admin
                    // =========================================================
                    sessionStorage.setItem("statusLogin", "aktif");

                    // Redirect ke dashboard
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1000);

                } else {
                    // JIKA GAGAL
                    messageElement.innerText = "Email atau Password salah!";
                    messageElement.className = "error"; // Warna Merah (dari CSS)
                    
                    // Kembalikan tombol seperti semula
                    submitButton.innerText = originalText;
                    submitButton.disabled = false;
                    submitButton.style.opacity = "1";
                }

            }, 800); // Waktu tunggu pura-pura (0.8 detik)
        });
    }
});