export interface EstateData {
  name: string;
  address: string;
  district: string;
  region: string;
  buildingAge: string;
  schoolNet: string;
  pricePerFt: string;
}

let estateData: EstateData[] = [];

// Load estate data from JSON file
export const loadEstateData = async (): Promise<EstateData[]> => {
  if (estateData.length > 0) {
    return estateData;
  }

  try {
    const response = await fetch('/estateData.json');
    if (!response.ok) {
      throw new Error('Failed to load estate data');
    }
    estateData = await response.json();
    return estateData;
  } catch (error) {
    console.error('Error loading estate data:', error);
    return [];
  }
};

// Fuzzy search function for estate names
export const searchEstates = (query: string, estates: EstateData[]): EstateData[] => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase();
  
  return estates
    .filter(estate => {
      const name = estate.name.toLowerCase();
      const address = estate.address.toLowerCase();
      const district = estate.district.toLowerCase();
      
      // Check if query matches estate name, address, or district
      return name.includes(searchTerm) || 
             address.includes(searchTerm) || 
             district.includes(searchTerm);
    })
    .sort((a, b) => {
      // Prioritize exact matches in estate name
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      const aExactMatch = aName === searchTerm;
      const bExactMatch = bName === searchTerm;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Then prioritize matches that start with the search term
      const aStartsWith = aName.startsWith(searchTerm);
      const bStartsWith = bName.startsWith(searchTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Finally, sort by name length (shorter names first)
      return aName.length - bName.length;
    })
    .slice(0, 8); // Limit to 8 results
};

// Get estate by name
export const getEstateByName = (name: string, estates: EstateData[]): EstateData | undefined => {
  return estates.find(estate => estate.name === name);
};

// Format price per ft for display
export const formatPricePerFt = (pricePerFt: string): string => {
  return pricePerFt.replace('$', '').replace(',', '');
};

// Get numeric building age
export const getBuildingAgeNumber = (buildingAge: string): number => {
  return parseInt(buildingAge) || 0;
}; 