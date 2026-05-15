"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface DescriptionAccordionProps {
  description: string | null;
}

const DEFAULT_DESC =
  "Yuqori sifatli materialdan tayyorlangan bu mahsulot siz uchun har kuni kiyish uchun qulay va chiroyli. Mashinada yuvilishi mumkin.";

const DELIVERY_TEXT =
  "📦 Buyurtma 1–3 ish kuni ichida yetkaziladi.\n✅ Toshkent bo'ylab bepul yetkazib berish (300 000 so'm dan).\n💵 To'lov: naqd pul, yetkazib berganda.";

export default function DescriptionAccordion({ description }: DescriptionAccordionProps) {
  const [open, setOpen] = useState([true, false]);
  return (
    <div className="rounded-xl border border-brand-border/60 bg-white overflow-hidden">
      {/* Mahsulot haqida */}
      <AccordionItem
        title="Mahsulot haqida"
        open={open[0]}
        onClick={() => setOpen([!open[0], open[1]])}
      >
        <p className="font-body text-sm text-brand-muted leading-6 py-3 whitespace-pre-line">
          {description || DEFAULT_DESC}
        </p>
      </AccordionItem>
      {/* Yetkazib berish */}
      <AccordionItem
        title="Yetkazib berish"
        open={open[1]}
        onClick={() => setOpen([open[0], !open[1]])}
      >
        <p className="font-body text-sm text-brand-muted leading-6 py-3 whitespace-pre-line">
          {DELIVERY_TEXT}
        </p>
      </AccordionItem>
    </div>
  );
}

function AccordionItem({ title, open, onClick, children }: { title: string; open: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 px-4 border-b border-brand-border/50 bg-transparent"
        onClick={onClick}
      >
        <span className="text-[15px] font-semibold text-brand-dark">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        {open && <div className="px-4">{children}</div>}
      </motion.div>
    </div>
  );
}
