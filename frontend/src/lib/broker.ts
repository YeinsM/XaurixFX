/** Returns the referral link only when it is a plain https URL; anything else disables the call to action. */
export function parseReferralUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

/** Set VITE_PUPRIME_REFERRAL_URL in frontend/.env.local (public: the link ends up in the page anyway). */
export const referralUrl = parseReferralUrl(import.meta.env.VITE_PUPRIME_REFERRAL_URL);
