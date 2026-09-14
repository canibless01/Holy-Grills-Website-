import type { MenuItem } from '@/types';

export const CATEGORIES = ['All', 'Flame Grill', 'Weekend Special'];

const IMG_BASE = 'https://raw.githubusercontent.com/Ibidapo-Ayo/holygrill/main/public/images/custom-images/menu';
const image = (file: string) => `${IMG_BASE}/${file}`;

export const MOCK_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Holy Wings 🔥',
    tagLine: 'Open flame only.',
    description:
      'Open flame only. Marinated deep, basted repeatedly, grilled until the crust is real. Shareable. Unstoppable.',
    price: 1800,
    imageUrl: image('campus_menu1.jpg'),
    category: 'Flame Grill',
    hpValue: 12,
    isAvailable: true,
    sizes: [
      { label: 'Wings + Fried Plantain', price: 1800, description: 'Caramelised, golden, sweet against the heat.' },
      { label: 'Wings + Fried Yam', price: 1800, description: 'Crispy outside, soft inside.' },
      { label: 'Wings + Crispy Potatoes', price: 1800, description: 'Golden fries with real crunch.' },
    ],
    reviews: [
      {
        id: 'review-1',
        author: 'Omoayena A',
        rating: 5,
        comment:
          "It was wonderful 😭😭😭😭😭😭🥰, I was even so full i couldn't finish my chips. But it was lovely I enjoyed the sausage so much with the sauce.",
        createdAt: '2 days ago',
        rewardHP: 10,
      },
    ],
  },
  {
    id: '2',
    name: 'Holy Kebabs 🔥',
    tagLine: 'Bold. Flame-grilled. Built different.',
    description:
      'Bold. Flame-grilled. Built for the student who wants something that hits differently. Every kebab, basted until the flavour has nowhere left to go.',
    price: 1900,
    imageUrl: image('campus_menu2.jpg'),
    category: 'Flame Grill',
    hpValue: 14,
    isAvailable: true,
    sizes: [
      { label: 'Kebab + Fried Plantain', price: 1900, description: 'Caramelised balance for smoky spice.' },
      { label: 'Kebab + Fried Yam', price: 1900, description: 'Soft centre, crisp finish.' },
      { label: 'Kebab + Crispy Potatoes', price: 1900, description: 'Golden, crispy, addictive.' },
    ],
    reviews: [{ id: 'review-2', author: 'Owoeye I.B', rating: 5, comment: "It's so nice, The fries were honestly the best I've had this year. The chicken was so well seasoned and well grilled.", createdAt: '6 days ago', rewardHP: 10 }],
  },
  {
    id: '3',
    name: 'Holy Cut 🔥',
    tagLine: 'Real flame. Real baste. Real flavour.',
    description:
      "The classic. Real flame. Real baste. Real flavour that surprises you every single time — because the Holy Flame Method doesn't take shortcuts.",
    price: 2000,
    imageUrl: image('mediterranean_menu3.jpg'),
    category: 'Flame Grill',
    hpValue: 15,
    isAvailable: true,
    sizes: [
      { label: 'Cut + Fried Plantain', price: 2000, description: 'Sweet contrast with flame char.' },
      { label: 'Cut + Fried Yam', price: 2000, description: 'Structured, filling, satisfying.' },
      { label: 'Cut + Crispy Potatoes', price: 2000, description: 'Crunch that completes the plate.' },
    ],
    reviews: [{ id: 'review-3', author: 'Filani O.P', rating: 5, comment: 'It was wonderful. I loved the portion size of the fries. The chicken was very tender too.', createdAt: 'Today', rewardHP: 10 }],
  },
  {
    id: '4',
    name: 'Holy Weekend Drop 🎉🔥',
    tagLine: 'Friday + Saturday only.',
    description:
      'Pre-order only. Friday and Saturday. Small chops made with the same care as everything else on this menu — because the weekend deserves more than average.',
    price: 2500,
    imageUrl: image('coleslaw_bowl_menu1.png'),
    category: 'Weekend Special',
    hpValue: 20,
    isAvailable: false,
    sizes: [
      { label: 'Friday Pre-order', price: 2500, description: 'Limited batch. Pre-order required.' },
      { label: 'Saturday Pre-order', price: 2500, description: 'Limited batch. Pre-order required.' },
    ],
    percentageOff: 0,
    reviews: [],
  },
];

export const DELIVERY_FEE = 500;

export function formatPrice(kobo: number): string {
  return `₦${kobo.toLocaleString()}`;
}
