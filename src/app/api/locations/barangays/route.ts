import { NextRequest, NextResponse } from 'next/server';
import provincesCitiesData from '@/data/philippines/provinces_cities.json';
import barangaysByCityData from '@/data/philippines/barangays_by_city.json';

const barangayMap = barangaysByCityData as Record<string, string[]>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityCode = searchParams.get('cityCode');
    const province = searchParams.get('province');
    const city = searchParams.get('city');

    // 1. Direct lookup by cityCode
    if (cityCode && barangayMap[cityCode]) {
      return NextResponse.json(
        {
          success: true,
          cityCode,
          barangays: barangayMap[cityCode] || [],
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        }
      );
    }

    // 2. Lookup by province + city name
    if (province && city) {
      const provObj = provincesCitiesData.find(
        (p) => p.name.toLowerCase() === province.toLowerCase()
      );
      if (provObj) {
        const cityObj = provObj.cities.find(
          (c) =>
            c.name.toLowerCase() === city.toLowerCase() ||
            c.name.toLowerCase().includes(city.toLowerCase()) ||
            city.toLowerCase().includes(c.name.toLowerCase())
        );
        if (cityObj && barangayMap[cityObj.code]) {
          return NextResponse.json(
            {
              success: true,
              cityCode: cityObj.code,
              cityName: cityObj.name,
              barangays: barangayMap[cityObj.code] || [],
            },
            {
              headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            }
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: false,
        barangays: [],
        message: 'City not found or no code provided',
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
