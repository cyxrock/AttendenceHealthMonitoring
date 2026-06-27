import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; // Tambahkan onAuthStateChanged

// 1. Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5Zzz6TyWU_Sk6rJ9ZxYR--AOmaVvHqW8",
    authDomain: "absensi-vitalsign.firebaseapp.com",
    databaseURL: "https://absensi-vitalsign-default-rtdb.firebaseio.com/",
    projectId: "absensi-vitalsign",
    storageBucket: "absensi-vitalsign.firebasestorage.app",
    appId: "1:852130724137:web:eb4607c03c594090095f38"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// =========================================================================
// SCRIPT PELINDUNG: JIKA USER TIDAK LOGIN / SUDAH LOGOUT, PAKSA KE LOGIN
// =========================================================================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada user yang login (karena habis logout atau maksa klik back)
        // Paksa tendang balik ke halaman login secara realtime
        window.location.replace("index.html");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. LOGIKA JAM DIGITAL & TANGGAL
    // ==========================================
    function updateClock() {
        const clockElement = document.getElementById('digital-clock');
        const dateElement = document.getElementById('date-now');

        if (clockElement && dateElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;

            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('id-ID', options);
        }
    }
    setInterval(updateClock, 1000);
    updateClock(); 

    // ==========================================
    // 2. LOGIKA REALTIME FIREBASE (TABEL & CARD)
    // ==========================================
    const absensiRef = ref(db, 'absensi_log');
    const tableBody = document.querySelector('.crm-table tbody');
    const totalHadirElement = document.querySelector('.card-single h1');

    async function getNama(id) {
        try {
            const snapshot = await get(ref(db, 'karyawan/' + id));
            return snapshot.exists() ? snapshot.val().nama : "Responden " + id;
        } catch (error) {
            return "ID: " + id;
        }
    }

    if (tableBody) {
        onValue(absensiRef, (snapshot) => {
            const data = snapshot.val();
            
            if (!data) {
                tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada data masuk.</td></tr>";
                if(totalHadirElement) totalHadirElement.textContent = "0";
                return;
            }

            const logs = [];
            Object.keys(data).forEach(key => {
                logs.push({ firebaseKey: key, ...data[key] });
            });
            
            logs.reverse(); 
            if(totalHadirElement) totalHadirElement.textContent = logs.length;

            const renderRows = logs.map(async (val) => {
                const namaUser = await getNama(val.id_jari);
                const suhuVal = val.suhu || 0;
                const suhuClass = suhuVal > 37.5 ? 'red' : (suhuVal < 35 ? 'blue' : 'green');
                
                return `
                    <tr>
                        <td>
                            <div class="user-info">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(namaUser)}&background=random" alt="">
                                <div><h4>${namaUser}</h4><small>ID Jari: ${val.id_jari}</small></div>
                            </div>
                        </td>
                        <td><span class="status ${suhuClass}">${suhuVal}°C</span></td>
                        <td><span class="status green">${val.bpm || 0} BPM</span></td>
                        <td><span class="status green">${val.spo2 || 0}%</span></td>
                        <td><span class="status green">${val.last_checkin || '-'}</span></td>
                    </tr>
                `;
            });

            Promise.all(renderRows).then(htmlRows => {
                tableBody.innerHTML = htmlRows.join('');
            });
        });
    }

    // ==========================================
    // 3. LOGIKA SEARCH BAR (Filter Tabel)
    // ==========================================
    const searchInput = document.querySelector('.search-wrapper input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.crm-table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // ==========================================
    // 4. PERBAIKAN TOTAL FUNGSI LOGOUT (Firebase v10 + Anti-Back)
    // ==========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault(); 
            
            const yakinLogout = confirm("Anda yakin ingin logout?");
            
            if (yakinLogout) {
                // Hapus data cache sesi lokal browser
                localStorage.clear();
                sessionStorage.clear();

                // Menggunakan fungsi signOut bawaan Firebase v10 Modular
                signOut(auth).then(() => {
                    console.log("Firebase Sign Out berhasil.");
                    
                    // ANTI-BACK TRICK: Mengganti riwayat halaman agar browser lupa jalan kembali ke dashboard
                    window.location.replace("index.html");
                }).catch((error) => {
                    console.error("Gagal Logout Firebase: ", error);
                    // Jika ada kendala jaringan, paksa pindah halaman agar tidak stuck
                    window.location.replace("index.html");
                });

            } else {
                console.log("Logout dibatalkan");
            }
        });
    }
});