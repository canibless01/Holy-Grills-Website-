'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Flame, Mail, ShoppingBag } from 'lucide-react';
import { Link } from '@/lib/router';
import { HeroCarousel } from '@/components/hero/HeroCarousel';
import { FoodCard } from '@/components/menu/FoodCard';
import { KitchenCountdownCard } from '@/components/shared/KitchenCountdownCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StoreClosedDialog } from '@/components/shared/StoreClosedDialog';
import { CateringCard } from '@/components/shared/CateringCard';
import { SquadOrderEducation } from '@/components/shared/SquadOrderEducation';
import { EarlySupportersSection } from '@/components/shared/EarlySupportersSection';
import { useCartStore } from '@/stores/cartStore';
import { useQuery } from '@tanstack/react-query';
import { getMenuItems } from '@/services/api/menu.service';
import { getBanners, subscribeNewsletter, type StorefrontBanner } from '@/services/api/storefront.service';
import { getCartQuantityForMenuItem, getPrimaryCartLineId } from '@/utils/pricing';
import { playUiTone } from '@/utils/sound';
import type { HeroSlide } from '@/types';
import { toast } from 'sonner';
import {
  HOME_HOLY_POINTS_FEATURES,
  HOME_TESTIMONIALS,
} from '@/content/homeContent';

const HP_ICONS = [Flame, ShoppingBag, Flame] as const;

const Home = ({ heroSlides: initialSlides }: { heroSlides: HeroSlide[] }) => {
  const { items, addItem, updateQuantity } = useCartStore();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: getMenuItems,
  });

  const { data: apiBanners = [] } = useQuery({
    queryKey: ['storefront-banners'],
    queryFn: () => getBanners('home'),
  });

  const heroSlides = useMemoHeroSlides(initialSlides, apiBanners);
  const featuredItems = menuItems.filter((item) => item.isAvailable).slice(0, 4);

  const handleAdd = (id: string) => {
    const item = menuItems.find((menuItem) => menuItem.id === id);
    if (!item) return;
    addItem({ id: item.id, menuItemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, hpValue: item.hpValue });
    playUiTone('add');
    toast.success(`${item.name} added to cart`);
  };

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail.trim()) {
      toast.error('Newsletter subscription failed.');
      return;
    }
    setIsSubmittingNewsletter(true);
    try {
      await subscribeNewsletter(newsletterEmail.trim());
      toast.success('Subscribed to newsletter!');
      setNewsletterEmail('');
    } catch {
      toast.error('Newsletter subscription failed.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((value) => (value + 1) % HOME_TESTIMONIALS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const marqueeItems = [...featuredItems, ...featuredItems];

  return (
    <main className="flex flex-1 flex-col space-y-8">
      <StoreClosedDialog />
      <HeroCarousel slides={heroSlides} />

      <KitchenCountdownCard className="pt-8" />

      <section className="container mx-auto overflow-hidden px-4">
        <SectionHeader
          eyebrow="Selar-aligned menu"
          title="Real Grill. Real Flavour. 🔥"
          description="Flame-grilled proteins + crispy sides — made with the Holy Flame Method, every single order."
          action={<Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">View full menu <ArrowRight size={14} /></Link>}
        />
        <div className="relative mt-4 overflow-hidden rounded-2xl">
          <div className="animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused] flex w-max gap-4 py-2">
            {marqueeItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="w-[220px] md:w-[240px] shrink-0">
                <FoodCard
                  {...item}
                  quantityInCart={getCartQuantityForMenuItem(items, item.id)}
                  onAddToCart={handleAdd}
                  onUpdateQuantity={(_, quantity) => updateQuantity(getPrimaryCartLineId(items, item.id), quantity)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <SquadOrderEducation />
      </section>

      <section className="container mx-auto px-4">
        <div className="rounded-[2rem] bg-gradient-fire px-6 py-10 text-primary-foreground md:px-10">
          <div className="grid gap-6 md:grid-cols-[1.3fr,1fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">Holy Points</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Eat. Earn. Come Back. 🔥</h2>
              <p className="mt-3 max-w-xl text-sm text-primary-foreground/80">
                Every Holy Grills order earns you Holy Points. Stack them. Climb the leaderboard. Unlock rewards.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {HOME_HOLY_POINTS_FEATURES.map((item, index) => {
                const Icon = HP_ICONS[index % HP_ICONS.length];

                return (
                  <div key={item.label} className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                    <Icon size={18} />
                    <p className="mt-3 font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-primary-foreground/80">{item.helper}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <CateringCard />
      </section>

      <section className="container mx-auto px-4">
        <SectionHeader
          eyebrow="Testimonials"
          title="Real Students. Real Orders. Real Flavour. 🔥"
          description="Every review earned through open flame and genuine craft."
        />
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-6">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
          >
            {HOME_TESTIMONIALS.map((testimonial) => (
              <article key={testimonial.name} className="w-full shrink-0">
                <p className="text-sm leading-relaxed text-muted-foreground">“{testimonial.quote}”</p>
                <p className="mt-4 font-semibold text-foreground">{testimonial.name}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {HOME_TESTIMONIALS.map((testimonial, index) => (
              <button
                key={testimonial.name}
                onClick={() => setTestimonialIndex(index)}
                className={`h-2 rounded-full transition-all ${testimonialIndex === index ? 'w-6 bg-primary' : 'w-2 bg-border'}`}
                aria-label={`Open testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <EarlySupportersSection />
      </section>

      <section className="container mx-auto px-4 pb-14">
        <div className="rounded-3xl border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Fire Feast Squad</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-foreground">Join the newsletter for drops + challenges.</h3>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-secondary px-4">
              <Mail size={16} className="text-primary" />
              <input
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="you@example.com"
                aria-label="Newsletter email"
              />
            </div>
            <button
              onClick={handleNewsletterSubmit}
              disabled={isSubmittingNewsletter}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isSubmittingNewsletter ? 'Joining...' : 'Join Fire Feast Squad'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

function useMemoHeroSlides(initialSlides: HeroSlide[], apiBanners: StorefrontBanner[]) {
  if (!apiBanners.length) return initialSlides;
  const mappedBanners: HeroSlide[] = apiBanners.map((b) => ({
    id: b.id,
    tag: b.subtitle || "FUTA's #1 Food Platform",
    title: b.title || 'Flame-Grilled Goodness',
    description: b.subtitle || 'Order freshly grilled meals delivered to your hostel.',
    ctaButtons: [
      { label: b.action_label || 'Order Now', href: b.action_url || '/menu', variant: 'primary' },
    ],
    imageUrl: b.image_url || '/placeholder.svg',
    isActive: b.is_active ?? true,
  }));
  return mappedBanners.length > 0 ? mappedBanners : initialSlides;
}

export default Home;
