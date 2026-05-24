export interface FoodVisual {
  imageUrl: string;
  emoji: string;
  categoryName: string;
  color: string; // Soft pastel tag color
}

const foodDatabase: { keywords: string[]; visual: FoodVisual }[] = [
  {
    keywords: ['family mart', 'famima'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=160&h=160&fit=crop&q=80',
      emoji: '🏪',
      categoryName: 'Family Mart FamiCafe',
      color: '#10B981'
    }
  },
  {
    keywords: ['bagi kopi'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=160&h=160&fit=crop&q=80',
      emoji: '☕',
      categoryName: 'Bagi Kopi Hits',
      color: '#8B4513'
    }
  },
  {
    keywords: ['rindang tedoeh', 'rindang'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=160&h=160&fit=crop&q=80',
      emoji: '🌳',
      categoryName: 'Rindang Tedoeh Outdoor',
      color: '#34D399'
    }
  },
  {
    keywords: ['warkop point'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1594972108034-9be1179cb151?w=160&h=160&fit=crop&q=80',
      emoji: '🍜',
      categoryName: 'Warkop Point Cozy',
      color: '#F59E0B'
    }
  },
  {
    keywords: ['atap teras', 'teras'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=160&h=160&fit=crop&q=80',
      emoji: '🌇',
      categoryName: 'Atap Teras Rooftop',
      color: '#EC4899'
    }
  },
  {
    keywords: ['bakso', 'meatball', 'pentol'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=160&h=160&fit=crop&q=80',
      emoji: '🍲',
      categoryName: 'Bakso Hangat',
      color: '#FF8A9A'
    }
  },
  {
    keywords: ['soto', 'soup', 'sop '],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1626804475315-9644b37a2f4b?w=160&h=160&fit=crop&q=80',
      emoji: '🥣',
      categoryName: 'Soto Gurih',
      color: '#FFB84C'
    }
  },
  {
    keywords: ['gacoan', 'mie', 'noodle', 'ramen', 'bakmie', 'indomie', 'samyang', 'seblak'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=160&h=160&fit=crop&q=80',
      emoji: '🍜',
      categoryName: 'Mie Pedas/Lezat',
      color: '#FF6B6B'
    }
  },
  {
    keywords: ['padang', 'rendang', 'nasi padang', 'gulai'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&h=160&fit=crop&q=80',
      emoji: '🍛',
      categoryName: 'Nasi Padang',
      color: '#FF9F43'
    }
  },
  {
    keywords: ['gado', 'ketoprak', 'salad', 'pecel', 'sayur'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=160&h=160&fit=crop&q=80',
      emoji: '🥗',
      categoryName: 'Sayur Segar',
      color: '#20BF6B'
    }
  },
  {
    keywords: ['ayam', 'fried chicken', 'kfc', 'mcd', 'geprek', 'bebek'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1627662236973-4f8259fa2441?w=160&h=160&fit=crop&q=80',
      emoji: '🍗',
      categoryName: 'Ayam Goreng',
      color: '#FFB300'
    }
  },
  {
    keywords: ['sate', 'satay', 'tusuk', 'yakitori'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=160&h=160&fit=crop&q=80',
      emoji: '🍢',
      categoryName: 'Sate Manis',
      color: '#D4A373'
    }
  },
  {
    keywords: ['kopi', 'coffee', 'espresso', 'cappuccino', 'latte', 'macchiato', 'cafe'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=160&h=160&fit=crop&q=80',
      emoji: '☕',
      categoryName: 'Kopi Cantik',
      color: '#A0522D'
    }
  },
  {
    keywords: ['matcha', 'green tea'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=160&h=160&fit=crop&q=80',
      emoji: '🍵',
      categoryName: 'Matcha Creamy',
      color: '#4E9F3D'
    }
  },
  {
    keywords: ['teh', 'tea', 'boba', 'milktea', 'thai', 'juice', 'es teh', 'es ', 'minum'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=160&h=160&fit=crop&q=80',
      emoji: '🍹',
      categoryName: 'Es Segar',
      color: '#4682B4'
    }
  },
  {
    keywords: ['dessert', 'kue', 'cake', 'sweet', 'donut', 'donat', 'martabak', 'roti', 'es krim', 'ice cream', 'pancake'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=160&h=160&fit=crop&q=80',
      emoji: '🍰',
      categoryName: 'Manis-Manis',
      color: '#FF8B94'
    }
  },
  {
    keywords: ['burger', 'french fries', 'kentang', 'pizza', 'fastfood', 'hotdog'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=160&h=160&fit=crop&q=80',
      emoji: '🍔',
      categoryName: 'Cepat Saji',
      color: '#FF6347'
    }
  },
  {
    keywords: ['sushi', 'dimsum', 'takoyaki', 'cilor', 'cireng', 'camilan', 'snack', 'gorengan'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=160&h=160&fit=crop&q=80',
      emoji: '🥟',
      categoryName: 'Camilan Enak',
      color: '#FF7F50'
    }
  },
  {
    keywords: ['nasi', 'rice', 'tumpeng', 'uduk', 'goreng'],
    visual: {
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=160&h=160&fit=crop&q=80',
      emoji: '🌾',
      categoryName: 'Per-Nasian',
      color: '#E0A96D'
    }
  }
];

export function getFoodVisuals(text: string): FoodVisual {
  const normalized = text.toLowerCase().trim();
  
  if (!normalized) {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=160&h=160&fit=crop&q=80',
      emoji: '✨',
      categoryName: 'Makanan Impian',
      color: '#EA82FA'
    };
  }

  // Try to find matching keyword
  for (const entry of foodDatabase) {
    for (const kw of entry.keywords) {
      if (normalized.includes(kw)) {
        return entry.visual;
      }
    }
  }

  // Fallback visual based on general seed or general appetizing placeholder
  const sumUnicode = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackImages = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=160&h=160&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=160&h=160&fit=crop&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=160&h=160&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=160&h=160&fit=crop&q=80'
  ];
  
  const selectedFallback = fallbackImages[sumUnicode % fallbackImages.length];
  const emojis = ['🍽️', '👩‍🍳', '🧁', '🍒', '🍯', '🥯', '🥞', '🥣', '🥢', '🍢'];
  const selectedEmoji = emojis[sumUnicode % emojis.length];

  return {
    imageUrl: selectedFallback,
    emoji: selectedEmoji,
    categoryName: 'Kuliner Lezat',
    color: '#FF9EB5' // Super cute girlie pink tag
  };
}
