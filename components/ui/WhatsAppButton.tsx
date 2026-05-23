'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Navigation, Phone, X } from 'lucide-react'

const TELEGRAM_URL = 'https://t.me/didosh_style'
const PHONE_HREF = 'tel:+998944701076'
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/oCNbEteMkiTJyc6j6'
const YANDEX_MAPS_URL = 'https://yandex.ru/maps?whatshere%5Bpoint%5D=65.93493786463408%2C39.96012788167869&whatshere%5Bzoom%5D=16.0&ll=65.9349378646341%2C39.960127870713286&z=16.0&si=fvng3auxkp56xu89er1xt63k7r'

function TelegramIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M21.94 4.16a1.24 1.24 0 0 0-1.3-.18L3.2 10.88c-.87.34-.84 1.56.04 1.86l4.43 1.52 1.71 5.36c.28.88 1.4 1.1 1.99.4l2.47-2.93 4.51 3.34c.73.54 1.77.13 1.94-.76l3.34-14.16c.12-.52-.12-1.06-.58-1.35Zm-3.56 3.1-8.24 7.45-.3 3.2-1.13-3.55 9.67-7.1Z" />
    </svg>
  )
}

const contactOptions = [
  {
    href: TELEGRAM_URL,
    external: true,
    icon: <TelegramIcon size={18} className="text-[#229ED9]" />,
    label: 'Telegram yozing 💬',
    sublabel: '@didosh_style',
  },
  {
    href: PHONE_HREF,
    icon: <Phone size={18} className="text-brand-deeprose" />,
    label: "Qo'ng'iroq qiling 📞",
    sublabel: '+998 94 470 10 76',
  },
  {
    href: GOOGLE_MAPS_URL,
    external: true,
    icon: <MapPin size={18} className="text-[#EA4335]" />,
    label: 'Google Maps 📍',
    sublabel: "Do'konimizni toping",
  },
  {
    href: YANDEX_MAPS_URL,
    external: true,
    icon: <Navigation size={18} className="text-[#FF6600]" />,
    label: 'Yandex Maps 🗺️',
    sublabel: "Yo'nalish olish",
  },
]

export default function ContactHub() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Aloqa panelini yopish"
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-[88px] right-4 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-[64px] right-0 w-[220px] rounded-2xl border border-brand-border bg-white p-3 shadow-xl"
            >
              <div className="mb-2 flex items-center justify-between border-b border-brand-border pb-2">
                <p className="font-display text-[13px] font-semibold text-brand-dark">
                  Biz bilan bog&apos;laning
                </p>
                <button
                  type="button"
                  aria-label="Yopish"
                  onClick={() => setIsOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-blush hover:text-brand-dark"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {contactOptions.map(option => (
                  <a
                    key={option.label}
                    href={option.href}
                    target={option.external ? '_blank' : undefined}
                    rel={option.external ? 'noopener noreferrer' : undefined}
                    className="flex cursor-pointer items-center gap-3 rounded-xl bg-brand-blush px-3 py-2.5 transition-colors hover:bg-brand-border"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      {option.icon}
                    </span>
                    <span>
                      <span className="block font-body text-[13px] font-medium text-brand-dark">
                        {option.label}
                      </span>
                      <span className="block font-body text-[11px] text-brand-muted">
                        {option.sublabel}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label="Aloqa usullari"
          onClick={() => setIsOpen(open => !open)}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg ring-2 ring-white/30 [will-change:transform]"
        >
          <TelegramIcon size={25} />
        </motion.button>
      </div>
    </>
  )
}
