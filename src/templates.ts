import { Template } from './types';

export const templates: Template[] = [
  {
    id: 'makan-siang',
    title: 'Makan Siang Dekat Kantor',
    description: 'Biar ga pusing musyawarah mufakat tiap jam 12 siang.',
    category: 'Kuliner',
    options: ['Soto Ayam', 'Bakso Solo', 'Gado-Gado', 'Nasi Padang', 'Pecel Ayam', 'Mie Gacoan', 'Ketoprak', 'Sate Ayam']
  },
  {
    id: 'nonton-apa',
    title: 'Nonton Genre Apa Malam Ini?',
    description: 'Biar ga habis waktu 1 jam cuma buat scroll katalog streaming.',
    category: 'Hiburan',
    options: ['Horor Lokal', 'Action Hollywood', 'Drakor Lucu', 'Anime Shonen', 'Romance Cry-Fest', 'Sci-Fi Mindbending', 'Thriller Menegangkan']
  },
  {
    id: 'nongkrong',
    title: 'Nongkrong Di Mana Kita?',
    description: 'Menyelesaikan konflik klasik "Terserah kamu" waktu mau jalan.',
    category: 'Sosial',
    options: ['Family Mart', 'Bagi Kopi', 'Rindang Tedoeh', 'Warkop Point', 'Atap Teras', 'Warmindo Premium', 'Rumah Teman Saja']
  },
  {
    id: 'kopi-minum',
    title: 'Asupan Caffeine / Gula',
    description: 'Daripada jantungan mikirin menu, biarkan takdir yang memilih.',
    category: 'Kuliner',
    options: ['Kopi Susu Gula Aren', 'Matcha Latte Ice', 'Es Teh Manis Jumbo', 'Americano (Double Shot)', 'Caramel Macchiato', 'Avocado Juice', 'Thai Milk Tea']
  },
  {
    id: 'weekend-activity',
    title: 'Aktivitas Weekend Anti-Sambar',
    description: 'Mengatasi rasa bersalah bimbang mau produktif atau rebahan.',
    category: 'Gaya Hidup',
    options: ['Rebahan Sambil TikTok-an', 'Jogging Tipis-Tipis', 'Beres-Beres Kamar Kos', 'Deep Talk Sama Kasur', 'Nyicil Belajar Skill Baru', 'Jalan ke Mall Cuci Mata', 'Nyetrika Baju Seminggu']
  }
];

export const pastelColors = [
  '#F87171', // red
  '#FB923C', // orange
  '#FBBF24', // amber
  '#34D399', // emerald
  '#60A5FA', // blue
  '#818CF8', // indigo
  '#A78BFA', // violet
  '#F472B6', // pink
  '#2DD4BF', // teal
  '#A3E635'  // lime
];
