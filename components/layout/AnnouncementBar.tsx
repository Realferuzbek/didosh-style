const MARQUEE_ITEMS = [
  '🌸 Yangi kolleksiya keldi',
  "300,000 so'mdan bepul yetkazib berish",
  'Eksklyuziv dizaynlar faqat bizda',
  'Didosh Style — siz uchun',
]

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar relative z-40 flex h-9 overflow-hidden text-brand-cream md:h-10">
      <div className="announcement-track flex min-w-max items-center whitespace-nowrap font-body text-xs font-medium uppercase tracking-[0.06em] [will-change:transform]">
        {Array.from({ length: 8 }).map((_, groupIndex) => (
          <span key={groupIndex} className="flex items-center">
            {MARQUEE_ITEMS.map((item) => (
              <span key={`${groupIndex}-${item}`} className="flex items-center">
                <span className="px-4">{item}</span>
                <span className="text-brand-rose">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
      <style>
        {`
          .announcement-bar {
            background: linear-gradient(90deg, #2C1810, #4A2828, #2C1810);
            background-size: 200% auto;
            animation: shimmerBg 4s linear infinite;
          }

          .announcement-track {
            animation: announcement-marquee 28s linear infinite;
          }

          @keyframes shimmerBg {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }

          @keyframes announcement-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  )
}
