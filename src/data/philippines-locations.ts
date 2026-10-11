import provincesCitiesData from './philippines/provinces_cities.json';

export interface PhilippineCity {
  code?: string;
  name: string;
  zipCode: string;
  barangays?: string[];
}

export interface PhilippineProvince {
  name: string;
  region: string;
  regionCode?: string;
  cities: PhilippineCity[];
}

// 84 Complete Philippine Provinces & Regions, containing all 1,648 Cities & Municipalities
export const PHILIPPINES_LOCATIONS: PhilippineProvince[] =
  provincesCitiesData as unknown as PhilippineProvince[];

// In-memory cache for loaded barangays
const barangayCache = new Map<string, string[]>();

/**
 * Pre-seeded popular city barangays for zero-latency synchronous access
 */
const POPULAR_CITY_BARANGAYS: Record<string, string[]> = {
  'taguig city': [
    'Bagumbayan',
    'Bambang',
    'Calzada',
    'Central Bicutan',
    'Central Signal Village',
    'Fort Bonifacio (BGC)',
    'Hagonoy',
    'Ibayo-Tipas',
    'Katuparan',
    'Ligid-Tipas',
    'Lower Bicutan',
    'Maharlika Village',
    'Napindan',
    'New Lower Bicutan',
    'North Daang Hari',
    'North Signal Village',
    'Palingon',
    'Pinagsama',
    'San Miguel',
    'Santa Ana',
    'South Daang Hari',
    'South Signal Village',
    'Tanyag',
    'Tuktukan',
    'Upper Bicutan',
    'Ususan',
    'Western Bicutan',
  ],
  'makati city': [
    'Bangkal',
    'Bel-Air',
    'Carmona',
    'Cembo',
    'Comembo',
    'Dasmariñas',
    'East Rembo',
    'Forbes Park',
    'Guadalupe Nuevo',
    'Guadalupe Viejo',
    'Kasilawan',
    'La Paz',
    'Magallanes',
    'Olympia',
    'Palanan',
    'Pembo',
    'Pinagkaisahan',
    'Pio del Pilar',
    'Pitogo',
    'Poblacion',
    'Post Proper Northside',
    'Post Proper Southside',
    'Rizal',
    'San Antonio',
    'San Isidro',
    'San Lorenzo',
    'Santa Cruz',
    'Singkamas',
    'South Cembo',
    'Tejeros',
    'Urdaneta',
    'Valenzuela',
    'West Rembo',
  ],
  'quezon city': [
    'Alicia',
    'Amihan',
    'Apolonio Samson',
    'Baesa',
    'Bagbag',
    'Bagong Lipunan ng Crame',
    'Bagong Pag-asa',
    'Bagong Silang',
    'Bagumbayan (Eastwood)',
    'Bahay Toro',
    'Balingasa',
    'Balong Bato',
    'Batasan Hills',
    'Camp Aguinaldo',
    'Central',
    'Commonwealth',
    'Culiat',
    'Diliman',
    'Fairview',
    'Greater Lagro',
    'Holy Spirit',
    'Kamuning',
    'Katipunan',
    'Krus na Ligas',
    'Libis',
    'Loyola Heights',
    'Mariana (New Manila)',
    'Novaliches Proper',
    'Payatas',
    'Phil-Am',
    'Pinyahan',
    'Project 6',
    'Sacred Heart',
    'San Bartolome',
    'San Francisco del Monte',
    'Santa Mesa Heights',
    'Santo Domingo',
    'Sikatuna Village',
    'South Triangle',
    'Tandang Sora',
    'Teachers Village East',
    'Teachers Village West',
    'UP Campus',
    'UP Village',
    'West Triangle',
    'White Plains',
  ],
  'pasig city': [
    'Bagong Ilog',
    'Bagong Katipunan',
    'Bambang',
    'Buting',
    'Caniogan',
    'Dela Paz',
    'Kalawaan',
    'Kapasigan',
    'Kapitolyo',
    'Malinao',
    'Manggahan',
    'Maybunga',
    'Ortigas Center (San Antonio)',
    'Palatiw',
    'Pinagbuhatan',
    'Pineda',
    'Rosario',
    'Sagad',
    'San Joaquin',
    'San Jose',
    'San Nicolas',
    'San Roque',
    'Santa Cruz',
    'Santa Lucia',
    'Santa Rosa',
    'Santolan',
    'Santo Tomas',
    'Sumilang',
    'Ugong',
  ],
  'cebu city': [
    'Apas (IT Park)',
    'Babag',
    'Banilad',
    'Basak Pardo',
    'Basak San Nicolas',
    'Busay',
    'Camputhaw',
    'Capitol Site',
    'Carreta',
    'Cogon Ramos',
    'Guadalupe',
    'Inayawan',
    'Kasambagan',
    'Labangon',
    'Lahug',
    'Mabolo',
    'Mambaling',
    'Pardo',
    'Punta Princesa',
    'Sambag I',
    'Sambag II',
    'San Nicolas Proper',
    'San Roque',
    'Santa Cruz',
    'Santo Niño',
    'Talamban',
    'Tejero',
    'Tisa',
    'Zapatera',
  ],
  'davao city': [
    'Agdao Proper',
    'Bago Aplaya',
    'Bago Gallera',
    'Bajada',
    'Bucana',
    'Buhangin Proper',
    'Cabantian',
    'Calinan Proper',
    'Catalunan Grande',
    'Catalunan Pequeño',
    'Daliao (Toril)',
    'Indangan',
    'Lanang',
    'Maa',
    'Matina Aplaya',
    'Matina Crossing',
    'Mintal',
    'Panacan',
    'Poblacion District',
    'Sasa',
    'Talomo Proper',
    'Toril Proper',
  ],
};

/**
 * Returns complete list of all 84 Philippine provinces / regions.
 * Metro Manila (NCR) is first, followed by all 82 provinces alphabetically.
 */
export function getProvincesList(): string[] {
  return PHILIPPINES_LOCATIONS.map((p) => p.name);
}

/**
 * Returns all cities / municipalities for a given province name.
 */
export function getCitiesByProvince(provinceName: string): PhilippineCity[] {
  if (!provinceName) return [];
  const prov = PHILIPPINES_LOCATIONS.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase()
  );
  return prov ? prov.cities : [];
}

/**
 * Returns PSGC code for a city in a province.
 */
export function getCityCode(provinceName: string, cityName: string): string | undefined {
  const cities = getCitiesByProvince(provinceName);
  const city = cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  return city?.code;
}

/**
 * Returns auto zip code for a city.
 */
export function getCityZipCode(provinceName: string, cityName: string): string {
  const cities = getCitiesByProvince(provinceName);
  const city = cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  return city?.zipCode || '';
}

/**
 * Synchronous barangay getter: Checks pre-seeded popular lists and in-memory cache.
 */
export function getBarangaysByCity(provinceName: string, cityName: string): string[] {
  if (!provinceName || !cityName) return [];
  const cacheKey = `${provinceName}::${cityName}`.toLowerCase();
  if (barangayCache.has(cacheKey)) {
    return barangayCache.get(cacheKey)!;
  }

  const cleanCity = cityName.toLowerCase().trim();
  if (POPULAR_CITY_BARANGAYS[cleanCity]) {
    return POPULAR_CITY_BARANGAYS[cleanCity];
  }

  return [];
}

/**
 * Comprehensive asynchronous barangay fetcher:
 * Covers 100% of all 42,029 barangays in the Philippines.
 * Caches in memory for instant reuse.
 */
export async function fetchBarangaysForCity(
  provinceName: string,
  cityName: string
): Promise<string[]> {
  if (!provinceName || !cityName) return [];
  const cacheKey = `${provinceName}::${cityName}`.toLowerCase();

  if (barangayCache.has(cacheKey)) {
    return barangayCache.get(cacheKey)!;
  }

  // 1. Try local API route
  if (typeof window !== 'undefined') {
    try {
      const cityCode = getCityCode(provinceName, cityName);
      const url = cityCode
        ? `/api/locations/barangays?cityCode=${encodeURIComponent(cityCode)}`
        : `/api/locations/barangays?province=${encodeURIComponent(provinceName)}&city=${encodeURIComponent(cityName)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.barangays && data.barangays.length > 0) {
          barangayCache.set(cacheKey, data.barangays);
          return data.barangays;
        }
      }
    } catch {
      // Network error, proceed to dynamic import fallback
    }
  }

  // 2. Client-side dynamic import fallback
  try {
    const barangayDataModule = await import('./philippines/barangays_by_city.json');
    const barangayData = (barangayDataModule.default ||
      barangayDataModule) as Record<string, string[]>;
    const cityCode = getCityCode(provinceName, cityName);
    if (cityCode && barangayData[cityCode]) {
      const list = barangayData[cityCode];
      barangayCache.set(cacheKey, list);
      return list;
    }
  } catch {
    // Dynamic import error
  }

  // 3. Fallback to pre-seeded popular lists
  const cleanCity = cityName.toLowerCase().trim();
  if (POPULAR_CITY_BARANGAYS[cleanCity]) {
    barangayCache.set(cacheKey, POPULAR_CITY_BARANGAYS[cleanCity]);
    return POPULAR_CITY_BARANGAYS[cleanCity];
  }

  return [];
}
