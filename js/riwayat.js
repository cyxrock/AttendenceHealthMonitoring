// ISI DI DALAM FILE: js/riwayat.js
const searchInput = document.querySelector('.search-wrapper input');
const tableBodyElements = document.getElementById('table-body-absensi'); 

if (searchInput && tableBodyElements) {
    searchInput.addEventListener('input', function() {
        const filterText = searchInput.value.toLowerCase();
        const rows = tableBodyElements.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells.length < 2) continue; 

            const kolomTanggal = rows[i].cells[0].textContent.toLowerCase();
            const kolomNama = rows[i].cells[1].querySelector('h4') ? rows[i].cells[1].querySelector('h4').textContent.toLowerCase() : "";

            if (kolomTanggal.includes(filterText) || kolomNama.includes(filterText)) {
                rows[i].style.display = ""; 
            } else {
                rows[i].style.display = "none"; 
            }
        }
    });
}