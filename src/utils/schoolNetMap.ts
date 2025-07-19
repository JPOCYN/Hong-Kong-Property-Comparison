export interface SchoolNetInfo {
  code: string;
  name: string;
  description?: string;
}

export const schoolNetMap: Record<string, SchoolNetInfo[]> = {
  // Hong Kong Island
  '中西區': [
    { code: '11', name: '中西區', description: 'Central and Western District' },
    { code: '12', name: '灣仔區', description: 'Wan Chai District' }
  ],
  '灣仔區': [
    { code: '12', name: '灣仔區', description: 'Wan Chai District' }
  ],
  '東區': [
    { code: '14', name: '東區', description: 'Eastern District' },
    { code: '16', name: '南區', description: 'Southern District' }
  ],
  '南區': [
    { code: '16', name: '南區', description: 'Southern District' },
    { code: '18', name: '離島區', description: 'Islands District' }
  ],
  
  // Kowloon
  '油尖旺區': [
    { code: '31', name: '油尖旺區', description: 'Yau Tsim Mong District' }
  ],
  '深水埗區': [
    { code: '32', name: '深水埗區', description: 'Sham Shui Po District' }
  ],
  '九龍城區': [
    { code: '34', name: '九龍城區', description: 'Kowloon City District' }
  ],
  '黃大仙區': [
    { code: '35', name: '黃大仙區', description: 'Wong Tai Sin District' }
  ],
  '觀塘區': [
    { code: '36', name: '觀塘區', description: 'Kwun Tong District' }
  ],
  
  // New Territories
  '荃灣區': [
    { code: '40', name: '荃灣區', description: 'Tsuen Wan District' }
  ],
  '屯門區': [
    { code: '41', name: '屯門區', description: 'Tuen Mun District' }
  ],
  '元朗區': [
    { code: '42', name: '元朗區', description: 'Yuen Long District' }
  ],
  '北區': [
    { code: '43', name: '北區', description: 'North District' }
  ],
  '大埔區': [
    { code: '44', name: '大埔區', description: 'Tai Po District' }
  ],
  '西貢區': [
    { code: '45', name: '西貢區', description: 'Sai Kung District' }
  ],
  '沙田區': [
    { code: '46', name: '沙田區', description: 'Sha Tin District' }
  ],
  '葵青區': [
    { code: '47', name: '葵青區', description: 'Kwai Tsing District' }
  ],
  '離島區': [
    { code: '48', name: '離島區', description: 'Islands District' }
  ],
  
  // Common English names
  'Central': [
    { code: '11', name: '中西區', description: 'Central and Western District' }
  ],
  'Wan Chai': [
    { code: '12', name: '灣仔區', description: 'Wan Chai District' }
  ],
  'Eastern': [
    { code: '14', name: '東區', description: 'Eastern District' }
  ],
  'Southern': [
    { code: '16', name: '南區', description: 'Southern District' }
  ],
  'Yau Tsim Mong': [
    { code: '31', name: '油尖旺區', description: 'Yau Tsim Mong District' }
  ],
  'Sham Shui Po': [
    { code: '32', name: '深水埗區', description: 'Sham Shui Po District' }
  ],
  'Kowloon City': [
    { code: '34', name: '九龍城區', description: 'Kowloon City District' }
  ],
  'Wong Tai Sin': [
    { code: '35', name: '黃大仙區', description: 'Wong Tai Sin District' }
  ],
  'Kwun Tong': [
    { code: '36', name: '觀塘區', description: 'Kwun Tong District' }
  ],
  'Tsuen Wan': [
    { code: '40', name: '荃灣區', description: 'Tsuen Wan District' }
  ],
  'Tuen Mun': [
    { code: '41', name: '屯門區', description: 'Tuen Mun District' }
  ],
  'Yuen Long': [
    { code: '42', name: '元朗區', description: 'Yuen Long District' }
  ],
  'North': [
    { code: '43', name: '北區', description: 'North District' }
  ],
  'Tai Po': [
    { code: '44', name: '大埔區', description: 'Tai Po District' }
  ],
  'Sai Kung': [
    { code: '45', name: '西貢區', description: 'Sai Kung District' }
  ],
  'Sha Tin': [
    { code: '46', name: '沙田區', description: 'Sha Tin District' }
  ],
  'Kwai Tsing': [
    { code: '47', name: '葵青區', description: 'Kwai Tsing District' }
  ],
  'Islands': [
    { code: '48', name: '離島區', description: 'Islands District' }
  ],
};

export const getSchoolNetByDistrict = (district: string): SchoolNetInfo[] => {
  return schoolNetMap[district] || [];
};

export const getAllDistricts = (): string[] => {
  return Object.keys(schoolNetMap);
};

export const getDistrictSuggestions = (input: string): string[] => {
  const districts = getAllDistricts();
  const lowerInput = input.toLowerCase();
  
  return districts.filter(district => 
    district.toLowerCase().includes(lowerInput) ||
    district.toLowerCase().replace(/[區]/g, '').includes(lowerInput)
  );
}; 