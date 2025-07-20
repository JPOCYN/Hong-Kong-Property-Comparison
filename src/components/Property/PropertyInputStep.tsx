'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { getSchoolNetByDistrict } from '@/utils/schoolNetMap';
import { loadEstateData, searchEstates, getEstateByName, EstateData, formatPricePerFt, getBuildingAgeNumber } from '@/utils/estateData';
import { useState, useEffect } from 'react';

export default function PropertyInputStep() {
  const { properties, addProperty, updateProperty, removeProperty, language } = useAppStore();
  const t = (key: string) => getTranslation(key, language);
  const [currentProperty, setCurrentProperty] = useState({
    name: '',
    size: 0,
    price: 0,
    rooms: 1,
    toilets: 1,
    buildingAge: 0,
    district: '',
    schoolNet: '',
    carParkIncluded: false,
    carParkPrice: 0,
    managementFee: 0,
  });

  // Estate autocomplete state
  const [estates, setEstates] = useState<EstateData[]>([]);
  const [suggestions, setSuggestions] = useState<EstateData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingEstates, setIsLoadingEstates] = useState(true);

  const handleInputChange = (field: string, value: any) => {
    setCurrentProperty(prev => ({ ...prev, [field]: value }));
  };

  const handleDistrictChange = (district: string) => {
    const schoolNets = getSchoolNetByDistrict(district);
    setCurrentProperty(prev => ({ 
      ...prev, 
      district,
      schoolNet: schoolNets.length > 0 ? schoolNets[0].code : ''
    }));
  };

  const calculateCostPerSqFt = (): number => {
    if (currentProperty.size > 0 && currentProperty.price > 0) {
      return currentProperty.price / currentProperty.size;
    }
    return 0;
  };

  const getManagementFeeSuggestion = (): number => {
    if (currentProperty.size > 0) {
      return Math.round(currentProperty.size * 2.5);
    }
    return 0;
  };

  const isPropertyValid = (): boolean => {
    return currentProperty.name.trim() !== '' && 
           currentProperty.price > 0 && 
           currentProperty.size > 0;
  };

  const handleAddProperty = () => {
    if (isPropertyValid()) {
      addProperty({
        ...currentProperty,
        id: Date.now().toString(),
      });
      setCurrentProperty({
        name: '',
        size: 0,
        price: 0,
        rooms: 1,
        toilets: 1,
        buildingAge: 0,
        district: '',
        schoolNet: '',
        carParkIncluded: false,
        carParkPrice: 0,
        managementFee: 0,
      });
    }
  };

  const costPerSqFt = calculateCostPerSqFt();
  const managementFeeSuggestion = getManagementFeeSuggestion();
  const isExpensive = costPerSqFt > 25000;

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

  // Handle estate name input with autocomplete
  const handleEstateNameChange = (value: string) => {
    setCurrentProperty(prev => ({ ...prev, name: value }));
    
    if (value.trim().length > 0) {
      const results = searchEstates(value, estates);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle estate selection
  const handleEstateSelect = (estate: EstateData) => {
    setCurrentProperty(prev => ({
      ...prev,
      name: estate.name,
      district: estate.district,
      buildingAge: getBuildingAgeNumber(estate.buildingAge),
      schoolNet: estate.schoolNet,
    }));
    setShowSuggestions(false);
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

      {/* Property Form Card */}
      <div className="bg-white shadow-lg rounded-xl p-4 lg:p-6 border border-gray-200">
        {/* Basic Info Section */}
        <div className="mb-4 lg:mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <span className="text-lg lg:text-xl mr-2">🏠</span>
            {t('propertyInput.basicInfoSection')}
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
            {/* Property Name with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('propertyInput.propertyName')} *
              </label>
              <input
                type="text"
                value={currentProperty.name}
                onChange={(e) => handleEstateNameChange(e.target.value)}
                className="input-field"
                placeholder={t('propertyInput.propertyNamePlaceholder')}
                required
                onFocus={() => {
                  if (currentProperty.name.trim().length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow for clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((estate, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEstateSelect(estate)}
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
                  {t('propertyInput.size')} (ft²) *
                </label>
                <input
                  type="number"
                  value={currentProperty.size || ''}
                  onChange={(e) => handleInputChange('size', Number(e.target.value))}
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
                    value={currentProperty.price ? currentProperty.price / 10000 : ''}
                    onChange={(e) => handleInputChange('price', Number(e.target.value) * 10000)}
                    className="input-field pl-8"
                    placeholder="800"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    萬
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
                    {t('propertyInput.costPerSqFt')}: <strong>${costPerSqFt.toLocaleString()}/ft²</strong>
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
          <h3 className="text-sm font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <span className="text-lg lg:text-xl mr-2">📍</span>
            {t('propertyInput.layoutLocationSection')}
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
            {/* Rooms and Toilets - Paired Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.rooms')}
                </label>
                <select
                  value={currentProperty.rooms}
                  onChange={(e) => handleInputChange('rooms', Number(e.target.value))}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {t('propertyInput.room')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.toilets')}
                </label>
                <select
                  value={currentProperty.toilets}
                  onChange={(e) => handleInputChange('toilets', Number(e.target.value))}
                  className="input-field"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>
                      {num} {t('propertyInput.toilet')}
                    </option>
                  ))}
                </select>
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
                  value={currentProperty.buildingAge || ''}
                  onChange={(e) => handleInputChange('buildingAge', Number(e.target.value))}
                  className="input-field"
                  placeholder="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.district')}
                </label>
                <select
                  value={currentProperty.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('propertyInput.selectDistrict')}</option>
                  <option value="中西區">中西區</option>
                  <option value="灣仔">灣仔</option>
                  <option value="東區">東區</option>
                  <option value="南區">南區</option>
                  <option value="油尖旺">油尖旺</option>
                  <option value="深水埗">深水埗</option>
                  <option value="九龍城">九龍城</option>
                  <option value="黃大仙">黃大仙</option>
                  <option value="觀塘">觀塘</option>
                  <option value="葵青">葵青</option>
                  <option value="荃灣">荃灣</option>
                  <option value="屯門">屯門</option>
                  <option value="元朗">元朗</option>
                  <option value="北區">北區</option>
                  <option value="大埔">大埔</option>
                  <option value="西貢">西貢</option>
                  <option value="沙田">沙田</option>
                  <option value="離島">離島</option>
                </select>
              </div>
            </div>

            {/* School Net - Auto-filled */}
            {currentProperty.schoolNet && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-green-700">
                    <strong>{t('propertyInput.schoolNet')}:</strong> {currentProperty.schoolNet}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Extras & Fees Section */}
        <div className="border-t border-gray-200 pt-4 lg:pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <span className="text-lg lg:text-xl mr-2">💰</span>
            {t('propertyInput.extrasFeesSection')}
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
            {/* Car Park Toggle */}
            <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={currentProperty.carParkIncluded}
                onChange={(e) => handleInputChange('carParkIncluded', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {t('propertyInput.hasCarPark')}
                  </span>
                  <span className="text-gray-400 cursor-help" title={t('propertyInput.carParkTooltip')}>
                    ℹ️
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('propertyInput.carParkHelp')}
                </p>
              </div>
            </label>

            {/* Car Park Price - Conditional */}
            {currentProperty.carParkIncluded && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.carParkPrice')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentProperty.carParkPrice || ''}
                    onChange={(e) => handleInputChange('carParkPrice', Number(e.target.value))}
                    className="input-field pl-8"
                    placeholder="500000"
                  />
                </div>
              </div>
            )}

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
                    value={currentProperty.managementFee || ''}
                    onChange={(e) => handleInputChange('managementFee', Number(e.target.value))}
                    className="input-field pl-8"
                    placeholder="1250"
                  />
                </div>
                {managementFeeSuggestion > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('propertyInput.managementFeeSuggestion')}: ${managementFeeSuggestion.toLocaleString()}/month
                  </p>
                )}
                {currentProperty.managementFee === 0 && (
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
                  value={currentProperty.schoolNet}
                  onChange={(e) => handleInputChange('schoolNet', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 11, 34, 91"
                  disabled={!!getSchoolNetByDistrict(currentProperty.district)}
                />
                {getSchoolNetByDistrict(currentProperty.district) && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {t('propertyInput.autoFilled')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Property Button */}
        <div className="mt-6 lg:mt-8 flex justify-end">
          <button
            onClick={handleAddProperty}
            disabled={!isPropertyValid()}
            className="btn-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('propertyInput.addProperty')}
          </button>
        </div>
      </div>

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
                    <span>${(property.price / 10000).toFixed(0)}萬</span>
                    <span>{property.size} ft²</span>
                    <span>{property.rooms}R {property.toilets}T</span>
                    {property.district && <span>{property.district}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeProperty(property.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  🗑️ {t('common.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 