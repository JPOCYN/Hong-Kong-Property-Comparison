'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { getSchoolNetByDistrict } from '@/utils/schoolNetMap';
import { loadEstateData, searchEstates, getEstateByName, EstateData, formatPricePerFt, getBuildingAgeNumber } from '@/utils/estateData';
import { useState, useEffect } from 'react';

interface PropertyFormData {
  name: string;
  size: number;
  price: number;
  rooms: number;
  toilets: number;
  buildingAge: number;
  district: string;
  schoolNet: string;
  parkingType: 'none' | 'included' | 'additional';
  carParkIncluded: boolean;
  carParkPrice: number;
  managementFee: number;
}

export default function PropertyInputStep() {
  const { properties, addProperty, updateProperty, removeProperty, language, editingPropertyId, setEditingProperty } = useAppStore();
  const t = (key: string) => getTranslation(key, language);
  
  // Property form data for both columns
  const [propertyForms, setPropertyForms] = useState<PropertyFormData[]>([
    {
      name: '',
      size: 0,
      price: 0,
      rooms: 1,
      toilets: 1,
      buildingAge: 0,
      district: '',
      schoolNet: '',
      parkingType: 'none',
      carParkIncluded: false,
      carParkPrice: 0,
      managementFee: 0,
    },
    {
      name: '',
      size: 0,
      price: 0,
      rooms: 1,
      toilets: 1,
      buildingAge: 0,
      district: '',
      schoolNet: '',
      parkingType: 'none',
      carParkIncluded: false,
      carParkPrice: 0,
      managementFee: 0,
    }
  ]);

  // Estate autocomplete state
  const [estates, setEstates] = useState<EstateData[]>([]);
  const [suggestions, setSuggestions] = useState<EstateData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [isLoadingEstates, setIsLoadingEstates] = useState(true);

  // District autocomplete state
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);
  const [activeDistrictSuggestionIndex, setActiveDistrictSuggestionIndex] = useState<number>(-1);

  // Collapsible state for mobile UX
  const [collapsedForms, setCollapsedForms] = useState<Set<number>>(new Set());

  // Hong Kong districts
  const hkDistricts = [
    '中西區', '灣仔', '東區', '南區',
    '油尖旺', '深水埗', '九龍城', '黃大仙', '觀塘',
    '葵青', '荃灣', '屯門', '元朗', '北區', '大埔', '西貢', '沙田', '離島'
  ];

  const handleInputChange = (formIndex: number, field: string, value: any) => {
    setPropertyForms(prev => prev.map((form, index) => {
      if (index === formIndex) {
        const updatedForm = { ...form, [field]: value };
        
        // Sync parkingType with carParkIncluded
        if (field === 'parkingType') {
          updatedForm.carParkIncluded = value === 'included';
          if (value !== 'additional') {
            updatedForm.carParkPrice = 0;
          }
        }
        
        return updatedForm;
      }
      return form;
    }));
  };

  const handleDistrictChange = (formIndex: number, district: string) => {
    const schoolNets = getSchoolNetByDistrict(district);
    setPropertyForms(prev => prev.map((form, index) => 
      index === formIndex ? {
        ...form,
        district,
        schoolNet: schoolNets.length > 0 ? schoolNets[0].code : ''
      } : form
    ));
  };

  const calculateCostPerSqFt = (form: PropertyFormData): number => {
    if (form.size > 0 && form.price > 0) {
      return form.price / form.size;
    }
    return 0;
  };

  const getManagementFeeSuggestion = (form: PropertyFormData): number => {
    if (form.size > 0) {
      return Math.round(form.size * 2.5);
    }
    return 0;
  };

  const isPropertyValid = (form: PropertyFormData): boolean => {
    return form.name.trim() !== '' && 
           form.price > 0 && 
           form.size > 0;
  };

  const handleAddProperty = (formIndex: number) => {
    const form = propertyForms[formIndex];
    if (isPropertyValid(form)) {
      if (editingPropertyId) {
        // Update existing property
        updateProperty(editingPropertyId, {
          ...form,
          carParkIncluded: form.parkingType === 'included',
        });
        setEditingProperty(null); // Clear editing state
      } else {
        // Add new property
        addProperty({
          ...form,
          id: Date.now().toString() + formIndex,
          carParkIncluded: form.parkingType === 'included',
        });
      }
      
      // Reset the form and collapse it on mobile
      setPropertyForms(prev => prev.map((f, index) => 
        index === formIndex ? {
          name: '',
          size: 0,
          price: 0,
          rooms: 1,
          toilets: 1,
          buildingAge: 0,
          district: '',
          schoolNet: '',
          parkingType: 'none',
          carParkIncluded: false,
          carParkPrice: 0,
          managementFee: 0,
        } : f
      ));
      // Collapse the form after adding property (mobile UX)
      setCollapsedForms(prev => new Set(Array.from(prev).concat([formIndex])));
    }
  };

  // Load estate data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingEstates(true);
      const estateData = await loadEstateData();
      setEstates(estateData);
      setIsLoadingEstates(false);
    };
    loadData();
  }, []);

  // Handle editing property
  useEffect(() => {
    if (editingPropertyId) {
      const editingProperty = properties.find(p => p.id === editingPropertyId);
      if (editingProperty) {
        // Load the editing property data into the first form
        setPropertyForms(prev => prev.map((form, index) => 
          index === 0 ? {
            name: editingProperty.name,
            size: editingProperty.size,
            price: editingProperty.price,
            rooms: editingProperty.rooms,
            toilets: editingProperty.toilets,
            buildingAge: editingProperty.buildingAge,
            district: editingProperty.district,
            schoolNet: editingProperty.schoolNet || '',
            parkingType: editingProperty.carParkIncluded ? 'included' : (editingProperty.carParkPrice > 0 ? 'additional' : 'none'),
            carParkIncluded: editingProperty.carParkIncluded,
            carParkPrice: editingProperty.carParkPrice,
            managementFee: editingProperty.managementFee,
          } : form
        ));
        
        // Expand the first form when editing
        setCollapsedForms(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(0); // Ensure first form is expanded
          return newSet;
        });
      }
    }
  }, [editingPropertyId, properties]);

  // Handle estate name input with autocomplete
  const handleEstateNameChange = (formIndex: number, value: string) => {
    handleInputChange(formIndex, 'name', value);
    
    if (value.trim().length > 0) {
      const results = searchEstates(value, estates);
      setSuggestions(results);
      setShowSuggestions(true);
      setActiveSuggestionIndex(formIndex);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle estate selection
  const handleEstateSelect = (formIndex: number, estate: EstateData) => {
    setPropertyForms(prev => prev.map((form, index) => 
      index === formIndex ? {
        ...form,
        name: estate.name,
        district: estate.district,
        buildingAge: getBuildingAgeNumber(estate.buildingAge),
        schoolNet: estate.schoolNet,
      } : form
    ));
    setShowSuggestions(false);
  };

  // Handle district input with autocomplete
  const handleDistrictInputChange = (formIndex: number, value: string) => {
    handleInputChange(formIndex, 'district', value);
    
    if (value.trim().length > 0) {
      const filtered = hkDistricts.filter(district => 
        district.toLowerCase().includes(value.toLowerCase())
      );
      setDistrictSuggestions(filtered);
      setShowDistrictSuggestions(true);
      setActiveDistrictSuggestionIndex(formIndex);
    } else {
      setDistrictSuggestions([]);
      setShowDistrictSuggestions(false);
    }
  };

  // Handle district selection
  const handleDistrictSelect = (formIndex: number, district: string) => {
    handleDistrictChange(formIndex, district);
    setShowDistrictSuggestions(false);
  };

  // Toggle collapsed state
  const toggleCollapsed = (formIndex: number) => {
    setCollapsedForms(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(formIndex)) {
        newSet.delete(formIndex);
      } else {
        newSet.add(formIndex);
      }
      return newSet;
    });
  };

  const renderPropertyForm = (formIndex: number) => {
    const form = propertyForms[formIndex];
    const costPerSqFt = calculateCostPerSqFt(form);
    const managementFeeSuggestion = getManagementFeeSuggestion(form);
    const isExpensive = costPerSqFt > 25000;

    const isCollapsed = collapsedForms.has(formIndex);
    const hasData = form.name || form.size > 0 || form.price > 0;

    return (
      <div key={formIndex} data-form-index={formIndex} className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        {/* Header - Always visible */}
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingPropertyId && formIndex === 0 ? (
                <span className="flex items-center">
                  <span className="text-blue-600 mr-2">✏️</span>
                  {t('actions.edit')} {t('propertyInput.propertyName')}
                </span>
              ) : (
                `${t('propertyInput.propertyName')} ${formIndex + 1}`
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {/* Show summary if form has data */}
              {hasData && (
                <div className="text-sm text-gray-600 hidden sm:block">
                  {form.name && <span className="mr-2">{form.name}</span>}
                  {form.price > 0 && <span className="mr-2">${(form.price / 10000).toFixed(0)}{t('common.tenThousand')}</span>}
                  {form.size > 0 && <span>{form.size} {t('common.ft2')}</span>}
                </div>
              )}
              {/* Collapse/Expand button */}
              <button
                onClick={() => toggleCollapsed(formIndex)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={isCollapsed ? 'Expand form' : 'Collapse form'}
              >
                <svg 
                  className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
          <div className="p-4 lg:p-6">

        {/* Basic Info Section */}
        <div className="mb-4 lg:mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">🏠</span>
            {t('propertyInput.basicInfoSection')}
          </h4>
          
          <div className="space-y-3 lg:space-y-4">
            {/* Property Name with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('propertyInput.propertyName')} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleEstateNameChange(formIndex, e.target.value)}
                className="input-field"
                placeholder={t('propertyInput.propertyNamePlaceholder')}
                required
                onFocus={() => {
                  if (form.name.trim().length > 0) {
                    setShowSuggestions(true);
                    setActiveSuggestionIndex(formIndex);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && activeSuggestionIndex === formIndex && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((estate, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEstateSelect(formIndex, estate)}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{estate.name}</div>
                          <div className="text-sm text-gray-500">{estate.address}</div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          <div>{estate.district}</div>
                          <div>{estate.pricePerFt}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoadingEstates && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>

            {/* Size and Price - Paired Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.size')} ({t('common.ft2')}) *
                </label>
                <input
                  type="number"
                  value={form.size || ''}
                  onChange={(e) => handleInputChange(formIndex, 'size', Number(e.target.value))}
                  className="input-field"
                  placeholder="500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.price')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={form.price ? form.price / 10000 : ''}
                    onChange={(e) => handleInputChange(formIndex, 'price', Number(e.target.value) * 10000)}
                    className="input-field pl-8"
                    placeholder="800"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {t('common.tenThousand')}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost per ft² Feedback */}
            {costPerSqFt > 0 && (
              <div className={`p-3 rounded-lg text-sm ${
                isExpensive 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                <div className="flex items-center space-x-2">
                  <span>👉</span>
                  <span>
                    {t('propertyInput.costPerSqFt')}: <strong>${costPerSqFt.toLocaleString()}/{t('common.ft2')}</strong>
                    {isExpensive && (
                      <span className="ml-2 text-red-600">
                        {t('propertyInput.expensiveWarning')}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layout & Location Section */}
        <div className="mb-4 lg:mb-6 border-t border-gray-200 pt-4 lg:pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📍</span>
            {t('propertyInput.layoutLocationSection')}
          </h4>
          
          <div className="space-y-3 lg:space-y-4">
            {/* Rooms and Toilets - Paired Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.rooms')}
                </label>
                <input
                  type="number"
                  value={form.rooms || ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      handleInputChange(formIndex, 'rooms', 1);
                    } else {
                      const numValue = parseInt(inputValue);
                      if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
                        handleInputChange(formIndex, 'rooms', numValue);
                      }
                    }
                  }}
                  className="input-field"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('propertyInput.roomsHint')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.toilets')}
                </label>
                <input
                  type="number"
                  value={form.toilets || ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      handleInputChange(formIndex, 'toilets', 1);
                    } else {
                      const numValue = parseInt(inputValue);
                      if (!isNaN(numValue) && numValue >= 1 && numValue <= 8) {
                        handleInputChange(formIndex, 'toilets', numValue);
                      }
                    }
                  }}
                  className="input-field"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('propertyInput.toiletsHint')}
                </p>
              </div>
            </div>

            {/* Building Age and District - Paired Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.buildingAge')} ({t('propertyInput.years')})
                </label>
                <input
                  type="number"
                  value={form.buildingAge || ''}
                  onChange={(e) => handleInputChange(formIndex, 'buildingAge', Number(e.target.value))}
                  className="input-field"
                  placeholder="10"
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.district')}
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => handleDistrictInputChange(formIndex, e.target.value)}
                  className="input-field"
                  placeholder={t('propertyInput.districtPlaceholder')}
                />
                
                {/* District Suggestions */}
                {showDistrictSuggestions && districtSuggestions.length > 0 && activeDistrictSuggestionIndex === formIndex && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {districtSuggestions.map((district, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDistrictSelect(formIndex, district)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* School Net - Auto-filled */}
            {form.schoolNet && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-green-700">
                    <strong>{t('propertyInput.schoolNet')}:</strong> {form.schoolNet}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Extras & Fees Section */}
        <div className="border-t border-gray-200 pt-4 lg:pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">💰</span>
            {t('propertyInput.extrasFeesSection')}
          </h4>
          
          <div className="space-y-3 lg:space-y-4">
            {/* Parking Section */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">🚗</span>
                {t('propertyInput.parkingSection')}
              </h5>
              
              {/* Parking Type Radio Group */}
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  form.parkingType === 'none' 
                    ? 'border-gray-400 bg-gray-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name={`parking-${formIndex}`}
                    checked={form.parkingType === 'none'}
                    onChange={() => handleInputChange(formIndex, 'parkingType', 'none')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">❌</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{t('propertyInput.parkingNone')}</span>
                      <p className="text-xs text-gray-500 mt-1">{t('propertyInput.parkingNoneDesc')}</p>
                    </div>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  form.parkingType === 'included' 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name={`parking-${formIndex}`}
                    checked={form.parkingType === 'included'}
                    onChange={() => handleInputChange(formIndex, 'parkingType', 'included')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✅</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{t('propertyInput.parkingIncluded')}</span>
                      <p className="text-xs text-gray-500 mt-1">{t('propertyInput.parkingIncludedDesc')}</p>
                    </div>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  form.parkingType === 'additional' 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name={`parking-${formIndex}`}
                    checked={form.parkingType === 'additional'}
                    onChange={() => handleInputChange(formIndex, 'parkingType', 'additional')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{t('propertyInput.parkingAdditional')}</span>
                      <p className="text-xs text-gray-500 mt-1">{t('propertyInput.parkingAdditionalDesc')}</p>
                    </div>
                  </div>
                </label>
              </div>
              
              {/* Additional Parking Price - Conditional */}
              {form.parkingType === 'additional' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('propertyInput.additionalParkingPrice')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={form.carParkPrice || ''}
                      onChange={(e) => handleInputChange(formIndex, 'carParkPrice', Number(e.target.value))}
                      className="input-field pl-8"
                      placeholder="e.g. 500,000"
                    />
                  </div>
                </div>
              )}
              
              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-3 px-2">
                💡 {t('propertyInput.parkingHelp')}
              </p>
            </div>

            {/* Management Fee and School Net - Paired Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.managementFee')} ({t('propertyInput.perMonth')})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={form.managementFee || ''}
                    onChange={(e) => handleInputChange(formIndex, 'managementFee', Number(e.target.value))}
                    className="input-field pl-8"
                    placeholder="1250"
                  />
                </div>
                {managementFeeSuggestion > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('propertyInput.managementFeeSuggestion')}: ${managementFeeSuggestion.toLocaleString()}/month
                  </p>
                )}
                {form.managementFee === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ {t('propertyInput.managementFeeWarning')}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.schoolNet')}
                </label>
                <input
                  type="text"
                  value={form.schoolNet}
                  onChange={(e) => handleInputChange(formIndex, 'schoolNet', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 11, 34, 91"
                  disabled={!!getSchoolNetByDistrict(form.district)}
                />
                {getSchoolNetByDistrict(form.district) && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {t('propertyInput.autoFilled')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Property Button */}
        <div className="mt-6 lg:mt-8 flex justify-end space-x-3">
          {editingPropertyId && formIndex === 0 && (
            <button
              onClick={() => {
                setEditingProperty(null);
                // Reset the first form
                setPropertyForms(prev => prev.map((form, index) => 
                  index === 0 ? {
                    name: '',
                    size: 0,
                    price: 0,
                    rooms: 1,
                    toilets: 1,
                    buildingAge: 0,
                    district: '',
                    schoolNet: '',
                    parkingType: 'none',
                    carParkIncluded: false,
                    carParkPrice: 0,
                    managementFee: 0,
                  } : form
                ));
              }}
              className="btn-secondary"
            >
              {t('actions.cancel')}
            </button>
          )}
          <button
            onClick={() => handleAddProperty(formIndex)}
            disabled={!isPropertyValid(form)}
            className="btn-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingPropertyId && formIndex === 0 ? t('actions.updateProperty') : t('propertyInput.addProperty')}
          </button>
        </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          {t('propertyInput.stepTitle')}
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          {t('propertyInput.stepDescription')}
        </p>
      </div>

      {/* 2-Column Property Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {propertyForms.map((_, index) => renderPropertyForm(index))}
      </div>

      {/* Add 3rd Property Button */}
      {properties.length < 3 && (
        <div className="text-center">
          <button
            onClick={() => {
              setPropertyForms(prev => [...prev, {
                name: '',
                size: 0,
                price: 0,
                rooms: 1,
                toilets: 1,
                buildingAge: 0,
                district: '',
                schoolNet: '',
                parkingType: 'none',
                carParkIncluded: false,
                carParkPrice: 0,
                managementFee: 0,
              }]);
            }}
            className="btn-secondary"
          >
            + {t('propertyInput.addProperty')} 3
          </button>
        </div>
      )}

      {/* Properties List */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('propertyInput.addedProperties')} ({properties.length}/3)
          </h3>
          
          {properties.map((property, index) => (
            <div key={property.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{property.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>${(property.price / 10000).toFixed(0)}{t('common.tenThousand')}</span>
                                          <span>{property.size} {t('common.ft2')}</span>
                      <span>{property.rooms}R {property.toilets}T</span>
                    {property.district && <span>{property.district}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProperty(property.id);
                      // Scroll to the first form
                      const firstForm = document.querySelector('[data-form-index="0"]');
                      if (firstForm) {
                        firstForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{t('actions.edit')}</span>
                  </button>
                  <button
                    onClick={() => removeProperty(property.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{t('propertyInput.remove')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 