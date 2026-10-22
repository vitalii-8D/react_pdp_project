import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import { paths } from '../lib/paths';
import { MIN_QUERY_LENGTH } from '../lib/search-constants';
import type { AddressSuggestion } from '../routes/profile/profile.geocode';

const DEBOUNCE_MS = 500;

interface AddressAutocompleteFieldProps {
  label: string;
  hint?: string;
  cityFieldName: string;
  latFieldName: string;
  lonFieldName: string;
  defaultCity?: string;
  defaultLat?: number | null;
  defaultLon?: number | null;
}

interface GeocodeFetcherData {
  suggestions: AddressSuggestion[];
}

export function AddressAutocompleteField({
  label,
  hint,
  cityFieldName,
  latFieldName,
  lonFieldName,
  defaultCity = '',
  defaultLat,
  defaultLon,
}: AddressAutocompleteFieldProps) {
  const [city, setCity] = useState(defaultCity);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | undefined>(
    defaultLat != null && defaultLon != null ? { lat: defaultLat, lon: defaultLon } : undefined,
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const geocodeFetcher = useFetcher<GeocodeFetcherData>();
  // Suggestions the user typed below the search threshold on - hidden so they don't reappear once
  // the text is long enough again (a new load replaces them).
  const [dismissedData, setDismissedData] = useState<GeocodeFetcherData | undefined>(undefined);

  const trimmedCity = city.trim();

  useEffect(() => {
    if (trimmedCity.length < MIN_QUERY_LENGTH || trimmedCity === defaultCity) {
      return;
    }

    // A newer load aborts the one still in flight, so suggestions for text the user has already
    // typed past never land.
    const timeout = setTimeout(() => {
      geocodeFetcher.load(`${paths.profileGeocode()}?q=${encodeURIComponent(trimmedCity)}`);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // fetcher identity changes every render by design; only re-run when the text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedCity, defaultCity]);

  const suggestions =
    geocodeFetcher.data && geocodeFetcher.data !== dismissedData ? geocodeFetcher.data.suggestions : [];

  function handleSelect(suggestion: AddressSuggestion) {
    setCity(suggestion.city);
    setCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <label htmlFor="address-autocomplete" className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id="address-autocomplete"
        name={cityFieldName}
        type="text"
        value={city}
        onChange={(event) => {
          setCity(event.target.value);
          setCoords(undefined);
          setShowSuggestions(true);
          // Too short to search: drop the old suggestions so they don't reappear once it's long enough.
          if (event.target.value.trim().length < MIN_QUERY_LENGTH) {
            setDismissedData(geocodeFetcher.data);
          }
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        autoComplete="off"
        placeholder="Start typing your city or address..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input type="hidden" name={latFieldName} value={coords?.lat ?? ''} />
      <input type="hidden" name={lonFieldName} value={coords?.lon ?? ''} />

      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}

      {showSuggestions && trimmedCity.length >= MIN_QUERY_LENGTH && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg divide-y divide-slate-100">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.lat}-${suggestion.lon}-${index}`}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
