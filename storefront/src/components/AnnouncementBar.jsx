import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const messages = [
  'Free Shipping on Orders Over $100',
  'Subscribe & Save 15% — Auto Refill Every 3 Months',
  '140+ Luxury-Inspired Fragrances',
];

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('announcement-dismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('announcement-dismissed', 'true');
  };

  if (dismissed) return null;

  // Double the messages for seamless marquee loop
  const doubledMessages = [...messages, ...messages];

  return (
    <div className="bg-black text-white text-center py-2.5 px-12 text-[11px] tracking-[0.12em] uppercase relative overflow-hidden">
      <div className="inline-flex gap-12 animate-marquee-fast">
        {doubledMessages.map((msg, i) => (
          <span key={i} className="whitespace-nowrap flex items-center gap-4">
            {msg}
            <span className="w-[3px] h-[3px] bg-warm-gray rounded-full" />
          </span>
        ))}
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
