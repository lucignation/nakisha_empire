import Link from "next/link";
import LogoMarquee from "@/components/logo-marquee";
import NewsletterSignup from "@/components/newsletter-signup";
import ProductCard from "@/components/product-card";
import ProductRail from "@/components/product-rail";
import Reveal from "@/components/reveal";
import { formatCurrency, getEffectivePrice, isProductOnSale, type Product } from "@/lib/data";
import { getFeaturedStorefrontProducts, getStorefrontProducts } from "@/lib/server/products";

const pageStyles = `
  :root {
    --home-cream: var(--brand-50);
    --home-cream-md: var(--brand-100);
    --home-cream-dk: var(--brand-200);
    --home-brown-xs: var(--brand-ink-soft);
    --home-brown-sm: var(--brand-ink);
    --home-brown-md: #664949;
    --home-brown-dk: #3f2c2c;
    --home-gold: var(--brand-400);
    --home-gold-lt: var(--brand-300);
    --home-gold-dk: var(--brand-500);
    --home-white: #FFFFFF;
  }

  .home-curated-page {
    background: var(--home-cream);
  }

  .home-hero-wrap {
    position: relative;
    overflow: hidden;
    background: var(--home-brown-dk);
    width: min(calc(100% - 2rem), 78rem);
    margin: 1rem auto 0;
    border: 1px solid rgba(237, 216, 216, 0.9);
    border-radius: 1.75rem;
    box-shadow: var(--shadow-soft);
    min-height: clamp(24rem, 52vh, 34rem);
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
  }

  @media (max-width: 860px) {
    .home-hero-wrap {
      grid-template-columns: 1fr;
      min-height: auto;
      width: min(calc(100% - 1rem), 78rem);
      border-radius: 1.25rem;
    }

    .home-hero-image-col {
      order: -1;
      height: 44vw;
      min-height: 220px;
    }
  }

  .home-hero-copy-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(1.5rem, 3.5vw, 3rem) clamp(1.25rem, 3vw, 3rem);
    position: relative;
    z-index: 2;
  }

  .home-hero-image-col {
    position: relative;
    overflow: hidden;
  }

  .home-hero-image-col img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.88) saturate(1.1);
    transition: transform 8s ease;
  }

  .home-hero-image-col:hover img {
    transform: scale(1.04);
  }

  .home-hero-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, var(--home-brown-dk) 0%, transparent 30%);
    pointer-events: none;
  }

  .home-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--home-gold-lt);
    margin-bottom: 1.5rem;
  }

  .home-hero-badge::before {
    content: "";
    display: block;
    width: 28px;
    height: 1px;
    background: var(--home-gold);
  }

  .home-hero-title {
    font-family: var(--font-display);
    font-size: clamp(2.35rem, 4vw, 3.6rem);
    font-weight: 650;
    line-height: 1.12;
    color: var(--home-cream);
    margin: 0 0 1.25rem;
    letter-spacing: -0.01em;
  }

  .home-hero-title em {
    font-style: italic;
    color: var(--home-gold-lt);
  }

  .home-hero-copy {
    font-family: var(--font-body);
    font-size: 0.88rem;
    line-height: 1.65;
    color: rgba(250, 246, 241, 0.6);
    max-width: 28rem;
    margin: 0 0 1.35rem;
  }

  .home-hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .home-btn-primary {
    background: var(--home-gold);
    color: var(--home-brown-dk);
    border: none;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.85rem 2rem;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    text-decoration: none;
    display: inline-block;
  }

  .home-btn-primary:hover {
    background: var(--home-gold-lt);
    transform: translateY(-1px);
  }

  .home-btn-ghost {
    background: transparent;
    color: var(--home-cream);
    border: 1px solid rgba(250, 246, 241, 0.25);
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.85rem 2rem;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .home-btn-ghost:hover {
    border-color: var(--home-gold);
    color: var(--home-gold-lt);
  }

  .home-hero-highlights {
    margin-top: 1.35rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(250, 246, 241, 0.1);
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .home-hero-highlight-item {
    font-family: var(--font-body);
    font-size: 0.73rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250, 246, 241, 0.4);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .home-hero-highlight-item::before {
    content: "✦";
    color: var(--home-gold);
    font-size: 0.55rem;
  }

  .home-trust-bar {
    background: var(--home-gold);
    padding: 0.64rem 0;
    overflow: hidden;
    margin-top: 1rem;
  }

  .home-trust-bar-inner {
    display: flex;
    gap: 3rem;
    white-space: nowrap;
    animation: home-marquee-trust 22s linear infinite;
  }

  @keyframes home-marquee-trust {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .home-trust-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--home-brown-dk);
    flex-shrink: 0;
  }

  .home-trust-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--home-brown-md);
    opacity: 0.5;
  }

  .home-section-header {
    text-align: center;
    margin-bottom: clamp(2rem, 4vw, 3.5rem);
  }

  .home-section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-body);
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--home-gold-dk);
    margin-bottom: 0.85rem;
  }

  .home-section-eyebrow::before,
  .home-section-eyebrow::after {
    content: "";
    display: block;
    width: 20px;
    height: 1px;
    background: var(--home-gold);
  }

  .home-section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3.25rem);
    font-weight: 650;
    color: var(--home-brown-dk);
    line-height: 1.2;
    margin: 0 0 0.75rem;
  }

  .home-section-subtitle {
    font-family: var(--font-body);
    font-size: 0.88rem;
    line-height: 1.8;
    color: var(--home-brown-xs);
    max-width: 36rem;
    margin: 0 auto;
  }

  .home-section-rule {
    width: 36px;
    height: 1px;
    background: var(--home-gold);
    margin: 1rem auto 0;
  }

  .home-cat-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  @media (max-width: 1100px) {
    .home-cat-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 640px) {
    .home-cat-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .home-cat-card {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    aspect-ratio: 3 / 4;
    cursor: pointer;
    display: block;
  }

  .home-cat-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    display: block;
  }

  .home-cat-card:hover img {
    transform: scale(1.08);
  }

  .home-cat-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(45, 30, 20, 0.82) 0%, rgba(45, 30, 20, 0.05) 55%);
    transition: background 0.3s;
  }

  .home-cat-card:hover .home-cat-card-overlay {
    background: linear-gradient(to top, rgba(45, 30, 20, 0.9) 0%, rgba(45, 30, 20, 0.1) 55%);
  }

  .home-cat-card-body {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    padding: 1.1rem;
  }

  .home-cat-card-name {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 400;
    color: var(--home-cream);
    display: block;
    line-height: 1.3;
  }

  .home-cat-card-count {
    font-family: var(--font-body);
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--home-gold-lt);
    margin-top: 3px;
    display: block;
  }

  .home-cat-card-arrow {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 30px;
    height: 30px;
    border: 1px solid rgba(250, 246, 241, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--home-cream);
    font-size: 0.7rem;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.25s, transform 0.25s;
  }

  .home-cat-card:hover .home-cat-card-arrow {
    opacity: 1;
    transform: translateY(0);
  }

  .home-promo-banner {
    display: grid;
    grid-template-columns: 260px 1fr auto;
    align-items: center;
    overflow: hidden;
    border-radius: 6px;
    background: var(--home-brown-dk);
    gap: 0;
  }

  @media (max-width: 768px) {
    .home-promo-banner { grid-template-columns: 1fr; }
    .home-promo-image { height: 200px; }
  }

  .home-promo-image {
    position: relative;
  }

  .home-promo-image img {
    width: 100%;
    height: 100%;
    min-height: 180px;
    object-fit: cover;
    display: block;
    filter: brightness(0.82) saturate(1.15);
  }

  .home-promo-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent 65%, var(--home-brown-dk));
  }

  .home-promo-copy {
    padding: 2rem 2.5rem;
  }

  .home-promo-eyebrow {
    font-family: var(--font-body);
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--home-gold-lt);
    margin-bottom: 0.6rem;
  }

  .home-promo-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 650;
    color: var(--home-cream);
    line-height: 1.25;
    margin: 0 0 0.5rem;
  }

  .home-promo-text {
    font-family: var(--font-body);
    font-size: 0.85rem;
    line-height: 1.8;
    color: rgba(250, 246, 241, 0.55);
    max-width: 28rem;
  }

  .home-promo-cta {
    padding: 2rem 2.5rem;
  }

  .home-sellers-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  @media (max-width: 600px) {
    .home-sellers-head {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .home-sellers-eyebrow {
    font-family: var(--font-body);
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--home-gold-dk);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0.5rem;
  }

  .home-sellers-eyebrow::before {
    content: "";
    display: block;
    width: 20px;
    height: 1px;
    background: var(--home-gold);
  }

  .home-sellers-head h2 {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    font-weight: 650;
    color: var(--home-brown-dk);
    line-height: 1.2;
    margin: 0 0 0.4rem;
  }

  .home-sellers-head p {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--home-brown-xs);
    margin: 0;
  }

  .home-btn-outline {
    background: transparent;
    color: var(--home-brown-md);
    border: 1px solid var(--home-cream-dk);
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.7rem 1.6rem;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    text-decoration: none;
    display: inline-block;
    white-space: nowrap;
  }

  .home-btn-outline:hover {
    border-color: var(--home-gold);
    color: var(--home-gold-dk);
  }

  .home-bundle-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) {
    .home-bundle-grid { grid-template-columns: 1fr; }
  }

  .home-bundle-card {
    border: 1px solid var(--home-cream-dk);
    border-radius: 6px;
    overflow: hidden;
    background: var(--home-white);
    transition: box-shadow 0.25s, transform 0.25s;
    display: flex;
    flex-direction: column;
  }

  .home-bundle-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(45, 30, 20, 0.1);
  }

  .home-bundle-image-wrap {
    position: relative;
    height: 200px;
    overflow: hidden;
    background: var(--home-cream);
  }

  .home-bundle-image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .home-bundle-card:hover .home-bundle-image-wrap img {
    transform: scale(1.06);
  }

  .home-bundle-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: var(--home-brown-dk);
    color: var(--home-gold-lt);
    font-family: var(--font-body);
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 1px;
  }

  .home-bundle-body {
    padding: 1.4rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .home-bundle-eyebrow {
    font-family: var(--font-body);
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--home-gold-dk);
    margin-bottom: 0.4rem;
  }

  .home-bundle-title {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--home-brown-dk);
    margin: 0 0 0.5rem;
  }

  .home-bundle-copy {
    font-family: var(--font-body);
    font-size: 0.82rem;
    line-height: 1.8;
    color: var(--home-brown-xs);
    margin: 0 0 1.1rem;
    flex: 1;
  }

  .home-bundle-items {
    background: var(--home-cream);
    border-radius: 4px;
    padding: 0.85rem 1rem;
    margin-bottom: 1.1rem;
  }

  .home-bundle-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--home-brown-sm);
    padding: 4px 0;
  }

  .home-bundle-item-row + .home-bundle-item-row {
    border-top: 1px solid var(--home-cream-dk);
  }

  .home-bundle-item-price {
    font-weight: 600;
    white-space: nowrap;
    color: var(--home-brown-md);
  }

  .home-bundle-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .home-bundle-price {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 400;
    color: var(--home-brown-dk);
  }

  .home-btn-gold {
    background: var(--home-gold);
    color: var(--home-brown-dk);
    border: none;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.7rem 1.5rem;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .home-btn-gold:hover {
    background: var(--home-gold-lt);
  }

  .home-arrivals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    align-items: stretch;
  }

  @media (max-width: 900px) {
    .home-arrivals-grid { grid-template-columns: 1fr; }
  }

  .home-arrival-card {
    display: grid;
    grid-template-columns: 10rem 1fr;
    overflow: hidden;
    border: 1px solid var(--home-cream-dk);
    border-radius: 6px;
    background: var(--home-white);
    transition: box-shadow 0.25s;
    min-height: 20rem;
    height: 100%;
  }

  .home-arrival-card:hover {
    box-shadow: 0 16px 40px rgba(45, 30, 20, 0.09);
  }

  @media (max-width: 500px) {
    .home-arrival-card { grid-template-columns: 1fr; }
  }

  .home-arrival-image {
    position: relative;
    overflow: hidden;
  }

  .home-arrival-image img {
    width: 100%;
    height: 100%;
    min-height: 140px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .home-arrival-card:hover .home-arrival-image img {
    transform: scale(1.07);
  }

  .home-arrival-body {
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
  }

  .home-arrival-badge {
    font-family: var(--font-body);
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--home-gold-dk);
    margin-bottom: 0.4rem;
  }

  .home-arrival-name {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--home-brown-dk);
    line-height: 1.3;
    margin: 0 0 0.4rem;
  }

  .home-arrival-desc {
    font-family: var(--font-body);
    font-size: 0.78rem;
    line-height: 1.75;
    color: var(--home-brown-xs);
    margin: 0 0 0.9rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .home-arrival-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: auto;
  }

  .home-arrival-price {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 400;
    color: var(--home-brown-dk);
  }

  .home-brands-section {
    background: var(--home-white);
    border-top: 1px solid var(--home-cream-dk);
    border-bottom: 1px solid var(--home-cream-dk);
    padding: 2rem 0;
  }

  .home-stats-strip {
    background: var(--home-cream-md);
    padding: 2.5rem 0;
    border-top: 1px solid var(--home-cream-dk);
    border-bottom: 1px solid var(--home-cream-dk);
  }

  .home-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    text-align: center;
  }

  @media (max-width: 640px) {
    .home-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .home-stat-num {
    font-family: var(--font-display);
    font-size: 2.6rem;
    font-weight: 400;
    color: var(--home-brown-dk);
    line-height: 1;
    margin-bottom: 0.3rem;
  }

  .home-stat-label {
    font-family: var(--font-body);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--home-brown-xs);
  }

  .home-newsletter-section {
    background: var(--home-brown-dk);
    position: relative;
    overflow: hidden;
  }

  .home-newsletter-section::before {
    content: "";
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    border: 1px solid rgba(198, 168, 107, 0.12);
    pointer-events: none;
  }

  .home-newsletter-section::after {
    content: "";
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    border: 1px solid rgba(198, 168, 107, 0.08);
    pointer-events: none;
  }

  .home-newsletter-inner {
    max-width: 56rem;
    margin: 0 auto;
    text-align: center;
    padding: clamp(3.5rem, 7vw, 5.5rem) 1.5rem;
    position: relative;
    z-index: 2;
  }

  .home-newsletter-eyebrow {
    font-family: var(--font-body);
    font-size: 0.65rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--home-gold-lt);
    margin-bottom: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .home-newsletter-eyebrow::before,
  .home-newsletter-eyebrow::after {
    content: "";
    display: block;
    width: 28px;
    height: 1px;
    background: var(--home-gold);
    opacity: 0.5;
  }

  .home-newsletter-title {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 400;
    color: var(--home-cream);
    line-height: 1.15;
    margin: 0 0 0.9rem;
    letter-spacing: -0.01em;
  }

  .home-newsletter-title em {
    font-style: italic;
    color: var(--home-gold-lt);
  }

  .home-newsletter-subtitle {
    font-family: var(--font-body);
    font-size: 0.9rem;
    line-height: 1.85;
    color: rgba(250, 246, 241, 0.52);
    max-width: 32rem;
    margin: 0 auto 2.5rem;
  }
`;

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="home-section-header">
      <p className="home-section-eyebrow">{eyebrow}</p>
      <h2 className="home-section-title">{title}</h2>
      {subtitle ? <p className="home-section-subtitle">{subtitle}</p> : null}
      <div className="home-section-rule" />
    </div>
  );
}

export default async function HomePage() {
  const products = await getStorefrontProducts();
  const featuredProducts = getFeaturedStorefrontProducts(products);
  const productAt = (index: number) => products[index % products.length];
  const categories = [...new Set(products.map((product) => product.category))]
    .map((category) => ({
      category,
      product: products.find((product) => product.category === category),
      count: products.filter((product) => product.category === category).length
    }))
    .filter((entry): entry is { category: string; product: Product; count: number } => Boolean(entry.product))
    .slice(0, 6);

  const bundleCards = [
    {
      title: "Glow Starter Set",
      copy: "Brighten, hydrate, and seal in glow with a three-step set for first-time shoppers.",
      items: [productAt(0), productAt(2), productAt(5)]
    },
    {
      title: "Soft Reset Duo",
      copy: "A gentle cleanse and calm-prep pairing for shoppers focused on comfort and balance.",
      items: [productAt(3), productAt(1)]
    },
    {
      title: "Body Nourish Edit",
      copy: "Body care and everyday radiance picks designed for soft texture and a satin finish.",
      items: [productAt(4), productAt(2)]
    }
  ];

  const newArrivals = products.slice(0, 3);
  const trustItems = [
    "Free delivery over ₦50,000",
    "Same-day dispatch in Lagos & Abuja",
    "Authentic products, guaranteed",
    "Easy 14-day returns",
    "Secure checkout via Paystack",
    "Consultation booking available"
  ];

  const stats = [
    { num: "10K+", label: "Happy Shoppers" },
    { num: `${categories.length}+`, label: "Top Categories" },
    { num: "4.9★", label: "Average Rating" },
    { num: "24h", label: "Dispatch Time" }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="home-curated-page">
        <section>
          <div className="home-hero-wrap">
            <div className="home-hero-copy-col">
              <span className="home-hero-badge">Limited Offer</span>
              <h1 className="home-hero-title">
                Shop high-performing skincare
                <br />
                <em>without slow browsing.</em>
              </h1>
              <p className="home-hero-copy">
                Find bestselling serums, moisturizers, cleansers, and SPF with live promos, quick add-to-cart, and
                order tracking built into the storefront.
              </p>
              <div className="home-hero-actions">
                <Link className="home-btn-primary" href="/shop">
                  Shop Deals
                </Link>
                <Link className="home-btn-ghost" href="/track">
                  Track an Order
                </Link>
              </div>
              <div className="home-hero-highlights">
                {["Bestsellers restocked", "Quick add to cart", "Nationwide delivery"].map((item) => (
                  <span className="home-hero-highlight-item" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="home-hero-image-col">
              <img
                alt="Skincare hero"
                src="https://images.pexels.com/photos/29924642/pexels-photo-29924642.jpeg?cs=srgb&dl=pexels-rdne-29924642.jpg&fm=jpg"
              />
              <div className="home-hero-image-overlay" />
            </div>
          </div>
        </section>

        <div className="home-trust-bar">
          <div className="home-trust-bar-inner" aria-hidden>
            {[...trustItems, ...trustItems].map((item, index) => (
              <span className="home-trust-item" key={`${item}-${index}`}>
                {item}
                <span className="home-trust-dot" />
              </span>
            ))}
          </div>
        </div>

        <section className="home-brands-section" id="brands">
          <div className="container">
            <Reveal>
              <LogoMarquee />
            </Reveal>
          </div>
        </section>

        <div className="home-stats-strip">
          <div className="container">
            <div className="home-stats-grid">
              {stats.map(({ num, label }) => (
                <div key={label}>
                  <div className="home-stat-num">{num}</div>
                  <div className="home-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="categories" style={{ background: "#FFFFFF", padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="container">
            <Reveal>
              <SectionHeader
                eyebrow="Browse Collection"
                subtitle="Jump into the skincare categories shoppers reach for most."
                title="Shop by Category"
              />
            </Reveal>

            <div className="home-cat-grid">
              {categories.map(({ category, product, count }, index) => (
                <Reveal delay={index * 70} key={category}>
                  <Link className="home-cat-card" href="/shop">
                    <img alt={category} src={product.image} />
                    <div className="home-cat-card-overlay" />
                    <div className="home-cat-card-body">
                      <span className="home-cat-card-name">{category}</span>
                      <span className="home-cat-card-count">{count} products</span>
                    </div>
                    <div className="home-cat-card-arrow">↗</div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "#FFFFFF", padding: "1.5rem 0 2.5rem" }}>
          <div className="container">
            <Reveal>
              <div className="home-promo-banner">
                <div className="home-promo-image">
                  <img
                    alt="Free delivery promo"
                    src="https://images.pexels.com/photos/34939748/pexels-photo-34939748.jpeg?cs=srgb&dl=pexels-prolificpeople-34939748.jpg&fm=jpg"
                  />
                  <div className="home-promo-image-overlay" />
                </div>
                <div className="home-promo-copy">
                  <p className="home-promo-eyebrow">Store Promo</p>
                  <h3 className="home-promo-title">Free delivery over ₦50,000</h3>
                  <p className="home-promo-text">
                    Stack your skincare essentials in one order and unlock free delivery in major cities. No code
                    needed.
                  </p>
                </div>
                <div className="home-promo-cta">
                  <Link className="home-btn-primary" href="/shop">
                    Shop Now
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="best-sellers" style={{ background: "#FFFFFF", padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="container">
            <Reveal>
              <div className="home-sellers-head">
                <div>
                  <p className="home-sellers-eyebrow">Most Loved</p>
                  <h2>Best Sellers</h2>
                  <p>Top-performing products our shoppers reorder most often.</p>
                </div>
                <Link className="home-btn-outline" href="/shop">
                  View All Products
                </Link>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <ProductRail products={featuredProducts} />
            </Reveal>
          </div>
        </section>

        <section style={{ background: "var(--home-cream)", padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="container">
            <Reveal>
              <SectionHeader
                eyebrow="Routine Sets"
                subtitle="Bundled routine picks with grouped product content and direct calls to action."
                title="Shop Ready-Made Sets"
              />
            </Reveal>

            <div className="home-bundle-grid">
              {bundleCards.map((bundle, index) => {
                const bundlePrice = bundle.items.reduce((sum, item) => sum + getEffectivePrice(item), 0);

                return (
                  <Reveal delay={index * 90} key={bundle.title}>
                    <div className="home-bundle-card">
                      <div className="home-bundle-image-wrap">
                        <img alt={bundle.title} src={bundle.items[0].image} />
                        <span className="home-bundle-badge">Bundle Pick</span>
                      </div>
                      <div className="home-bundle-body">
                        <p className="home-bundle-eyebrow">Routine Set</p>
                        <h3 className="home-bundle-title">{bundle.title}</h3>
                        <p className="home-bundle-copy">{bundle.copy}</p>
                        <div className="home-bundle-items">
                          {bundle.items.map((item) => (
                            <div className="home-bundle-item-row" key={`${bundle.title}-${item.slug}`}>
                              <span>{item.name}</span>
                              <span className="home-bundle-item-price">{formatCurrency(getEffectivePrice(item))}</span>
                            </div>
                          ))}
                        </div>
                        <div className="home-bundle-footer">
                          <span className="home-bundle-price">{formatCurrency(bundlePrice)}</span>
                          <Link className="home-btn-gold" href="/shop">
                            Shop Set
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="new-arrivals" style={{ background: "#FFFFFF", padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="container">
            <Reveal>
              <div className="home-sellers-head">
                <div>
                  <p className="home-sellers-eyebrow">Fresh Picks</p>
                  <h2>New Arrivals</h2>
                  <p>Recent additions and high-interest products for returning shoppers.</p>
                </div>
                <Link className="home-btn-outline" href="/shop">
                  Browse New Products
                </Link>
              </div>
            </Reveal>

            <div className="home-arrivals-grid">
              {newArrivals.map((product, index) => (
                <Reveal delay={index * 70} key={product.slug}>
                  <div className="home-arrival-card">
                    <div className="home-arrival-image">
                      <img alt={product.name} src={product.image} />
                    </div>
                    <div className="home-arrival-body">
                      <div>
                        <p className="home-arrival-badge">{product.badge}</p>
                        <h3 className="home-arrival-name">{product.name}</h3>
                        <p className="home-arrival-desc">{product.description}</p>
                      </div>
                      <div className="home-arrival-foot">
                        <div className="flex flex-col">
                          {isProductOnSale(product) ? (
                            <span className="text-xs uppercase tracking-[0.14em] text-[var(--brand-ink-soft)] line-through">
                              {formatCurrency(product.price)}
                            </span>
                          ) : null}
                          <span className="home-arrival-price">{formatCurrency(getEffectivePrice(product))}</span>
                        </div>
                        <Link className="home-btn-gold" href={`/shop/${product.slug}`}>
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="home-newsletter-section">
          <div className="home-newsletter-inner">
            <Reveal>
              <p className="home-newsletter-eyebrow">Join the Community</p>
              <h2 className="home-newsletter-title">
                Glow Up
                <br />
                <em>Your Inbox</em>
              </h2>
              <p className="home-newsletter-subtitle">
                Get skincare offers, product drops, and quick routine tips delivered weekly. No spam, just glow.
              </p>
              <NewsletterSignup />
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
