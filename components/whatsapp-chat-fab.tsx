"use client";

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER?.replace(/[^\d]/g, "") ??
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ??
  "";
const defaultMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE?.trim() || "Hello Nakisha Empire, I need help with my order.";

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.48 0 .12 5.36.12 11.94c0 2.1.55 4.16 1.6 5.98L0 24l6.28-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.4-8.38Z"
        fill="#25D366"
      />
      <path
        d="M10.06 6.86c-.23-.52-.46-.53-.67-.54h-.57c-.2 0-.52.08-.79.38-.27.3-1.03 1.01-1.03 2.47 0 1.46 1.05 2.88 1.2 3.08.15.2 2.07 3.32 5.12 4.52 2.53.99 3.05.79 3.6.74.55-.05 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.08-.13-.3-.2-.62-.36-.32-.16-1.9-.94-2.2-1.04-.3-.1-.52-.15-.74.16-.22.31-.84 1.04-1.03 1.25-.19.21-.38.23-.7.08-.32-.16-1.35-.5-2.56-1.58-.94-.84-1.57-1.88-1.75-2.2-.18-.31-.02-.48.13-.64.13-.13.29-.33.43-.49.14-.16.19-.28.29-.46.1-.18.05-.34-.03-.49-.08-.15-.71-1.75-.97-2.39Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function WhatsAppChatFab() {
  if (!whatsappNumber) {
    return null;
  }

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      aria-label="Chat with Nakisha Empire on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-[var(--brand-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] shadow-[0_18px_40px_rgba(77,53,53,0.14)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-50)]"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8fff1]">
        <WhatsAppIcon />
      </span>
      <span className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
        <span className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--brand-ink-soft)]">Need help?</span>
        <span>Chat on WhatsApp</span>
      </span>
    </a>
  );
}
