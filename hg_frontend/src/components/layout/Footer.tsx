import { Link } from '@/lib/router';
import { Flame } from 'lucide-react';

export function Footer() {
  const quickLinks = [
    { to: '/menu', label: 'Menu' },
    { to: '/cart', label: 'Cart' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/rewards', label: 'Rewards' },
    { to: '/about', label: 'Our Story 🔥' },
    { to: '/support', label: "Questions? We've Got You." },
    { to: '/trust', label: 'Your Trust — Terms & Privacy' },
  ];

  return (
    <footer className="hidden md:block border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-primary" />
              <span className="font-display font-bold text-foreground">Holy Grills</span>
            </div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Real flame. Real flavour. Built for student life. 🔥 Faith · Love · Energy · Flavor
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-foreground text-sm mb-3">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block text-xs text-muted-foreground font-body hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-foreground text-sm mb-3">Support</h4>
            <div className="space-y-2 text-xs text-muted-foreground font-body">
              <p>grillthevibe@gmail.com</p>
              <p>07053263931</p>
              <p>FUTA Campus, Akure — Ondo State</p>
            </div>
          </div>

          {/* HP */}
          <div>
            <h4 className="font-display font-bold text-foreground text-sm mb-3">Holy Points</h4>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Stack Holy Points. Unlock rewards. The more you grill — the more you gain.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Holy Grills. Only Flame. Only Us. ❤️‍🔥
          </p>
        </div>
      </div>
    </footer>
  );
}
