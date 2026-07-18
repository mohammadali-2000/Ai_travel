export type ParsedField<T> = { value?: T; confidence: number };
export type TripIntent = {
  destination: ParsedField<string>; budget: ParsedField<number>; currency: ParsedField<string>;
  travelers: ParsedField<string>; travelerCount: ParsedField<number>; dates: ParsedField<string>;
  duration: ParsedField<number>; month: ParsedField<string>; interests: string[]; style?: string; tripType?: string;
};

const places = ['Japan', 'Goa', 'Kashmir', 'Bali', 'Paris', 'London', 'Dubai', 'Kerala', 'Kyoto', 'Mumbai', 'Delhi'];
const interests = ['anime', 'photography', 'food', 'culture', 'beaches', 'mountains', 'hiking', 'nightlife', 'history', 'wildlife'];

export function parseTripIntent(input: string): TripIntent {
  const text = input.trim(); const lower = text.toLowerCase();
  const place = places.find((item) => new RegExp(`\\b${item}\\b`, 'i').test(text)) || text.match(/(?:visit|to|in)\s+([A-Z][a-zA-Z]+)/)?.[1];
  const budgetMatch = text.match(/(?:under|around|budget(?:\s+of)?|₹|INR)\s*(?:₹|INR)?\s*([\d,.]+)\s*(lakh|lac|k)?/i);
  const rawBudget = budgetMatch?.[1]?.replace(/,/g, ''); const multiplier = /lakh|lac/i.test(budgetMatch?.[2] ?? '') ? 100000 : /k/i.test(budgetMatch?.[2] ?? '') ? 1000 : 1;
  const budget = rawBudget ? Number(rawBudget) * multiplier : undefined;
  const count = text.match(/\b(\d+)\s*(?:people|persons|travellers?|travelers?)\b/i)?.[1];
  const type = ['friends', 'family', 'couple', 'solo', 'honeymoon'].find((item) => new RegExp(`\\b${item}\\b`, 'i').test(text));
  const duration = text.match(/\b(\d+)\s*[- ]?(?:day|days)\b/i)?.[1];
  const relative = lower.includes('next weekend') ? 'Next Weekend' : lower.includes('this weekend') ? 'This Weekend' : undefined;
  const month = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i)?.[1];
  const range = text.match(/(?:from\s+)?(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\s*(?:to|–|-)\s*(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)/i);
  const foundInterests = interests.filter((item) => new RegExp(`\\b${item}\\b`, 'i').test(text)).map((item) => item[0].toUpperCase() + item.slice(1));
  const style = ['luxury', 'backpacking', 'budget', 'adventure', 'relaxed'].find((item) => new RegExp(`\\b${item}\\b`, 'i').test(text));
  const tripType = lower.includes('honeymoon') ? 'Honeymoon' : undefined;
  return { destination:{value:place,confidence:place?0.92:0}, budget:{value:budget,confidence:budget?0.95:0}, currency:{value:budget?'INR':undefined,confidence:budget?0.9:0}, travelers:{value:type && (type[0].toUpperCase()+type.slice(1)),confidence:type?0.9:0}, travelerCount:{value:count?Number(count):undefined,confidence:count?0.95:0}, dates:{value:relative || (range?`${range[1]} → ${range[2]}`:month),confidence:relative||range||month?0.85:0}, duration:{value:duration?Number(duration):undefined,confidence:duration?0.95:0}, month:{value:month,confidence:month?0.95:0}, interests:foundInterests, style:style && (style[0].toUpperCase()+style.slice(1)), tripType };
}
