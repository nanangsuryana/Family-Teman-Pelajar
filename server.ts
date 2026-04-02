import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";

const questionPool = [
  {
    question: "Apa alasan paling sering diucapkan murid kalau telat masuk kelas?",
    answers: [
      { text: "Macet", points: 40, keywords: ["macet", "jalanan", "kendaraan", "angkot"] },
      { text: "Bangun Kesiangan", points: 30, keywords: ["bangun", "kesiangan", "tidur", "telat"] },
      { text: "Hujan", points: 15, keywords: ["hujan", "gerimis", "banjir", "basah"] },
      { text: "Ban Bocor", points: 10, keywords: ["ban", "bocor", "mogok", "rusak", "bengkel"] },
      { text: "Lupa Jadwal", points: 5, keywords: ["lupa", "jadwal", "hari", "jam"] }
    ]
  },
  {
    question: "Sebutkan barang yang paling sering ketinggalan di meja kelas!",
    answers: [
      { text: "Alat Tulis / Pulpen", points: 45, keywords: ["pulpen", "pensil", "penghapus", "tipe x", "alat tulis", "kotak pensil"] },
      { text: "Buku", points: 25, keywords: ["buku", "modul", "catatan", "pr", "tugas"] },
      { text: "Botol Minum", points: 20, keywords: ["botol", "minum", "tupperware", "tumbler", "gelas"] },
      { text: "Jaket", points: 10, keywords: ["jaket", "sweater", "hoodie", "kardigan"] }
    ]
  },
  {
    question: "Menu makanan apa yang paling cepat habis saat bukber kantor?",
    answers: [
      { text: "Gorengan", points: 35, keywords: ["gorengan", "bakwan", "tempe", "tahu", "risol", "pastel"] },
      { text: "Es Buah / Takjil", points: 25, keywords: ["es", "buah", "takjil", "sirup", "manis", "kolak"] },
      { text: "Daging / Rendang", points: 20, keywords: ["daging", "rendang", "ayam", "sate", "opor"] },
      { text: "Kerupuk", points: 10, keywords: ["kerupuk", "peyek", "emping"] },
      { text: "Nasi", points: 5, keywords: ["nasi"] },
      { text: "Sambal", points: 5, keywords: ["sambal", "pedas", "saus"] }
    ]
  },
  {
    question: "Alasan apa yang paling sering dipakai murid saat izin tidak masuk les?",
    answers: [
      { text: "Sakit", points: 50, keywords: ["sakit", "demam", "pusing", "kurang sehat", "meriang"] },
      { text: "Acara Keluarga", points: 30, keywords: ["acara", "keluarga", "kondangan", "nikahan", "pulang kampung", "mudik"] },
      { text: "Hujan / Banjir", points: 20, keywords: ["hujan", "banjir", "cuaca", "gerimis", "deras"] }
    ]
  },
  {
    question: "Apa yang diam-diam sering dilakukan murid saat guru sedang menjelaskan di depan?",
    answers: [
      { text: "Main HP", points: 30, keywords: ["hp", "handphone", "gadget", "game", "sosmed", "chat", "mabar"] },
      { text: "Ngobrol", points: 25, keywords: ["ngobrol", "bercanda", "gosip", "bicara", "ngomong", "cerita"] },
      { text: "Tidur / Ngantuk", points: 20, keywords: ["tidur", "ngantuk", "merem", "rebahan", "meja"] },
      { text: "Melamun", points: 10, keywords: ["melamun", "bengong", "ngelamun", "kosong", "pikiran"] },
      { text: "Menggambar / Coret-coret", points: 10, keywords: ["gambar", "coret", "nulis", "menggambar", "buku"] },
      { text: "Makan Cemilan", points: 5, keywords: ["makan", "ngemil", "snack", "permen"] }
    ]
  },
  {
    question: "Benda apa yang paling sering dipinjam di kantor/kelas tapi jarang dikembalikan?",
    answers: [
      { text: "Pulpen", points: 40, keywords: ["pulpen", "pen", "bolpen", "pena"] },
      { text: "Tipe-X / Penghapus", points: 20, keywords: ["tipe x", "tipex", "penghapus", "stipo", "tip ex"] },
      { text: "Charger HP", points: 15, keywords: ["charger", "casan", "kabel", "adaptor"] },
      { text: "Spidol Boardmarker", points: 10, keywords: ["spidol", "marker", "boardmarker", "warna"] },
      { text: "Gunting / Cutter", points: 10, keywords: ["gunting", "cutter", "pisau", "selotip", "lakban"] },
      { text: "Kertas", points: 5, keywords: ["kertas", "hvs", "lembar"] }
    ]
  },
  {
    question: "Topik obrolan apa yang paling sering dibahas staf/guru saat jam istirahat?",
    answers: [
      { text: "Kelakuan Murid", points: 30, keywords: ["murid", "siswa", "anak", "kelakuan", "lucu", "bandel", "nilai"] },
      { text: "Makanan / Jajan", points: 20, keywords: ["makan", "jajan", "siang", "lauk", "pesan", "gofood", "shopeefood", "grabfood"] },
      { text: "Gaji / Bonus / THR", points: 15, keywords: ["gaji", "bonus", "thr", "uang", "cair", "bayaran", "keuangan"] },
      { text: "Film / Drakor", points: 15, keywords: ["film", "drakor", "korea", "series", "netflix", "bioskop", "drama"] },
      { text: "Liburan / Cuti", points: 10, keywords: ["libur", "cuti", "jalan", "healing", "weekend", "wisata"] },
      { text: "Gosip Rekan Kerja", points: 5, keywords: ["gosip", "teman", "rekan", "kantor"] },
      { text: "Politik", points: 5, keywords: ["politik", "presiden", "pemilu"] }
    ]
  },
  {
    question: "Apa yang biasanya paling sering ditanyakan Orang Tua murid saat ambil rapot?",
    answers: [
      { text: "Nilai / Perkembangan", points: 40, keywords: ["nilai", "skor", "perkembangan", "kemajuan", "rapor", "hasil", "prestasi"] },
      { text: "Kelakuan di Kelas", points: 30, keywords: ["kelakuan", "sikap", "nakal", "bandel", "aktif", "diam", "perilaku"] },
      { text: "Biaya / Diskon", points: 15, keywords: ["biaya", "bayar", "diskon", "promo", "spp", "harga", "uang"] },
      { text: "Jadwal Les", points: 10, keywords: ["jadwal", "hari", "jam", "masuk", "libur", "pengganti"] },
      { text: "Guru Pengajar", points: 5, keywords: ["guru", "pengajar", "tutor", "tentor", "favorit", "siapa"] }
    ]
  },
  {
    question: "Jajanan apa yang paling sering dibeli murid di sekitar tempat les?",
    answers: [
      { text: "Es / Minuman Manis", points: 30, keywords: ["es", "teh", "boba", "kopi", "pop ice", "minum", "haus"] },
      { text: "Cilok / Telur Gulung", points: 25, keywords: ["cilok", "telur", "cilor", "maklor", "aci", "cimol", "batagor"] },
      { text: "Gorengan", points: 20, keywords: ["gorengan", "tahu", "tempe", "bakwan", "cireng", "pisang"] },
      { text: "Seblak / Mie", points: 15, keywords: ["seblak", "mie", "indomie", "pedas", "bakso"] },
      { text: "Roti / Snack", points: 10, keywords: ["roti", "snack", "chiki", "biskuit", "jajan", "keripik"] }
    ]
  },
  {
    question: "Hal apa yang paling bikin panik staf/admin bimbel saat jam operasional?",
    answers: [
      { text: "Mati Lampu", points: 35, keywords: ["mati lampu", "listrik", "padam", "jepret", "genset", "gelap"] },
      { text: "Internet / WiFi Mati", points: 25, keywords: ["internet", "wifi", "koneksi", "jaringan", "putus", "lemot", "offline"] },
      { text: "Ortu Komplain / Marah", points: 20, keywords: ["ortu", "komplain", "marah", "ngamuk", "protes", "orang tua"] },
      { text: "Printer Rusak", points: 10, keywords: ["printer", "fotokopi", "rusak", "kertas", "macet", "tinta", "habis"] },
      { text: "Jadwal Bentrok", points: 10, keywords: ["jadwal", "bentrok", "guru", "kosong", "telat", "absen", "pengganti"] }
    ]
  },
  {
    question: "Sebutkan alasan klasik staf saat minta izin pulang cepat!",
    answers: [
      { text: "Sakit / Kurang Enak Badan", points: 40, keywords: ["sakit", "badan", "pusing", "demam", "meriang"] },
      { text: "Anak Rewel / Sakit", points: 25, keywords: ["anak", "rewel", "sakit", "nangis", "jemput"] },
      { text: "Urusan Keluarga / Bank", points: 15, keywords: ["keluarga", "bank", "ktp", "dokumen", "surat", "penting"] },
      { text: "Paket Datang", points: 10, keywords: ["paket", "kurir", "cod", "shopee", "tokped"] },
      { text: "Hujan Deras", points: 10, keywords: ["hujan", "deras", "banjir", "cuaca", "mendung"] }
    ]
  },
  {
    question: "Apa yang paling sering dicari saat mati lampu mendadak di malam hari?",
    answers: [
      { text: "Senter / HP", points: 40, keywords: ["senter", "hp", "handphone", "ponsel", "flash"] },
      { text: "Lilin", points: 25, keywords: ["lilin", "api"] },
      { text: "Korek Api", points: 15, keywords: ["korek", "mancis", "gas"] },
      { text: "Kipas Emergency", points: 10, keywords: ["kipas", "emergency", "panas", "gerah"] },
      { text: "Anak / Keluarga", points: 10, keywords: ["anak", "keluarga", "istri", "suami", "ibu", "bapak"] }
    ]
  },
  {
    question: "Sebutkan tempat pelarian paling favorit saat jam kosong di sekolah!",
    answers: [
      { text: "Kantin", points: 40, keywords: ["kantin", "warung", "makan", "jajan", "koperasi"] },
      { text: "Perpustakaan", points: 25, keywords: ["perpustakaan", "perpus", "baca", "buku"] },
      { text: "Masjid / Mushola", points: 20, keywords: ["masjid", "mushola", "tidur", "ibadah", "sholat"] },
      { text: "Tidur di Kelas", points: 15, keywords: ["tidur", "kelas", "meja", "bangku"] }
    ]
  },
  {
    question: "Apa yang biasanya langsung dicek pertama kali saat bangun tidur?",
    answers: [
      { text: "Jam / Waktu", points: 40, keywords: ["jam", "waktu", "pukul", "alarm"] },
      { text: "Pesan / Chat", points: 30, keywords: ["pesan", "chat", "wa", "whatsapp", "line"] },
      { text: "Media Sosial", points: 20, keywords: ["sosmed", "ig", "instagram", "tiktok", "twitter", "x", "facebook"] },
      { text: "Email Kerjaan", points: 10, keywords: ["email", "kerjaan", "tugas", "kantor"] }
    ]
  },
  {
    question: "Sebutkan barang yang wajib dibawa saat outing atau study tour!",
    answers: [
      { text: "Obat Anti Mabuk", points: 35, keywords: ["obat", "mabuk", "minyak", "angin", "tolak angin", "kayu putih", "antimo"] },
      { text: "Snack / Cemilan", points: 25, keywords: ["snack", "cemilan", "makanan", "jajan", "chiki"] },
      { text: "Powerbank", points: 20, keywords: ["powerbank", "pb", "charger", "casan"] },
      { text: "Kacamata Hitam", points: 10, keywords: ["kacamata", "hitam", "sunglasses", "gaya"] },
      { text: "Baju Ganti", points: 10, keywords: ["baju", "ganti", "pakaian", "celana", "jaket"] }
    ]
  },
  {
    question: "Apa yang sering dilakukan orang saat menunggu antrian panjang?",
    answers: [
      { text: "Main HP", points: 45, keywords: ["hp", "handphone", "sosmed", "game"] },
      { text: "Melamun", points: 25, keywords: ["melamun", "bengong"] },
      { text: "Ngobrol", points: 15, keywords: ["ngobrol", "tanya"] },
      { text: "Makan/Minum", points: 10, keywords: ["makan", "minum", "ngemil"] },
      { text: "Mendengarkan Musik", points: 5, keywords: ["musik", "lagu", "earphone", "headset"] }
    ]
  },
  {
    question: "Sebutkan benda yang sering ada di dalam tas wanita!",
    answers: [
      { text: "Dompet", points: 30, keywords: ["dompet", "uang"] },
      { text: "HP", points: 20, keywords: ["hp", "ponsel"] },
      { text: "Makeup / Lipstik", points: 15, keywords: ["makeup", "lipstik", "bedak", "cermin"] },
      { text: "Tisu", points: 15, keywords: ["tisu", "tissue"] },
      { text: "Kunci", points: 10, keywords: ["kunci", "rumah", "motor", "mobil"] },
      { text: "Sisir", points: 5, keywords: ["sisir"] },
      { text: "Parfum", points: 5, keywords: ["parfum", "wangi"] }
    ]
  },
  {
    question: "Apa yang biasanya dilakukan orang saat merasa bosan di rumah?",
    answers: [
      { text: "Nonton Film/TV", points: 35, keywords: ["nonton", "tv", "film", "youtube", "netflix"] },
      { text: "Tidur", points: 30, keywords: ["tidur", "istirahat", "rebahan"] },
      { text: "Makan", points: 20, keywords: ["makan", "ngemil", "masak"] },
      { text: "Main Game", points: 15, keywords: ["game", "main", "mabar"] }
    ]
  },
  {
    question: "Sebutkan hobi yang populer saat ini!",
    answers: [
      { text: "Olahraga / Gym", points: 30, keywords: ["olahraga", "gym", "lari", "sepeda"] },
      { text: "Memasak", points: 25, keywords: ["masak", "baking"] },
      { text: "Traveling", points: 20, keywords: ["jalan", "traveling", "liburan"] },
      { text: "Membaca", points: 15, keywords: ["baca", "buku", "novel"] },
      { text: "Berkebun", points: 10, keywords: ["kebun", "tanaman", "bunga"] }
    ]
  },
  {
    question: "Apa yang paling sering dibeli orang saat belanja online?",
    answers: [
      { text: "Baju / Fashion", points: 40, keywords: ["baju", "celana", "sepatu", "tas", "fashion"] },
      { text: "Skincare / Kosmetik", points: 25, keywords: ["skincare", "makeup", "kosmetik"] },
      { text: "Gadget / Elektronik", points: 15, keywords: ["hp", "laptop", "elektronik"] },
      { text: "Kebutuhan Rumah Tangga", points: 10, keywords: ["sabun", "deterjen", "tisu"] },
      { text: "Makanan / Snack", points: 10, keywords: ["makanan", "snack", "cemilan"] }
    ]
  },
  {
    question: "Sebutkan alasan orang suka terlambat datang ke pesta!",
    answers: [
      { text: "Dandan Lama", points: 40, keywords: ["dandan", "makeup", "siap-siap"] },
      { text: "Macet", points: 30, keywords: ["macet", "jalan"] },
      { text: "Sengaja Biar Gak Sepi", points: 15, keywords: ["sengaja", "fashionably late"] },
      { text: "Lupa Waktu", points: 10, keywords: ["lupa", "jam"] },
      { text: "Susah Cari Parkir", points: 5, keywords: ["parkir"] }
    ]
  },
  {
    question: "Apa yang biasanya dibawa saat pergi ke pantai?",
    answers: [
      { text: "Baju Renang", points: 30, keywords: ["renang", "bikini", "celana renang"] },
      { text: "Kacamata Hitam", points: 20, keywords: ["kacamata", "sunglasses"] },
      { text: "Sunblock", points: 15, keywords: ["sunblock", "sunscreen"] },
      { text: "Handuk", points: 15, keywords: ["handuk"] },
      { text: "Topi", points: 10, keywords: ["topi"] },
      { text: "Tikar", points: 10, keywords: ["tikar", "alas"] }
    ]
  },
  {
    question: "Sebutkan hewan peliharaan yang paling umum!",
    answers: [
      { text: "Kucing", points: 45, keywords: ["kucing", "cat"] },
      { text: "Anjing", points: 30, keywords: ["anjing", "dog"] },
      { text: "Ikan", points: 15, keywords: ["ikan", "fish"] },
      { text: "Burung", points: 10, keywords: ["burung", "bird"] }
    ]
  },
  {
    question: "Apa yang paling bikin malas saat hari Senin?",
    answers: [
      { text: "Bangun Pagi", points: 40, keywords: ["bangun", "pagi"] },
      { text: "Kerjaan Menumpuk", points: 30, keywords: ["kerja", "tugas"] },
      { text: "Macet", points: 20, keywords: ["macet"] },
      { text: "Upacara / Meeting", points: 10, keywords: ["upacara", "meeting", "rapat"] }
    ]
  },
  {
    question: "Sebutkan benda yang ada di ruang tamu!",
    answers: [
      { text: "Sofa / Kursi", points: 40, keywords: ["sofa", "kursi"] },
      { text: "Meja", points: 25, keywords: ["meja"] },
      { text: "TV", points: 15, keywords: ["tv", "televisi"] },
      { text: "Karpet", points: 10, keywords: ["karpet"] },
      { text: "Hiasan Dinding / Foto", points: 10, keywords: ["foto", "lukisan", "hiasan"] }
    ]
  },
  {
    question: "Apa yang biasanya dilakukan orang saat di dalam lift?",
    answers: [
      { text: "Diam / Lihat Lantai", points: 40, keywords: ["diam", "lantai", "bawah"] },
      { text: "Lihat HP", points: 30, keywords: ["hp", "ponsel"] },
      { text: "Ngaca", points: 20, keywords: ["ngaca", "cermin"] },
      { text: "Lihat Angka Lantai", points: 10, keywords: ["angka", "tombol"] }
    ]
  },
  {
    question: "Sebutkan rasa es krim yang paling populer!",
    answers: [
      { text: "Cokelat", points: 40, keywords: ["cokelat", "chocolate"] },
      { text: "Vanilla", points: 30, keywords: ["vanilla", "vanila"] },
      { text: "Strawberry", points: 20, keywords: ["strawberry", "stroberi"] },
      { text: "Durian", points: 10, keywords: ["durian"] }
    ]
  },
  {
    question: "Apa yang sering dilupakan orang saat keluar rumah?",
    answers: [
      { text: "Kunci", points: 35, keywords: ["kunci"] },
      { text: "HP", points: 30, keywords: ["hp", "ponsel"] },
      { text: "Dompet", points: 20, keywords: ["dompet"] },
      { text: "Masker", points: 10, keywords: ["masker"] },
      { text: "Matikan Lampu/AC", points: 5, keywords: ["lampu", "ac"] }
    ]
  },
  {
    question: "Sebutkan alat musik yang paling banyak dipelajari!",
    answers: [
      { text: "Gitar", points: 45, keywords: ["gitar"] },
      { text: "Piano / Keyboard", points: 30, keywords: ["piano", "keyboard"] },
      { text: "Biola", points: 15, keywords: ["biola"] },
      { text: "Drum", points: 10, keywords: ["drum"] }
    ]
  },
  {
    question: "Apa yang biasanya ada di dalam kotak P3K?",
    answers: [
      { text: "Plester", points: 30, keywords: ["plester", "hansaplast"] },
      { text: "Obat Merah / Betadine", points: 25, keywords: ["betadine", "obat merah"] },
      { text: "Kapas", points: 20, keywords: ["kapas"] },
      { text: "Kasa Steril", points: 15, keywords: ["kasa", "perban"] },
      { text: "Alkohol", points: 10, keywords: ["alkohol"] }
    ]
  },
  {
    question: "Sebutkan buah yang rasanya asam!",
    answers: [
      { text: "Jeruk Nipis / Lemon", points: 40, keywords: ["jeruk", "lemon", "nipis"] },
      { text: "Mangga Muda", points: 30, keywords: ["mangga"] },
      { text: "Asam Jawa", points: 20, keywords: ["asam"] },
      { text: "Kedondong", points: 10, keywords: ["kedondong"] }
    ]
  },
  {
    question: "Apa yang paling sering dikeluhkan orang saat cuaca panas?",
    answers: [
      { text: "Gerah / Berkeringat", points: 45, keywords: ["gerah", "keringat"] },
      { text: "Haus", points: 25, keywords: ["haus", "minum"] },
      { text: "Kulit Terbakar", points: 15, keywords: ["kulit", "gosong"] },
      { text: "Bau Badan", points: 10, keywords: ["bau"] },
      { text: "Listrik Mahal (AC)", points: 5, keywords: ["listrik", "ac"] }
    ]
  },
  {
    question: "Sebutkan benda yang sering hilang di rumah!",
    answers: [
      { text: "Remote TV", points: 35, keywords: ["remote"] },
      { text: "Kunci", points: 30, keywords: ["kunci"] },
      { text: "Gunting Kuku", points: 15, keywords: ["gunting kuku"] },
      { text: "Karet Rambut", points: 10, keywords: ["karet", "ikat rambut"] },
      { text: "Kaus Kaki Sebelah", points: 10, keywords: ["kaus kaki", "kaoskaki"] }
    ]
  },
  {
    question: "Apa yang biasanya dilakukan orang saat menunggu hujan reda?",
    answers: [
      { text: "Ngopi / Ngeteh", points: 35, keywords: ["kopi", "teh"] },
      { text: "Main HP", points: 30, keywords: ["hp", "ponsel"] },
      { text: "Melamun", points: 20, keywords: ["melamun"] },
      { text: "Ngobrol", points: 15, keywords: ["ngobrol"] }
    ]
  },
  {
    question: "Sebutkan sayuran yang sering ada di dalam sup!",
    answers: [
      { text: "Wortel", points: 40, keywords: ["wortel"] },
      { text: "Kentang", points: 30, keywords: ["kentang"] },
      { text: "Buncis", points: 15, keywords: ["buncis"] },
      { text: "Kubis / Kol", points: 10, keywords: ["kol", "kubis"] },
      { text: "Daun Bawang / Seledri", points: 5, keywords: ["daun bawang", "seledri"] }
    ]
  },
  {
    question: "Apa yang paling sering ditanyakan saat berkenalan dengan orang baru?",
    answers: [
      { text: "Nama", points: 50, keywords: ["nama"] },
      { text: "Tinggal di Mana", points: 20, keywords: ["tinggal", "alamat", "rumah"] },
      { text: "Pekerjaan / Sekolah", points: 20, keywords: ["kerja", "sekolah", "kuliah"] },
      { text: "Hobi", points: 10, keywords: ["hobi"] }
    ]
  },
  {
    question: "Sebutkan benda yang ada di atas meja kerja!",
    answers: [
      { text: "Laptop / Komputer", points: 35, keywords: ["laptop", "komputer", "pc"] },
      { text: "Buku Catatan", points: 20, keywords: ["buku", "catatan", "notes"] },
      { text: "Pulpen", points: 15, keywords: ["pulpen"] },
      { text: "Botol Minum", points: 15, keywords: ["minum", "botol"] },
      { text: "Foto Keluarga", points: 10, keywords: ["foto"] },
      { text: "Tanaman Kecil", points: 5, keywords: ["tanaman", "kaktus"] }
    ]
  },
  {
    question: "Apa yang biasanya dilakukan orang saat merasa gugup?",
    answers: [
      { text: "Gemetar", points: 30, keywords: ["gemetar"] },
      { text: "Keringat Dingin", points: 25, keywords: ["keringat"] },
      { text: "Bolak-balik ke Kamar Mandi", points: 20, keywords: ["wc", "toilet", "pipis"] },
      { text: "Bicara Cepat / Gagap", points: 15, keywords: ["bicara", "gagap"] },
      { text: "Mainkan Jari / Kuku", points: 10, keywords: ["jari", "kuku"] }
    ]
  },
  {
    question: "Sebutkan jenis olahraga yang menggunakan bola!",
    answers: [
      { text: "Sepak Bola", points: 40, keywords: ["bola", "sepakbola"] },
      { text: "Basket", points: 25, keywords: ["basket"] },
      { text: "Voli", points: 15, keywords: ["voli"] },
      { text: "Tenis", points: 10, keywords: ["tenis"] },
      { text: "Bulutangkis", points: 10, keywords: ["bulutangkis", "badminton"] }
    ]
  },
  {
    question: "Apa yang paling sering dicari orang di Google?",
    answers: [
      { text: "Berita Terbaru", points: 30, keywords: ["berita", "news"] },
      { text: "Resep Masakan", points: 25, keywords: ["resep", "masak"] },
      { text: "Lirik Lagu", points: 20, keywords: ["lirik", "lagu"] },
      { text: "Tutorial", points: 15, keywords: ["cara", "tutorial"] },
      { text: "Cuaca", points: 10, keywords: ["cuaca"] }
    ]
  },
  {
    question: "Sebutkan benda yang dibawa saat berkemah!",
    answers: [
      { text: "Tenda", points: 35, keywords: ["tenda"] },
      { text: "Sleeping Bag", points: 25, keywords: ["sleeping bag", "kantong tidur"] },
      { text: "Senter", points: 15, keywords: ["senter"] },
      { text: "Kompor Portable", points: 15, keywords: ["kompor"] },
      { text: "Jaket Tebal", points: 10, keywords: ["jaket"] }
    ]
  },
  {
    question: "Apa yang biasanya ada di dalam dompet selain uang?",
    answers: [
      { text: "KTP / SIM", points: 40, keywords: ["ktp", "sim", "kartu"] },
      { text: "Kartu ATM / Kredit", points: 30, keywords: ["atm", "kredit"] },
      { text: "Foto", points: 15, keywords: ["foto"] },
      { text: "Struk Belanja", points: 10, keywords: ["struk", "nota"] },
      { text: "Kartu Nama", points: 5, keywords: ["kartu nama"] }
    ]
  },
  {
    question: "Sebutkan alasan orang suka menonton film horor!",
    answers: [
      { text: "Suka Adrenalin", points: 40, keywords: ["adrenalin", "seru", "tegang"] },
      { text: "Penasaran", points: 30, keywords: ["penasaran"] },
      { text: "Biar Bisa Pelukan", points: 20, keywords: ["peluk", "takut"] },
      { text: "Suka Ceritanya", points: 10, keywords: ["cerita"] }
    ]
  },
  {
    question: "Apa yang paling sering dilakukan orang saat di pantai?",
    answers: [
      { text: "Berenang", points: 40, keywords: ["renang"] },
      { text: "Berjemur", points: 25, keywords: ["jemur"] },
      { text: "Foto-foto", points: 20, keywords: ["foto"] },
      { text: "Main Pasir", points: 15, keywords: ["pasir"] }
    ]
  },
  {
    question: "Sebutkan benda yang ada di dapur!",
    answers: [
      { text: "Kompor", points: 35, keywords: ["kompor"] },
      { text: "Panci / Wajan", points: 25, keywords: ["panci", "wajan"] },
      { text: "Pisau", points: 15, keywords: ["pisau"] },
      { text: "Piring / Gelas", points: 15, keywords: ["piring", "gelas"] },
      { text: "Kulkas", points: 10, keywords: ["kulkas"] }
    ]
  },
  {
    question: "Apa yang biasanya dilakukan orang saat menunggu pesawat di bandara?",
    answers: [
      { text: "Makan / Minum", points: 35, keywords: ["makan", "minum", "kafe"] },
      { text: "Main HP", points: 30, keywords: ["hp", "ponsel"] },
      { text: "Tidur", points: 20, keywords: ["tidur"] },
      { text: "Belanja di Duty Free", points: 15, keywords: ["belanja", "toko"] }
    ]
  },
  {
    question: "Sebutkan jenis bunga yang paling populer untuk hadiah!",
    answers: [
      { text: "Mawar", points: 50, keywords: ["mawar", "rose"] },
      { text: "Matahari", points: 20, keywords: ["matahari"] },
      { text: "Tulip", points: 15, keywords: ["tulip"] },
      { text: "Anggrek", points: 10, keywords: ["anggrek"] },
      { text: "Lily", points: 5, keywords: ["lily"] }
    ]
  },
  {
    question: "Apa yang paling sering bikin orang terbangun di tengah malam?",
    answers: [
      { text: "Ingin ke Kamar Mandi", points: 40, keywords: ["wc", "toilet", "pipis"] },
      { text: "Haus", points: 25, keywords: ["haus", "minum"] },
      { text: "Mimpi Buruk", points: 15, keywords: ["mimpi"] },
      { text: "Suara Berisik", points: 10, keywords: ["suara", "berisik"] },
      { text: "Nyamuk", points: 10, keywords: ["nyamuk"] }
    ]
  },
  {
    question: "Sebutkan benda yang ada di dalam kotak pensil!",
    answers: [
      { text: "Pensil / Pulpen", points: 40, keywords: ["pensil", "pulpen"] },
      { text: "Penghapus", points: 25, keywords: ["penghapus"] },
      { text: "Rautan", points: 15, keywords: ["rautan"] },
      { text: "Penggaris", points: 10, keywords: ["penggaris"] },
      { text: "Tipe-X", points: 10, keywords: ["tipe x"] }
    ]
  },
  {
    question: "Apa yang biasanya dilakukan orang saat hari libur?",
    answers: [
      { text: "Jalan-jalan", points: 35, keywords: ["jalan", "liburan"] },
      { text: "Tidur / Istirahat", points: 30, keywords: ["tidur", "istirahat"] },
      { text: "Bersih-bersih Rumah", points: 20, keywords: ["bersih", "rumah"] },
      { text: "Kumpul Keluarga", points: 15, keywords: ["keluarga"] }
    ]
  }
];

function shuffle(array: any[]) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

let questions: any[] = [];

function selectQuestions() {
  const shuffled = shuffle([...questionPool]);
  const eliminationCount = gameState.eliminationQuestionCount;
  const finalCount = gameState.finalQuestionCount;
  questions = shuffled.slice(0, eliminationCount + finalCount);
}

interface Player {
  id: string;
  socketId: string;
  name: string;
  branch: string;
  score: number;
  answeredCurrent: boolean;
  isFinalist: boolean;
}

let gameState = {
  status: 'lobby', // 'lobby' | 'question' | 'leaderboard'
  currentQuestionIndex: 0,
  revealedAnswers: [] as number[],
  players: {} as Record<string, Player>,
  round: 'elimination' as 'elimination' | 'final',
  winnerCount: 3,
  finalistCount: 3,
  leaderboardDisplayCount: 5,
  customLink: "",
  eliminationQuestionCount: 30,
  finalQuestionCount: 15,
  isLocked: false
};

const STATE_FILE = path.join(process.cwd(), 'gameState.json');

function loadGameState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      if (data) {
        const savedState = JSON.parse(data);
        // Merge saved state with default state to ensure all fields exist
        gameState = { ...gameState, ...savedState };
        console.log("Loaded game state from file");
      }
    }
  } catch (e) {
    console.error("Failed to load saved state", e);
  }
}

function saveGameState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(gameState, null, 2));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

async function startServer() {
  // Load state before starting server
  loadGameState();
  
  // Initialize questions if not already loaded or if empty
  if (questions.length === 0) {
    selectQuestions();
  }
  
  // Save state on exit
  process.on('SIGINT', () => {
    console.log('Saving state before exit...');
    saveGameState();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Saving state before exit...');
    saveGameState();
    process.exit(0);
  });

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const getActiveQuestions = () => {
      if (gameState.round === 'elimination') {
        return questions.slice(0, gameState.eliminationQuestionCount);
      } else {
        // Final questions start after elimination questions
        return questions.slice(gameState.eliminationQuestionCount, gameState.eliminationQuestionCount + gameState.finalQuestionCount);
      }
    };

    // Send initial state
    socket.emit("state_update", { ...gameState, questions: getActiveQuestions() });

    socket.on("request_state", () => {
      socket.emit("state_update", { ...gameState, questions: getActiveQuestions() });
    });

    socket.on("join", ({ id, name, branch }) => {
      if (gameState.players[id]) {
        // Reconnect existing player
        gameState.players[id].socketId = socket.id;
        gameState.players[id].name = name;
        gameState.players[id].branch = branch;
      } else {
        // New player
        gameState.players[id] = {
          id,
          socketId: socket.id,
          name,
          branch,
          score: 0,
          answeredCurrent: false,
          isFinalist: true
        };
      }
      saveGameState();
      io.emit("state_update", { ...gameState, questions: getActiveQuestions() });
    });

    socket.on("submit_answer", ({ id, answer }) => {
      const player = gameState.players[id];
      if (!player || gameState.status !== 'question' || player.answeredCurrent || gameState.isLocked) return;
      if (gameState.round === 'final' && !player.isFinalist) return;

      player.answeredCurrent = true;
      const activeQuestions = getActiveQuestions();
      const currentQ = activeQuestions[gameState.currentQuestionIndex];
      const lowerAnswer = answer.toLowerCase();

      // Check if answer matches any keyword
      let matchedIndex = -1;
      for (let i = 0; i < currentQ.answers.length; i++) {
        const ans = currentQ.answers[i];
        if (ans.keywords.some(kw => lowerAnswer.includes(kw))) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        // Add points (even if not revealed yet, they get points for guessing it)
        player.score += currentQ.answers[matchedIndex].points;
      }

      saveGameState();
      io.emit("state_update", { ...gameState, questions: getActiveQuestions() });
    });

    // Host actions
    socket.on("host_action", ({ action, payload }) => {
      if (action === "start_game") {
        if (gameState.status !== "lobby") return;
        selectQuestions(); // Randomize questions for the new game
        gameState.status = "question";
        gameState.currentQuestionIndex = 0;
        gameState.revealedAnswers = [];
        gameState.round = "elimination";
        gameState.isLocked = false;
        Object.values(gameState.players).forEach(p => {
          p.answeredCurrent = false;
        });
      } else if (action === "reset_game") {
        selectQuestions(); // Randomize questions on reset
        gameState.status = "lobby";
        gameState.currentQuestionIndex = 0;
        gameState.revealedAnswers = [];
        gameState.round = "elimination";
        gameState.isLocked = false;
        Object.values(gameState.players).forEach(p => {
          p.answeredCurrent = false;
          p.score = 0;
          p.isFinalist = true;
        });
      } else if (action === "start_final_round") {
        const isEliminationComplete = 
          gameState.round === 'elimination' && 
          gameState.status === 'leaderboard' && 
          gameState.currentQuestionIndex === (gameState.eliminationQuestionCount - 1);
        
        if (!isEliminationComplete || Object.keys(gameState.players).length === 0) return;

        const topN = gameState.finalistCount;
        const sorted = Object.values(gameState.players).sort((a, b) => b.score - a.score);
        const finalists = sorted.slice(0, topN).map(p => p.id);

        Object.values(gameState.players).forEach(p => {
          p.isFinalist = finalists.includes(p.id);
          p.answeredCurrent = false;
          // Reset score for final round? Usually yes.
          p.score = 0;
        });

        gameState.round = "final";
        gameState.currentQuestionIndex = 0; // Reset to 0 for final round indexing
        gameState.status = "question";
        gameState.revealedAnswers = [];
        gameState.isLocked = false;
      } else if (action === "next_question") {
        const activeQuestions = getActiveQuestions();
        if (gameState.currentQuestionIndex < activeQuestions.length - 1) {
          gameState.currentQuestionIndex++;
          gameState.status = "question";
          gameState.revealedAnswers = [];
          gameState.isLocked = false;
          Object.values(gameState.players).forEach(p => p.answeredCurrent = false);
        } else {
          gameState.status = "leaderboard";
        }
      } else if (action === "show_question") {
        gameState.status = "question";
      } else if (action === "lock_submissions") {
        gameState.isLocked = true;
      } else if (action === "reveal_all") {
        if (!gameState.isLocked) return;
        const activeQuestions = getActiveQuestions();
        const currentQ = activeQuestions[gameState.currentQuestionIndex];
        gameState.revealedAnswers = currentQ.answers.map((_: any, i: number) => i);
      } else if (action === "reveal_answer") {
        if (!gameState.isLocked) return;
        if (!gameState.revealedAnswers.includes(payload.index)) {
          gameState.revealedAnswers.push(payload.index);
        }
      } else if (action === "show_leaderboard") {
        gameState.status = "leaderboard";
      } else if (action === "back_to_lobby") {
        gameState.status = "lobby";
      } else if (action === "update_winner_count") {
        gameState.winnerCount = payload?.winnerCount || 3;
      } else if (action === "update_finalist_count") {
        gameState.finalistCount = payload?.finalistCount || 3;
      } else if (action === "update_leaderboard_display_count") {
        gameState.leaderboardDisplayCount = payload?.leaderboardDisplayCount || 5;
      } else if (action === "update_custom_link") {
        gameState.customLink = payload?.customLink || "";
      } else if (action === "update_elimination_question_count") {
        gameState.eliminationQuestionCount = payload?.eliminationQuestionCount || 30;
        selectQuestions(); // Update selected questions
      } else if (action === "update_final_question_count") {
        gameState.finalQuestionCount = payload?.finalQuestionCount || 15;
        selectQuestions(); // Update selected questions
      }
      saveGameState();
      io.emit("state_update", { ...gameState, questions: getActiveQuestions() });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // We no longer delete players on disconnect so they can reconnect
      // without losing their score or state.
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const viteModule = await import("vite");
    const createViteServer = viteModule.createServer;
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
