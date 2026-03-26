export type DemoProfile = {
  id: string;
  name: string;
  handle: string;
  country: string;
  flag: string;
  countries: number;
  media: number;
  collections: number;
  cover: string;
  avatar: string;
  align: 'start' | 'end';
  bio: string;
  interests: string[];
  languages: string[];
  homeland: string;
  currentlyIn: string;
  socials: string[];
};

export const demoProfiles: DemoProfile[] = [
  {
    id: '002',
    name: 'Michael Thompson',
    handle: '@micheal.th99',
    country: 'Colombia',
    flag: '🇨🇴',
    countries: 45,
    media: 245,
    collections: 16,
    cover: '/images/profile-cover1-figma.png',
    avatar: '/images/profile-avatar1-figma.png',
    align: 'end',
    bio: 'Slow journeys, long train rides, and stories from mountain towns. I travel for human connection and local culture.',
    interests: ['Slow Travel', 'Digital Nomad Life', 'Photography', 'Cultural Exchange'],
    languages: ['English', 'Spanish'],
    homeland: 'Bogota, Colombia',
    currentlyIn: 'Medellin, Colombia',
    socials: ['instagram.com/micheal.th99', 'x.com/michealth99'],
  },
  {
    id: '003',
    name: 'Olivia Reynolds',
    handle: '@olivia_traveller',
    country: 'Italy',
    flag: '🇮🇹',
    countries: 12,
    media: 96,
    collections: 34,
    cover: '/images/profile-cover2-figma.png',
    avatar: '/images/profile-avatar2-figma.png',
    align: 'start',
    bio: 'I build food-first itineraries and document neighborhood life in every city I visit.',
    interests: ['Food Exploration', 'Street Food', 'Cities & Architecture', 'Writing'],
    languages: ['English', 'Italian'],
    homeland: 'Milan, Italy',
    currentlyIn: 'Naples, Italy',
    socials: ['instagram.com/olivia_traveller'],
  },
  {
    id: '001',
    name: 'Robert Williamson',
    handle: '@robert.wando',
    country: 'United States',
    flag: '🇺🇸',
    countries: 28,
    media: 245,
    collections: 16,
    cover: '/images/profile-cover3-figma.png',
    avatar: '/images/profile-avatar3-figma.png',
    align: 'end',
    bio: 'Trails, ocean winds, and backcountry camps. I share routes and moments from the wild.',
    interests: ['Hiking', 'Nature & Landscapes', 'Surfing', 'Long Walks'],
    languages: ['English', 'French'],
    homeland: 'San Diego, United States',
    currentlyIn: 'Santa Marta, Colombia',
    socials: ['instagram.com/robert.wando', 'facebook.com/robert.wando'],
  },
  {
    id: '004',
    name: 'Daniel Harris',
    handle: '@dh_88',
    country: 'Mexico',
    flag: '🇲🇽',
    countries: 8,
    media: 102,
    collections: 19,
    cover: '/images/profile-cover4-figma.png',
    avatar: '/images/profile-avatar4-figma.jpg',
    align: 'start',
    bio: 'Weekend escapes and long-form photo essays from across Latin America.',
    interests: ['Photography', 'Weekend Trips', 'Art & Museums'],
    languages: ['English', 'Spanish'],
    homeland: 'Monterrey, Mexico',
    currentlyIn: 'Oaxaca, Mexico',
    socials: ['x.com/dh_88'],
  },
  {
    id: '005',
    name: 'Sarah Mitchell',
    handle: '@sarah.mitchell',
    country: 'Thailand',
    flag: '🇹🇭',
    countries: 12,
    media: 56,
    collections: 10,
    cover: '/images/profile-cover5-figma.png',
    avatar: '/images/profile-avatar5-figma.png',
    align: 'end',
    bio: 'I travel around coastal and island communities and focus on local wellness culture.',
    interests: ['Beaches', 'Nature Retreats', 'Cafe Hopping'],
    languages: ['English', 'Thai'],
    homeland: 'Bangkok, Thailand',
    currentlyIn: 'Phuket, Thailand',
    socials: ['instagram.com/sarah.mitchell'],
  },
];
