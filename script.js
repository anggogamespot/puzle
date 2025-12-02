/*
  Sliding Puzzle 3x3 dengan gambar "jawa.jpg"
  Fitur:
  - Mengacak posisi potongan saat halaman dimuat / tombol Acak Ulang
  - Klik potongan yang bersebelahan dengan kotak kosong untuk menggeser
  - Validasi kemenangan dan pesan "Selamat! Anda Menang!"

  Cara kerja singkat:
  - Kita punya 8 tile (0..7) + 1 kosong (null) di papan 3x3 (9 sel)
  - Setiap tile memiliki background-position sesuai potongan gambar aslinya
  - Papan disimpan sebagai array berukuran 9 yang merepresentasikan posisi tile
  - Ketika mengklik tile yang bersebelahan dengan kosong, kita swap keduanya
  - Kemenangan terjadi saat papan kembali ke urutan [0..7, null]
*/

(function () {
  const SIZE = 3;                 // Grid 3x3
  const TILE_COUNT = SIZE * SIZE - 1; // 8 tile + 1 kosong

  const puzzleEl = document.getElementById('puzzle');
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('resetBtn');

  // State papan: array berisi angka tile (0..7) dan null untuk kosong
  let board = Array.from({ length: SIZE * SIZE }, (_, i) => (i < TILE_COUNT ? i : null));

  // Element DOM untuk tile (disimpan agar mudah reposisi)
  const tiles = new Map(); // id -> HTMLElement

  // Inisialisasi: buat tile 0..7 dan masukkan ke container
  function initTiles() {
    for (let id = 0; id < TILE_COUNT; id++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.setAttribute('role', 'gridcell');
      tile.setAttribute('aria-label', `Potongan ${id + 1}`);

      // Hitung posisi potongan aslinya (untuk background-position)
      const origRow = Math.floor(id / SIZE);
      const origCol = id % SIZE;
      tile.style.setProperty('--x', String(origCol / (SIZE - 1))); // 0, 0.5, 1
      tile.style.setProperty('--y', String(origRow / (SIZE - 1))); // 0, 0.5, 1

      // Tambahkan badge nomor kecil (opsional)
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = String(id + 1);
      tile.appendChild(badge);

      // Klik untuk mencoba geser ke sel kosong
      tile.addEventListener('click', () => {
        tryMove(id);
      });

      tiles.set(id, tile);
      puzzleEl.appendChild(tile);
    }
  }

  // Kembalikan indeks (0..8) tempat tile tertentu berada di papan
  function indexOfTile(id) {
    return board.findIndex((v) => v === id);
  }

  // Kembalikan indeks sel kosong
  function indexOfEmpty() {
    return board.findIndex((v) => v === null);
  }

  // Cek apakah dua indeks saling bersebelahan (atas/bawah/kiri/kanan)
  function isAdjacent(i, j) {
    const ri = Math.floor(i / SIZE), ci = i % SIZE;
    const rj = Math.floor(j / SIZE), cj = j % SIZE;
    return Math.abs(ri - rj) + Math.abs(ci - cj) === 1;
  }

  // Render: posisikan setiap tile ke baris/kolom sesuai posisi saat ini
  function render() {
    for (let id = 0; id < TILE_COUNT; id++) {
      const pos = indexOfTile(id);
      const row = Math.floor(pos / SIZE);
      const col = pos % SIZE;
      const tile = tiles.get(id);
      tile.style.gridRow = String(row + 1);
      tile.style.gridColumn = String(col + 1);
    }

    // Opsional: tampilkan placeholder untuk sel kosong agar layout konsisten
    const existingEmpty = puzzleEl.querySelector('.empty');
    const emptyPos = indexOfEmpty();
    const emptyRow = Math.floor(emptyPos / SIZE);
    const emptyCol = emptyPos % SIZE;
    const emptyEl = existingEmpty || document.createElement('div');
    emptyEl.className = 'empty';
    emptyEl.style.gridRow = String(emptyRow + 1);
    emptyEl.style.gridColumn = String(emptyCol + 1);
    if (!existingEmpty) puzzleEl.appendChild(emptyEl);
  }

  // Coba geser tile id ke sel kosong jika bersebelahan
  function tryMove(id) {
    const tilePos = indexOfTile(id);
    const emptyPos = indexOfEmpty();
    if (!isAdjacent(tilePos, emptyPos)) return; // hanya bisa geser jika bersebelahan
    // Tukar tile dan kosong
    [board[tilePos], board[emptyPos]] = [board[emptyPos], board[tilePos]];
    render();
    checkWin();
  }

  // Hitung jumlah inversi untuk menentukan bisa-diselesaikan (solvable)
  function inversions(arr) {
    const seq = arr.filter((v) => v !== null);
    let inv = 0;
    for (let i = 0; i < seq.length; i++) {
      for (let j = i + 1; j < seq.length; j++) {
        if (seq[i] > seq[j]) inv++;
      }
    }
    return inv;
  }

  // Untuk grid lebar ganjil (3), kondisi solvable: jumlah inversi harus genap
  function isSolvable(arr) {
    return inversions(arr) % 2 === 0;
  }

  // Acak papan sampai solvable dan tidak dalam kondisi kemenangan
  function shuffleBoard() {
    const target = Array.from({ length: SIZE * SIZE }, (_, i) => (i < TILE_COUNT ? i : null));
    do {
      board = target.slice();
      // Fisher-Yates untuk 0..7, biarkan null di terakhir lalu kita swap acak posisi kosong juga
      for (let i = TILE_COUNT - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [board[i], board[j]] = [board[j], board[i]];
      }
      // Tempatkan kosong ke indeks acak 0..8
      const emptyIndex = Math.floor(Math.random() * (SIZE * SIZE));
      board.splice(emptyIndex, 0, null);
      board.pop();
    } while (!isSolvable(board) || isWin(board));
  }

  // Cek apakah board sudah urutan menang: [0..7, null]
  function isWin(arr = board) {
    for (let i = 0; i < SIZE * SIZE - 1; i++) {
      if (arr[i] !== i) return false;
    }
    return arr[SIZE * SIZE - 1] === null;
  }

  // Tampilkan pesan kemenangan
  function checkWin() {
    if (isWin()) {
      statusEl.textContent = 'Selamat! Anda Menang!';
    } else {
      statusEl.textContent = '';
    }
  }

  // Reset / Acak Ulang
  function reset() {
    shuffleBoard();
    render();
    checkWin();
  }

  // Inisialisasi awal
  initTiles();
  reset();

  // Tombol Acak Ulang
  resetBtn.addEventListener('click', reset);
})();
