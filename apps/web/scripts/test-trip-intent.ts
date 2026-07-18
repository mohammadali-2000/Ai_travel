import { parseTripIntent } from '../src/lib/trip-intent';

const reference = new Date(2026, 6, 18, 12, 0, 0);
type Expectation = { key: string; actual: unknown; expected: unknown };

function verify(prompt: string, expectations: Expectation[]) {
  const result = parseTripIntent(prompt, reference);
  const failed = expectations.filter(({ actual, expected }) => actual !== expected);
  if (failed.length) {
    throw new Error(`${prompt}\n${failed.map(({ key, actual, expected }) => `${key}: expected ${String(expected)}, got ${String(actual)}`).join('\n')}`);
  }
  console.log(`✓ ${prompt}`);
}

verify('I wanted to travel Bhopal for 10 days', [
  { key: 'destination', actual: parseTripIntent('I wanted to travel Bhopal for 10 days', reference).destination.value, expected: 'Bhopal' },
  { key: 'duration', actual: parseTripIntent('I wanted to travel Bhopal for 10 days', reference).duration.value, expected: 10 },
  { key: 'start date', actual: parseTripIntent('I wanted to travel Bhopal for 10 days', reference).startDate.value, expected: '2026-07-18' },
  { key: 'end date', actual: parseTripIntent('I wanted to travel Bhopal for 10 days', reference).endDate.value, expected: '2026-07-28' },
  { key: 'travelers', actual: parseTripIntent('I wanted to travel Bhopal for 10 days', reference).travelers.value, expected: 'Solo' },
]);

verify('Goa next weekend with friends under ₹25000', [
  { key: 'destination', actual: parseTripIntent('Goa next weekend with friends under ₹25000', reference).destination.value, expected: 'Goa' },
  { key: 'dates', actual: parseTripIntent('Goa next weekend with friends under ₹25000', reference).dates.value, expected: 'Next Weekend' },
  { key: 'budget', actual: parseTripIntent('Goa next weekend with friends under ₹25000', reference).budget.value, expected: 25000 },
  { key: 'travelers', actual: parseTripIntent('Goa next weekend with friends under ₹25000', reference).travelers.value, expected: 'Friends' },
]);

verify('Japan from 1 Aug to 10 Aug', [
  { key: 'destination', actual: parseTripIntent('Japan from 1 Aug to 10 Aug', reference).destination.value, expected: 'Japan' },
  { key: 'start date', actual: parseTripIntent('Japan from 1 Aug to 10 Aug', reference).startDate.value, expected: '2026-08-01' },
  { key: 'end date', actual: parseTripIntent('Japan from 1 Aug to 10 Aug', reference).endDate.value, expected: '2026-08-10' },
]);

verify('Luxury honeymoon in Bali', [
  { key: 'destination', actual: parseTripIntent('Luxury honeymoon in Bali', reference).destination.value, expected: 'Bali' },
  { key: 'style', actual: parseTripIntent('Luxury honeymoon in Bali', reference).style, expected: 'Luxury' },
  { key: 'trip type', actual: parseTripIntent('Luxury honeymoon in Bali', reference).tripType, expected: 'Honeymoon' },
]);

verify('Solo backpacking Europe for two weeks', [
  { key: 'destination', actual: parseTripIntent('Solo backpacking Europe for two weeks', reference).destination.value, expected: 'Europe' },
  { key: 'travelers', actual: parseTripIntent('Solo backpacking Europe for two weeks', reference).travelers.value, expected: 'Solo' },
  { key: 'duration', actual: parseTripIntent('Solo backpacking Europe for two weeks', reference).duration.value, expected: 14 },
  { key: 'style', actual: parseTripIntent('Solo backpacking Europe for two weeks', reference).style, expected: 'Backpacking' },
]);

verify('Dubai under ₹50000', [
  { key: 'destination', actual: parseTripIntent('Dubai under ₹50000', reference).destination.value, expected: 'Dubai' },
  { key: 'budget', actual: parseTripIntent('Dubai under ₹50000', reference).budget.value, expected: 50000 },
  { key: 'currency', actual: parseTripIntent('Dubai under ₹50000', reference).currency.value, expected: 'INR' },
]);

verify('Kerala family trip', [
  { key: 'destination', actual: parseTripIntent('Kerala family trip', reference).destination.value, expected: 'Kerala' },
  { key: 'travelers', actual: parseTripIntent('Kerala family trip', reference).travelers.value, expected: 'Family' },
  { key: 'trip type', actual: parseTripIntent('Kerala family trip', reference).tripType, expected: 'Family vacation' },
]);

verify('Solo Ladakh bike trip', [
  { key: 'destination', actual: parseTripIntent('Solo Ladakh bike trip', reference).destination.value, expected: 'Ladakh' },
  { key: 'travelers', actual: parseTripIntent('Solo Ladakh bike trip', reference).travelers.value, expected: 'Solo' },
  { key: 'style', actual: parseTripIntent('Solo Ladakh bike trip', reference).style, expected: 'Adventure' },
  { key: 'trip type', actual: parseTripIntent('Solo Ladakh bike trip', reference).tripType, expected: 'Bike trip' },
]);

console.log('All intent extraction cases passed.');
