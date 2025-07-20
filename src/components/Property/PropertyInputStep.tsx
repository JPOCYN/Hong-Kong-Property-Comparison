'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { loadEstateData, searchEstates, EstateData, getBuildingAgeNumber } from '@/utils/estateData';
import { getSchoolNetByDistrict, getAllDistricts } from '@/utils/schoolNetMap';

interface PropertyFormData {
  name: string;
  size: number;
  price: number;
  rooms: number;
  toilets: number;
  buildingAge: number;
  district: string;
  schoolNets: string[];
  parkingType: 'none' | 'included' | 'additional';
  carParkIncluded: boolean;
  carParkPrice: number;
  managementFee: number;
}

interface PropertyPanel {
  id: string;
  form: PropertyFormData;
  isExpanded: boolean;
  isEditing: boolean;
}

export default function PropertyInputStep() {
  const { 
    language, 
    properties, 
    addProperty, 
    updateProperty, 
    removeProperty,
    editingPropertyId,
    setEditingProperty
  } = useAppStore();
  
  const t = (key: string) => getTranslation(key, language);

  // State for accordion panels
  const [panels, setPanels] = useState<PropertyPanel[]>([
    {
      id: 'panel-1',
      form: {
        name: '',
        size: 0,
        price: 0,
        rooms: 1,
        toilets: 1,
        buildingAge: 0,
        district: '',
        schoolNets: [],
        parkingType: 'none',
        carParkIncluded: false,
        carParkPrice: 0,
        managementFee: 0,
      },
      isExpanded: true,
      isEditing: false,
    }
  ]);

  // Estate data for autocomplete
  const [estates, setEstates] = useState<EstateData[]>([]);
  const [isLoadingEstates, setIsLoadingEstates] = useState(false);
  const [suggestions, setSuggestions] = useState<EstateData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

  // District autocomplete
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);
  const [activeDistrictSuggestionIndex, setActiveDistrictSuggestionIndex] = useState<number | null>(null);

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
        // Find the panel to edit or create a new one
        const panelIndex = panels.findIndex(p => p.id === editingPropertyId);
        if (panelIndex >= 0) {
          // Update existing panel
          setPanels(prev => prev.map((panel, index) => 
            index === panelIndex ? {
              ...panel,
              form: {
                name: editingProperty.name,
                size: editingProperty.size,
                price: editingProperty.price,
                rooms: editingProperty.rooms,
                toilets: editingProperty.toilets,
                buildingAge: editingProperty.buildingAge,
                district: editingProperty.district,
                schoolNets: editingProperty.schoolNets ? editingProperty.schoolNets : (editingProperty.schoolNet ? editingProperty.schoolNet.split(', ').filter(Boolean) : []),
                parkingType: editingProperty.carParkIncluded ? 'included' : (editingProperty.carParkPrice > 0 ? 'additional' : 'none'),
                carParkIncluded: editingProperty.carParkIncluded,
                carParkPrice: editingProperty.carParkPrice,
                managementFee: editingProperty.managementFee,
              },
              isExpanded: true,
              isEditing: true,
            } : panel
          ));
        } else {
          // Add new panel for editing
          setPanels(prev => [...prev, {
            id: editingPropertyId,
            form: {
              name: editingProperty.name,
              size: editingProperty.size,
              price: editingProperty.price,
              rooms: editingProperty.rooms,
              toilets: editingProperty.toilets,
              buildingAge: editingProperty.buildingAge,
              district: editingProperty.district,
                              schoolNets: editingProperty.schoolNets ? editingProperty.schoolNets : (editingProperty.schoolNet ? editingProperty.schoolNet.split(', ').filter(Boolean) : []),
              parkingType: editingProperty.carParkIncluded ? 'included' : (editingProperty.carParkPrice > 0 ? 'additional' : 'none'),
              carParkIncluded: editingProperty.carParkIncluded,
              carParkPrice: editingProperty.carParkPrice,
              managementFee: editingProperty.managementFee,
            },
            isExpanded: true,
            isEditing: true,
          }]);
        }
      }
    }
  }, [editingPropertyId, properties]);

  const handleInputChange = (panelIndex: number, field: string, value: any) => {
    setPanels(prev => prev.map((panel, index) => {
      if (index === panelIndex) {
        const updatedForm = { ...panel.form, [field]: value };
        
        // Sync parkingType with carParkIncluded
        if (field === 'parkingType') {
          updatedForm.carParkIncluded = value === 'included';
          if (value !== 'additional') {
            updatedForm.carParkPrice = 0;
          }
        }
        
        return { ...panel, form: updatedForm };
      }
      return panel;
    }));
  };

  const handleDistrictChange = (panelIndex: number, district: string) => {
    const schoolNetInfo = getSchoolNetByDistrict(district);
    const schoolNets = schoolNetInfo.map(net => net.code);
    setPanels(prev => prev.map((panel, index) => 
      index === panelIndex ? {
        ...panel,
        form: {
          ...panel.form,
          district,
          schoolNets: schoolNets || panel.form.schoolNets,
        }
      } : panel
    ));
  };

  const calculateCostPerSqFt = (form: PropertyFormData): number => {
    if (form.size <= 0) return 0;
    return form.price / form.size;
  };

  const getManagementFeeSuggestion = (form: PropertyFormData): number => {
    if (form.size <= 0) return 0;
    return form.size * 2.5; // $2.5 per sq ft
  };

  const isPropertyValid = (form: PropertyFormData): boolean => {
    return form.name.trim() !== '' && form.size > 0 && form.price > 0 && form.schoolNets.length > 0;
  };

  const handleAddProperty = (panelIndex: number) => {
    const panel = panels[panelIndex];
    const form = panel.form;
    
    if (!isPropertyValid(form)) return;

          if (panel.isEditing) {
        // Update existing property
        updateProperty(panel.id, {
          ...form,
          carParkIncluded: form.parkingType === 'included',
          schoolNet: form.schoolNets.join(', '), // For backward compatibility
          schoolNets: form.schoolNets, // New format
        });
        setEditingProperty(null);
        
        // Remove the editing panel
        setPanels(prev => prev.filter((_, index) => index !== panelIndex));
      } else {
        // Add new property
        const newPropertyId = Date.now().toString() + panelIndex;
        addProperty({
          ...form,
          id: newPropertyId,
          carParkIncluded: form.parkingType === 'included',
          schoolNet: form.schoolNets.join(', '), // For backward compatibility
          schoolNets: form.schoolNets, // New format
        });
        
        // Reset the panel for next use
        setPanels(prev => prev.map((p, index) => 
          index === panelIndex ? {
            ...p,
            id: `panel-${Date.now()}`,
            form: {
              name: '',
              size: 0,
              price: 0,
              rooms: 1,
              toilets: 1,
              buildingAge: 0,
              district: '',
              schoolNets: [],
              parkingType: 'none',
              carParkIncluded: false,
              carParkPrice: 0,
              managementFee: 0,
            },
            isEditing: false,
          } : p
        ));
      }
  };

  const handleCancelEdit = (panelIndex: number) => {
    setEditingProperty(null);
    setPanels(prev => prev.filter((_, index) => index !== panelIndex));
  };

  const handleRemoveProperty = (propertyId: string) => {
    removeProperty(propertyId);
  };

  const togglePanel = (panelIndex: number) => {
    setPanels(prev => prev.map((panel, index) => 
      index === panelIndex ? { ...panel, isExpanded: !panel.isExpanded } : panel
    ));
  };

  const addNewPanel = () => {
    if (panels.length >= 3) return;
    
    const newPanel: PropertyPanel = {
      id: `panel-${Date.now()}`,
      form: {
        name: '',
        size: 0,
        price: 0,
        rooms: 1,
        toilets: 1,
        buildingAge: 0,
        district: '',
        schoolNets: [],
        parkingType: 'none',
        carParkIncluded: false,
        carParkPrice: 0,
        managementFee: 0,
      },
      isExpanded: true,
      isEditing: false,
    };
    
    setPanels(prev => [...prev, newPanel]);
  };

  const getPanelHeader = (panel: PropertyPanel, index: number) => {
    const form = panel.form;
    
    if (panel.isEditing) {
      return `${t('propertyInput.editProperty')} ${index + 1}`;
    }
    
    if (!form.name && !form.size && !form.price) {
      return `${t('propertyInput.newProperty')} ${index + 1}`;
    }
    
    const summary = [
      form.name,
      `${form.rooms}R ${form.toilets}T`,
      form.size > 0 ? `${form.size}${t('common.ft2')}` : '',
      form.district
    ].filter(Boolean).join(' · ');
    
    return summary || `${t('propertyInput.newProperty')} ${index + 1}`;
  };

  // Handle estate name input with autocomplete
  const handleEstateNameChange = (panelIndex: number, value: string) => {
    handleInputChange(panelIndex, 'name', value);
    
    if (value.trim().length > 0) {
      const results = searchEstates(value, estates);
      setSuggestions(results);
      setShowSuggestions(true);
      setActiveSuggestionIndex(panelIndex);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle estate selection
  const handleEstateSelect = (panelIndex: number, estate: EstateData) => {
    setPanels(prev => prev.map((panel, index) => 
      index === panelIndex ? {
        ...panel,
        form: {
          ...panel.form,
          name: estate.name,
          district: estate.district,
          buildingAge: getBuildingAgeNumber(estate.buildingAge),
          schoolNets: estate.schoolNet ? [estate.schoolNet] : [],
        }
      } : panel
    ));
    setShowSuggestions(false);
  };

  // Handle district input with autocomplete
  const handleDistrictInputChange = (panelIndex: number, value: string) => {
    handleInputChange(panelIndex, 'district', value);
    
    if (value.trim().length > 0) {
      const districts = getAllDistricts();
      const filtered = districts.filter(district => 
        district.toLowerCase().includes(value.toLowerCase())
      );
      setDistrictSuggestions(filtered);
      setShowDistrictSuggestions(true);
      setActiveDistrictSuggestionIndex(panelIndex);
    } else {
      setDistrictSuggestions([]);
      setShowDistrictSuggestions(false);
    }
  };

  // Handle district selection
  const handleDistrictSelect = (panelIndex: number, district: string) => {
    handleDistrictChange(panelIndex, district);
    setShowDistrictSuggestions(false);
  };

  const getBuildingAgeNumber = (buildingAge: string): number => {
    const match = buildingAge.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const renderPropertyForm = (panel: PropertyPanel, panelIndex: number) => {
    const form = panel.form;
    const costPerSqFt = calculateCostPerSqFt(form);
    const managementFeeSuggestion = getManagementFeeSuggestion(form);
    const isExpensive = costPerSqFt > 25000;

    return (
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
                onChange={(e) => handleEstateNameChange(panelIndex, e.target.value)}
                className="input-field"
                placeholder={t('propertyInput.propertyNamePlaceholder')}
                required
                onFocus={() => {
                  if (form.name.trim().length > 0) {
                    setShowSuggestions(true);
                    setActiveSuggestionIndex(panelIndex);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              
              {/* Estate Suggestions */}
              {showSuggestions && activeSuggestionIndex === panelIndex && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((estate, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEstateSelect(panelIndex, estate)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <div className="font-medium">{estate.name}</div>
                      <div className="text-sm text-gray-600">
                        {estate.district} • {estate.buildingAge} • {estate.schoolNet}
                      </div>
                    </button>
                  ))}
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
                  onChange={(e) => handleInputChange(panelIndex, 'size', Number(e.target.value))}
                  className="input-field"
                  placeholder="500"
                  required
                />
                {form.size > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('propertyInput.costPerSqFt')}: ${costPerSqFt.toLocaleString()}
                    {isExpensive && (
                      <span className="text-red-600 ml-2">
                        ⚠️ {t('propertyInput.expensiveWarning')}
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.price')} ({t('common.tenThousand')}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => handleInputChange(panelIndex, 'price', Number(e.target.value))}
                    className="input-field pl-8"
                    placeholder="800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Rooms and Toilets - Paired Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.rooms')} *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange(panelIndex, 'rooms', Math.max(1, form.rooms - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{form.rooms}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange(panelIndex, 'rooms', form.rooms + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">{t('propertyInput.roomsHint')}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('propertyInput.toilets')} *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange(panelIndex, 'toilets', Math.max(1, form.toilets - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{form.toilets}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange(panelIndex, 'toilets', form.toilets + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">{t('propertyInput.toiletsHint')}</span>
                </div>
              </div>
            </div>

            {/* Building Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('propertyInput.buildingAge')} ({t('propertyInput.years')})
              </label>
              <input
                type="number"
                value={form.buildingAge || ''}
                onChange={(e) => handleInputChange(panelIndex, 'buildingAge', Number(e.target.value))}
                className="input-field"
                placeholder="20"
              />
            </div>
          </div>
        </div>

        {/* Layout & Location Section */}
        <div className="mb-4 lg:mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📍</span>
            {t('propertyInput.layoutLocationSection')}
          </h4>
          
          <div className="space-y-3 lg:space-y-4">
            {/* District with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('propertyInput.district')} *
              </label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => handleDistrictInputChange(panelIndex, e.target.value)}
                className="input-field"
                placeholder={t('propertyInput.districtPlaceholder')}
                required
                onFocus={() => {
                  if (form.district.trim().length > 0) {
                    setShowDistrictSuggestions(true);
                    setActiveDistrictSuggestionIndex(panelIndex);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowDistrictSuggestions(false), 200);
                }}
              />
              
              {/* District Suggestions */}
              {showDistrictSuggestions && activeDistrictSuggestionIndex === panelIndex && districtSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {districtSuggestions.map((district, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDistrictSelect(panelIndex, district)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {district}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* School Net */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('propertyInput.schoolNet')}
              </label>
              <div className="flex flex-wrap items-center p-1 bg-gray-100 rounded-md border border-gray-300">
                {form.schoolNets.map((schoolNet, index) => (
                  <span
                    key={index}
                    className="flex items-center bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-1 mb-1"
                  >
                    {schoolNet}
                    <button
                      type="button"
                      onClick={() => handleInputChange(panelIndex, 'schoolNets', form.schoolNets.filter((_, i) => i !== index))}
                      className="ml-1 text-primary-600 hover:text-primary-900 focus:outline-none"
                      aria-label="Remove school net"
                    >
                      ✖️
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value=""
                  onChange={(e) => {
                    const newSchoolNet = e.target.value.trim();
                    if (newSchoolNet && !form.schoolNets.includes(newSchoolNet)) {
                      setPanels(prev => prev.map((panel, i) => 
                        i === panelIndex ? {
                          ...panel,
                          form: {
                            ...panel.form,
                            schoolNets: [...panel.form.schoolNets, newSchoolNet],
                          },
                        } : panel
                      ));
                      e.target.value = ''; // Clear input after adding
                    }
                  }}
                  className="flex-1 input-field pl-1"
                  placeholder={t('propertyInput.schoolNetPlaceholder')}
                />
              </div>
              {form.schoolNets.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ {t('propertyInput.autoFilled')}
                </p>
              )}
            </div>
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
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                {t('propertyInput.parkingSection')}
              </h5>
              
              {/* Parking Type Radio Group */}
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`parking-${panelIndex}`}
                    checked={form.parkingType === 'none'}
                    onChange={() => handleInputChange(panelIndex, 'parkingType', 'none')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">{t('propertyInput.parkingNone')}</span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`parking-${panelIndex}`}
                    checked={form.parkingType === 'included'}
                    onChange={() => handleInputChange(panelIndex, 'parkingType', 'included')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">{t('propertyInput.parkingIncluded')} 🆗</span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`parking-${panelIndex}`}
                    checked={form.parkingType === 'additional'}
                    onChange={() => handleInputChange(panelIndex, 'parkingType', 'additional')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">{t('propertyInput.parkingAdditional')}</span>
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
                      onChange={(e) => handleInputChange(panelIndex, 'carParkPrice', Number(e.target.value))}
                      className="input-field pl-8"
                      placeholder="e.g. 500,000"
                    />
                  </div>
                </div>
              )}
              
              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ {t('propertyInput.parkingHelp')}
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
                    onChange={(e) => handleInputChange(panelIndex, 'managementFee', Number(e.target.value))}
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
                <div className="flex flex-wrap items-center p-1 bg-gray-100 rounded-md border border-gray-300">
                  {form.schoolNets.map((schoolNet, index) => (
                    <span
                      key={index}
                      className="flex items-center bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-1 mb-1"
                    >
                      {schoolNet}
                      <button
                        type="button"
                        onClick={() => handleInputChange(panelIndex, 'schoolNets', form.schoolNets.filter((_, i) => i !== index))}
                        className="ml-1 text-primary-600 hover:text-primary-900 focus:outline-none"
                        aria-label="Remove school net"
                      >
                        ✖️
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value=""
                    onChange={(e) => {
                      const newSchoolNet = e.target.value.trim();
                      if (newSchoolNet && !form.schoolNets.includes(newSchoolNet)) {
                        setPanels(prev => prev.map((panel, i) => 
                          i === panelIndex ? {
                            ...panel,
                            form: {
                              ...panel.form,
                              schoolNets: [...panel.form.schoolNets, newSchoolNet],
                            },
                          } : panel
                        ));
                        e.target.value = ''; // Clear input after adding
                      }
                    }}
                    className="flex-1 input-field pl-1"
                    placeholder={t('propertyInput.schoolNetPlaceholder')}
                  />
                </div>
                {form.schoolNets.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {t('propertyInput.autoFilled')}
                  </p>
                )}
                {form.schoolNets.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ {t('propertyInput.schoolNetRequired')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 lg:mt-8 flex justify-end space-x-3">
          {panel.isEditing ? (
            <>
              <button
                onClick={() => handleCancelEdit(panelIndex)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={() => handleAddProperty(panelIndex)}
                disabled={!isPropertyValid(form)}
                className="btn-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('actions.updateProperty')}
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAddProperty(panelIndex)}
              disabled={!isPropertyValid(form)}
              className="btn-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('propertyInput.addProperty')}
            </button>
          )}
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

      {/* Properties Counter */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-600">
          {t('propertyInput.addedProperties')} ({properties.length}/3)
        </span>
      </div>

      {/* Accordion Panels */}
      <div className="space-y-4">
        {panels.map((panel, index) => (
          <div key={panel.id} className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            {/* Panel Header */}
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePanel(index)}
                  className="flex-1 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getPanelHeader(panel, index)}
                  </h3>
                </button>
                
                <div className="flex items-center space-x-2">
                  {/* Edit/Expand Button */}
                  <button
                    onClick={() => togglePanel(index)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Edit property"
                  >
                    ✏️ {t('actions.edit')}
                  </button>
                  
                  {/* Remove Button - only show for existing properties */}
                  {panel.isEditing && (
                    <button
                      onClick={() => handleRemoveProperty(panel.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Remove property"
                    >
                      🗑️ {t('actions.remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Panel Content */}
            {panel.isExpanded && renderPropertyForm(panel, index)}
          </div>
        ))}
      </div>

      {/* Add New Panel Button */}
      {panels.length < 3 && (
        <div className="text-center">
          <button
            onClick={addNewPanel}
            className="btn-secondary"
          >
            + {t('propertyInput.addProperty')}
          </button>
        </div>
      )}
    </div>
  );
} 