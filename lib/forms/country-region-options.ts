import { Country, State } from 'country-state-city';

let cachedCountryNames: string[] | null = null;

/** ISO English country names, sorted A–Z (for select UI). */
export function getSortedCountryNames(): string[] {
  if (cachedCountryNames) return cachedCountryNames;
  cachedCountryNames = Country.getAllCountries()
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b));
  return cachedCountryNames;
}

/** Province/state/region names for a country, sorted A–Z. Empty if unknown country or none in dataset. */
export function getRegionsForCountryName(countryName: string): string[] {
  const trimmed = countryName?.trim();
  if (!trimmed) return [];
  const country = Country.getAllCountries().find((c) => c.name === trimmed);
  if (!country) return [];
  return State.getStatesOfCountry(country.isoCode)
    .map((s) => s.name)
    .sort((a, b) => a.localeCompare(b));
}
