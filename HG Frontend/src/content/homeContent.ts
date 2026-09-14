export interface HomeStat {
  label: string;
  value: string;
  helper: string;
}

export interface HomeExperience {
  title: string;
  description: string;
  cta: string;
}

export interface HomeHowItWorksStep {
  title: string;
  description: string;
}

export interface HomeHolyPointsFeature {
  label: string;
  helper: string;
}

export interface HomeTestimonial {
  name: string;
  quote: string;
}

export const HOME_STATS: HomeStat[] = [
  { label: '', value: 'Every Order, Flame-Grilled 🔥', helper: 'Craft first. No shortcuts.' },
  { label: 'Community', value: "FUTA's Grilled Meal Community ❤️‍🔥", helper: 'Built for students, built together.' },
  { label: 'Rewards', value: 'Holy Points — Earn With Every Bite 💯', helper: 'Stack points on every order.' },
  { label: 'Delivery', value: 'Campus evening delivery drop 🚚', helper: 'Mon–Sat delivery window.' },
];

export const HOME_EXPERIENCES: HomeExperience[] = [
];

export const HOME_HOW_IT_WORKS: HomeHowItWorksStep[] = [
  {
    title: 'Build Your Plate 🔥',
    description: "Choose your flame-grilled protein. Pick your side. Order closes at 4PM — don't sleep on it.",
  },
  {
    title: 'HG Time Loads 🚚',
    description: 'Delivery runs 6:30–8:30PM, Mon–Sat. Your order is already on the way.',
  },
  {
    title: 'Stack Holy Points 💯',
    description: "Every order earns Holy Points. Stack enough and the grill gives back. That's the Holy Grills promise.",
  },
];

export const HOME_HOLY_POINTS_FEATURES: HomeHolyPointsFeature[] = [
  {
    label: 'Earn on orders',
    helper: 'Every order earns Holy Points — the more you order, the faster you rise.',
  },
  {
    label: 'Leaderboard',
    helper: 'Compete with friends on campus. The top grills get the top rewards.',
  },
  {
    label: 'Redeem rewards',
    helper: 'Holy Points unlock free sides, upgrades, and exclusive drops.',
  },
  {
    label: 'Streak bonus',
    helper: 'Order consistently and your Holy Points multiply.',
  },
];

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    name: 'Omoayena A',
    quote: "It was wonderful 😭😭😭😭😭😭🥰, I was even so full i couldn't finish my chips. But it was lovely I enjoyed the sausage so much with the sauce.",
  },
  {
    name: 'Owoeye I.B',
    quote: "It's so nice, The fries were honestly the best I've had this year. The chicken was so well seasoned and well grilled.",
  },
  {
    name: 'Filani O.P',
    quote: 'It was wonderful. I loved the portion size of the fries. The chicken was very tender too.',
  },
];
