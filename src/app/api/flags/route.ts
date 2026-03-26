// API route for flag operations
import { NextResponse } from 'next/server';
import flags from '@/data/flags-sample.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('code');
  const search = searchParams.get('search');

  // Get specific flag by country code
  if (countryCode) {
    const flag = flags.find(f => f.countryCode === countryCode.toUpperCase());
    
    if (!flag) {
      return NextResponse.json(
        { error: 'Country code not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(flag);
  }

  // Search flags
  if (search) {
    const query = search.toLowerCase();
    const results = flags.filter(flag => 
      flag.countryName.toLowerCase().includes(query) ||
      flag.countryCode.toLowerCase().includes(query)
    );
    
    return NextResponse.json(results);
  }

  // Return all flags
  return NextResponse.json(flags);
}

// Example POST endpoint for profile with country
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, countryCode, ...otherData } = body;

    // Validate country code
    const flag = flags.find(f => f.countryCode === countryCode?.toUpperCase());
    
    if (!flag) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      );
    }

    // Here you would save to your database
    const profile = {
      userId,
      countryCode: flag.countryCode,
      countryName: flag.countryName,
      flagPath: flag.path,
      ...otherData,
      updatedAt: new Date().toISOString()
    };

    // Example: await db.profile.upsert({ where: { userId }, data: profile });

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
