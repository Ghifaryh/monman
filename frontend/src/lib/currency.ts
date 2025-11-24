/**
 * Currency formatting utilities for Indonesian Rupiah (IDR)
 *
 * Learning Note: Indonesia uses:
 * - Rupiah (Rp) as currency symbol
 * - Dot (.) as thousands separator: Rp 1.000.000
 * - Comma (,) as decimal separator: Rp 1.000,50
 * - No cents in daily usage (amounts usually in full Rupiah)
 */

/**
 * Format amount in cents to Indonesian Rupiah string
 * @param amountInCents - Amount stored as integer in cents (e.g., 100000 = Rp 1.000)
 * @param options - Formatting options
 * @returns Formatted Rupiah string
 */
export const formatRupiah = (
  amountInCents: number,
  options: {
    showDecimals?: boolean;
    compact?: boolean;
    showSymbol?: boolean;
  } = {}
): string => {
  const {
    showDecimals = false,
    compact = false,
    showSymbol = true
  } = options;

  // Convert cents to Rupiah (divide by 100)
  const amount = amountInCents / 100;

  // Use Indonesian locale for proper formatting
  const formatter = new Intl.NumberFormat('id-ID', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short'
  });

  let formatted = formatter.format(amount);

  // Indonesian currency formatting adjustments
  if (showSymbol && !compact) {
    // Replace IDR with Rp for local convention
    formatted = formatted.replace('IDR', 'Rp').replace('Rp ', 'Rp ');
  }

  return formatted;
};

/**
 * Format large amounts with Indonesian abbreviations
 * @param amountInCents - Amount in cents
 * @returns Compact formatted string (e.g., "Rp 2,5 jt" for 2.5 million)
 */
export const formatRupiahCompact = (amountInCents: number): string => {
  const amount = amountInCents / 100;

  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`; // Miliar
  } else if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`; // Juta
  } else if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`; // Ribu
  } else {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
};

/**
 * Parse Rupiah string to cents (for form inputs)
 * @param rupiahString - String like "Rp 1.000.000" or "1000000"
 * @returns Amount in cents
 */
export const parseRupiah = (rupiahString: string): number => {
  // Remove currency symbols and spaces
  const cleanString = rupiahString
    .replace(/Rp\s?/gi, '')
    .replace(/\./g, '') // Remove thousands separators
    .replace(/,/g, '.') // Convert comma decimals to dots
    .trim();

  const amount = parseFloat(cleanString) || 0;
  return Math.round(amount * 100); // Convert to cents
};

/**
 * Get appropriate color class for transaction amounts
 * @param amountInCents - Transaction amount in cents
 * @returns Tailwind color class
 */
export const getAmountColorClass = (amountInCents: number): string => {
  if (amountInCents > 0) {
    return 'text-green-600'; // Income - green
  } else if (amountInCents < 0) {
    return 'text-red-600'; // Expense - red
  } else {
    return 'text-gray-600'; // Zero - gray
  }
};

/**
 * Examples of usage:
 *
 * formatRupiah(250000) // "Rp 2.500"
 * formatRupiah(250000, { showDecimals: true }) // "Rp 2.500,00"
 * formatRupiahCompact(2500000) // "Rp 25 rb"
 * parseRupiah("Rp 1.000.000") // 100000000 (cents)
 */