export type ParsedField<T> = { value?: T; confidence: number };

export type TripIntent = {
  destination: ParsedField<string>;
  budget: ParsedField<number>;
  currency: ParsedField<string>;
  travelers: ParsedField<string>;
  travelerCount: ParsedField<number>;
  dates: ParsedField<string>;
  startDate: ParsedField<string>;
  endDate: ParsedField<string>;
  duration: ParsedField<number>;
  month: ParsedField<string>;
  interests: string[];
  style?: string;
  tripType?: string;
  missing: Array<'destination' | 'dates' | 'budget'>;
  isConfident: boolean;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const DESTINATIONS = [
  'Abu Dhabi', 'Amsterdam', 'Bali', 'Bangkok', 'Barcelona', 'Bhopal', 'Bora Bora',
  'Delhi', 'Dubai', 'Europe', 'Goa', 'Himachal Pradesh', 'Himachal', 'India', 'Istanbul',
  'Japan', 'Jaipur', 'Kashmir', 'Kerala', 'Kyoto', 'Ladakh', 'London', 'Manali', 'Mumbai', 'New York',
  'Paris', 'Rajasthan', 'Rome', 'Seoul', 'Singapore', 'Switzerland', 'Thailand', 'Tokyo',
  'Udaipur', 'Vietnam',
];

const INTERESTS: Array<[RegExp, string]> = [
  [/\banime\b/i, 'Anime'], [/\bphoto(?:graphy|s)?\b/i, 'Photography'],
  [/\b(?:food|culinary|cuisine|restaurants?)\b/i, 'Food'], [/\b(?:culture|cultural)\b/i, 'Culture'],
  [/\b(?:beach|beaches)\b/i, 'Beaches'], [/\b(?:mountain|mountains)\b/i, 'Mountains'],
  [/\b(?:hiking|trekking|trek)\b/i, 'Hiking'], [/\bnightlife\b/i, 'Nightlife'],
  [/\bhistory|historic(?:al)?\b/i, 'History'], [/\bwildlife\b/i, 'Wildlife'],
  [/\b(?:bike|biking|motorcycle|motorcycling)\b/i, 'Motorcycling'],
];

const MONTH_PATTERN = '(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)';
const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

function field<T>(value: T | undefined, confidence = value === undefined ? 0 : 0.96): ParsedField<T> {
  return { value, confidence };
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isoDate(value: Date) {
  return DATE_FORMATTER.format(value);
}

function localDate(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function monthIndex(raw: string) {
  const index = MONTHS.findIndex((month) => month.toLowerCase().startsWith(raw.toLowerCase().slice(0, 3)));
  return index === -1 ? undefined : index;
}

function findDestination(text: string): ParsedField<string> {
  const known = DESTINATIONS
    .slice()
    .sort((left, right) => right.length - left.length)
    .find((place) => new RegExp(`\\b${place.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i').test(text));
  if (known) return field(known, 0.99);

  const directed = text.match(/\b(?:travel(?:ling|ing|led)?(?:\s+to)?|visit(?:ing)?|explore(?:ing)?|go(?:ing)?(?:\s+to)?|trip\s+to)\s+([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)?)/i)?.[1];
  if (directed) {
    const cleaned = directed.replace(/\s+(?:for|in|on|with|under|around|next|this)$/i, '');
    return field(titleCase(cleaned), 0.84);
  }

  const locationPhrase = text.match(/\b(?:in|to)\s+([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*)?)(?=\s*(?:for|from|next|this|with|under|around|in\s+\d|$))/)?.[1];
  return locationPhrase ? field(locationPhrase, 0.76) : field<string>(undefined);
}

function parseBudget(text: string): { amount?: number; currency?: string } {
  const match = text.match(/(?:\b(?:under|below|around|about|budget(?:\s+of)?|for)\s*)?(₹|INR\b|\$|USD\b|€|EUR\b|£|GBP\b)\s*([\d,.]+)\s*(lakh|lac|lakhs|lacs|k|thousand)?\b|\b(?:under|below|around|about|budget(?:\s+of)?)\s+([\d,.]+)\s*(lakh|lac|lakhs|lacs|k|thousand)\b/i);
  if (!match) return {};
  const symbol = match[1]?.toUpperCase();
  const raw = match[2] ?? match[4];
  const scale = (match[3] ?? match[5] ?? '').toLowerCase();
  const numeric = Number(raw?.replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return {};
  const multiplier = /lac|lakh/.test(scale) ? 100_000 : /k|thousand/.test(scale) ? 1_000 : 1;
  const currency = symbol === '₹' || symbol === 'INR' || !symbol ? 'INR' : symbol === '$' || symbol === 'USD' ? 'USD' : symbol === '€' || symbol === 'EUR' ? 'EUR' : 'GBP';
  return { amount: numeric * multiplier, currency };
}

function parseTravelers(text: string): { type?: string; count?: number } {
  const explicit = text.match(/\b(\d+)\s*(?:people|persons|travellers?|travelers?|guests?)\b/i)?.[1];
  if (explicit) return { type: `${explicit} travelers`, count: Number(explicit) };
  if (/\b(?:solo|alone)\b/i.test(text)) return { type: 'Solo', count: 1 };
  if (/\b(?:honeymoon|couple|partner)\b/i.test(text)) return { type: /honeymoon/i.test(text) ? 'Honeymoon couple' : 'Couple', count: 2 };
  if (/\bfriends?\b/i.test(text)) return { type: 'Friends' };
  if (/\bfamil(?:y|ies)\b/i.test(text)) return { type: 'Family' };
  return { type: 'Solo', count: 1 };
}

function parseDuration(text: string) {
  const numeric = text.match(/\b(\d+)\s*[- ]?(?:day|days|night|nights)\b/i)?.[1];
  if (numeric) return Number(numeric);
  const weeks = text.match(/\b(?:(one|two|three|four)|([\d]+))\s+weeks?\b/i);
  if (!weeks) return undefined;
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
  return (weeks[2] ? Number(weeks[2]) : words[weeks[1].toLowerCase()]) * 7;
}

function parseDates(text: string, duration: number | undefined, reference: Date) {
  const range = text.match(new RegExp(`(?:from\\s+)?(\\d{1,2})\\s*${MONTH_PATTERN}(?:\\s*(\\d{4}))?\\s*(?:to|until|–|-)\\s*(\\d{1,2})\\s*${MONTH_PATTERN}(?:\\s*(\\d{4}))?`, 'i'));
  if (range) {
    const startMonth = monthIndex(range[2]); const endMonth = monthIndex(range[5]);
    if (startMonth !== undefined && endMonth !== undefined) {
      let startYear = Number(range[3]) || reference.getFullYear();
      if (!range[3] && localDate(startYear, startMonth, Number(range[1])) < new Date(reference.getFullYear(), reference.getMonth(), reference.getDate())) startYear += 1;
      let endYear = Number(range[6]) || startYear;
      if (!range[6] && endMonth < startMonth) endYear += 1;
      const start = localDate(startYear, startMonth, Number(range[1]));
      const end = localDate(endYear, endMonth, Number(range[4]));
      return { label: `${Number(range[1])} ${MONTHS[startMonth].slice(0, 3)} → ${Number(range[4])} ${MONTHS[endMonth].slice(0, 3)}`, start, end };
    }
  }

  if (/\bnext weekend\b/i.test(text) || /\bthis weekend\b/i.test(text)) {
    const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 12);
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const offset = /next weekend/i.test(text) ? (daysUntilSaturday || 7) + 7 * (today.getDay() === 6 ? 0 : 0) : daysUntilSaturday;
    const start = new Date(today); start.setDate(today.getDate() + offset);
    const end = new Date(start); end.setDate(start.getDate() + 1);
    return { label: /next weekend/i.test(text) ? 'Next Weekend' : 'This Weekend', start, end };
  }

  const monthOnly = text.match(new RegExp(`\\b${MONTH_PATTERN}\\b`, 'i'))?.[1];
  if (duration) {
    const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 12);
    const end = new Date(start); end.setDate(start.getDate() + duration);
    return { label: `${duration} days`, start, end, month: monthOnly };
  }
  return { label: monthOnly ? titleCase(monthOnly) : undefined, month: monthOnly };
}

export function parseTripIntent(input: string, referenceDate = new Date()): TripIntent {
  const text = input.trim();
  const destination = findDestination(text);
  const budgetValue = parseBudget(text);
  const durationValue = parseDuration(text);
  const dateValue = parseDates(text, durationValue, referenceDate);
  const travelerValue = parseTravelers(text);
  const foundInterests = INTERESTS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  const style = /\bluxury\b/i.test(text) ? 'Luxury' : /\bbackpacking\b/i.test(text) ? 'Backpacking' : /\b(?:budget|cheap)\b/i.test(text) ? 'Budget' : /\b(?:adventure|bike trip|road trip)\b/i.test(text) ? 'Adventure' : /\b(?:relaxed|slow travel)\b/i.test(text) ? 'Relaxed' : undefined;
  const tripType = /\bhoneymoon\b/i.test(text) ? 'Honeymoon' : /\bfamil(?:y|ies)\b/i.test(text) ? 'Family vacation' : /\bbike trip\b/i.test(text) ? 'Bike trip' : undefined;
  const dates = field(dateValue.label, dateValue.label ? 0.96 : 0);
  const startDate = field(dateValue.start ? isoDate(dateValue.start) : undefined, dateValue.start ? 0.94 : 0);
  const endDate = field(dateValue.end ? isoDate(dateValue.end) : undefined, dateValue.end ? 0.94 : 0);
  const missing: TripIntent['missing'] = [];
  if (destination.confidence < 0.75) missing.push('destination');
  if (!dates.value) missing.push('dates');
  if (!budgetValue.amount) missing.push('budget');

  return {
    destination,
    budget: field(budgetValue.amount, budgetValue.amount ? 0.98 : 0),
    currency: field(budgetValue.currency, budgetValue.currency ? 0.98 : 0),
    travelers: field(travelerValue.type, travelerValue.type ? 0.94 : 0),
    travelerCount: field(travelerValue.count, travelerValue.count ? 0.94 : 0),
    dates,
    startDate,
    endDate,
    duration: field(durationValue, durationValue ? 0.96 : 0),
    month: field(dateValue.month ? titleCase(dateValue.month) : undefined, dateValue.month ? 0.92 : 0),
    interests: foundInterests,
    style,
    tripType,
    missing,
    isConfident: destination.confidence >= 0.75,
  };
}
