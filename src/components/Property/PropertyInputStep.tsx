'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
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
  const { properties, addProperty, updateProperty, removeProperty, language, editingPropertyId, setEditingProperty, setCurrentStep } = useAppStore();
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
    setPropertyForms(prev => prev.map((form, index) => 
      index === formIndex ? {
        ...form,
        district
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🚗 {t('propertyInput.parkingSection')}
                </label>
                <select
                  value={form.parkingType}
                  onChange={(e) => handleInputChange(formIndex, 'parkingType', e.target.value as 'none' | 'included' | 'additional')}
                  className="input-field"
                >
                  <option value="none">❌ {t('propertyInput.parkingNone')}</option>
                  <option value="included">✅ {t('propertyInput.parkingIncluded')}</option>
                  <option value="additional">💰 {t('propertyInput.parkingAdditional')}</option>
                </select>
              </div>
              
              {/* Additional Parking Price - Conditional */}
              {form.parkingType === 'additional' && (
                <div>
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
                    每呎管理費（平均）：HK$2.7
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
                  {t('propertyInput.schoolNet')} ({t('propertyInput.optional')})
                </label>
                <input
                  type="text"
                  value={form.schoolNet}
                  onChange={(e) => handleInputChange(formIndex, 'schoolNet', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 11, 34, 91"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 {t('propertyInput.schoolNetHelp')}
                </p>
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

      {/* Added Properties Section - Moved to Top */}
      {properties.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                {properties.length}
              </span>
              {t('propertyInput.addedProperties')} ({properties.length}/5)
            </h3>
            {properties.length >= 2 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="btn-primary text-sm px-4 py-2"
              >
                🚀 {t('actions.compareNow')}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.map((property, index) => (
              <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{property.name}</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>總價:</span>
                        <span className="font-medium">${(property.price / 10000).toFixed(0)}{t('common.tenThousand')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>面積:</span>
                        <span className="font-medium">{property.size} {t('common.ft2')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>房間:</span>
                        <span className="font-medium">{property.rooms}R {property.toilets}T</span>
                      </div>
                      {property.district && (
                        <div className="flex justify-between">
                          <span>地區:</span>
                          <span className="font-medium">{property.district}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingProperty(property.id);
                        // Scroll to the first form
                        const firstForm = document.querySelector('[data-form-index="0"]');
                        if (firstForm) {
                          firstForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('actions.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeProperty(property.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title={t('propertyInput.remove')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">#{index + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    index === 0 ? 'bg-green-100 text-green-800' :
                    index === 1 ? 'bg-blue-100 text-blue-800' :
                    index === 2 ? 'bg-purple-100 text-purple-800' :
                    index === 3 ? 'bg-orange-100 text-orange-800' :
                    index === 4 ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {index === 0 ? '🏆 最佳' : 
                     index === 1 ? '🥈 次選' : 
                     index === 2 ? '🥉 第三' : 
                     index === 3 ? '4️⃣ 第四' :
                     index === 4 ? '5️⃣ 第五' :
                     `#${index + 1}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Input Forms */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('propertyInput.addNewProperty')}
          </h3>
          {properties.length < 5 ? (
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
              className="btn-secondary text-sm"
            >
              + {t('propertyInput.addProperty')}
            </button>
          ) : (
            <span className="text-sm text-gray-500">
              ✅ 已達上限 (5個物業)
            </span>
          )}
        </div>

        {/* 2-Column Property Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {propertyForms.map((_, index) => renderPropertyForm(index))}
        </div>
      </div>
    </div>
  );
} 