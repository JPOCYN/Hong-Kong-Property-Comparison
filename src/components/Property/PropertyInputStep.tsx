'use client';

import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { loadEstateData, searchEstates, getEstateByName, EstateData, formatPricePerFt, getBuildingAgeNumber } from '@/utils/estateData';
import { useState, useEffect } from 'react';

interface PropertyFormData {
  name: string;
  size: number;
  price: number;
  rooms: number | '';
  toilets: number | '';
  buildingAge: number;
  district: string;
  schoolNet: string;
  parkingType: 'none' | 'included' | 'additional';
  carParkIncluded: boolean;
  carParkPrice: number;
  managementFee: number;
  propertyLink: string;
}

type InputMode = 'guided' | 'quick';
type FormStep = 'basic' | 'details' | 'extras';

export default function PropertyInputStep() {
  const { properties, addProperty, updateProperty, removeProperty, language, editingPropertyId, setEditingProperty, setCurrentStep, nextStep, canProceedToNextStep } = useAppStore();
  const t = (key: string) => getTranslation(key, language);
  
  // UI State
  const [inputMode, setInputMode] = useState<InputMode>('guided');
  const [activeFormStep, setActiveFormStep] = useState<FormStep>('basic');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<string | null>(null);
  
  // Property form data - Start with just one form
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
      propertyLink: '',
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
        
        // Smart defaults and auto-calculations
        if (field === 'parkingType') {
          updatedForm.carParkIncluded = value === 'included';
          if (value !== 'additional') {
            updatedForm.carParkPrice = 0;
          }
        }
        
        // Auto-calculate management fee when size changes
        if (field === 'size' && value > 0) {
          updatedForm.managementFee = Math.round(value * 2.7);
        }
        
        // Auto-advance to next step in guided mode
        if (inputMode === 'guided' && activeFormStep === 'basic') {
          if (field === 'price' && value > 0 && updatedForm.name && updatedForm.size > 0) {
            setTimeout(() => setActiveFormStep('details'), 500);
          }
        }
        
        return updatedForm;
      }
      return form;
    }));
  };

  const calculateCostPerSqFt = (form: PropertyFormData): number => {
    if (form.size > 0 && form.price > 0) {
      return form.price / form.size;
    }
    return 0;
  };

  const getFormCompletionPercentage = (form: PropertyFormData): number => {
    const fields = [
      form.name,
      form.size > 0,
      form.price > 0,
      form.rooms,
      form.toilets,
      form.district,
      form.managementFee > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const isBasicFormValid = (form: PropertyFormData): boolean => {
    return form.name.trim() !== '' && form.price > 0 && form.size > 0;
  };

  const isPropertyValid = (form: PropertyFormData): boolean => {
    return isBasicFormValid(form);
  };

  const handleAddProperty = (formIndex: number) => {
    const form = propertyForms[formIndex];
    if (isPropertyValid(form)) {
      // Ensure rooms and toilets are numbers
      const propertyData = {
        ...form,
        rooms: typeof form.rooms === 'string' ? 1 : form.rooms,
        toilets: typeof form.toilets === 'string' ? 1 : form.toilets,
        carParkIncluded: form.parkingType === 'included',
      };
      
      if (editingPropertyId) {
        // Update existing property
        updateProperty(editingPropertyId, propertyData);
        setEditingProperty(null);
      } else {
        // Add new property
        addProperty({
          ...propertyData,
          id: Date.now().toString() + formIndex,
        });
      }
      
      // Show success animation
      setShowSuccessAnimation(propertyData.name);
      setTimeout(() => setShowSuccessAnimation(null), 2000);
      
      // Reset the form
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
          propertyLink: '',
        } : f
      ));
      
      // Reset to basic step
      setActiveFormStep('basic');
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
        setPropertyForms([{
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
          propertyLink: editingProperty.propertyLink || '',
        }]);
        setActiveFormStep('basic');
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
        managementFee: form.managementFee,
      } : form
    ));
    setShowSuggestions(false);
    
    // Auto-advance to next field in guided mode
    if (inputMode === 'guided') {
      setTimeout(() => {
        const sizeInput = document.querySelector(`input[placeholder="500"]`) as HTMLInputElement;
        if (sizeInput) sizeInput.focus();
      }, 100);
    }
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
    handleInputChange(formIndex, 'district', district);
    setShowDistrictSuggestions(false);
  };

  const renderModeToggle = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-gray-100 p-1 rounded-lg flex">
        <button
          onClick={() => setInputMode('guided')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputMode === 'guided'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🎯 Guided Mode
        </button>
        <button
          onClick={() => setInputMode('quick')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputMode === 'quick'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⚡ Quick Mode
        </button>
      </div>
    </div>
  );

  const renderProgressSteps = (formIndex: number) => {
    if (inputMode === 'quick') return null;
    
    const form = propertyForms[formIndex];
    const steps = [
      { key: 'basic', label: 'Basic Info', completed: isBasicFormValid(form) },
      { key: 'details', label: 'Details', completed: form.district && form.rooms && form.toilets },
      { key: 'extras', label: 'Extras', completed: form.managementFee > 0 }
    ];

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">Progress</h4>
          <span className="text-sm text-gray-500">{getFormCompletionPercentage(form)}% complete</span>
        </div>
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setActiveFormStep(step.key as FormStep)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  activeFormStep === step.key
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {steps.map(step => (
            <span key={step.key}>{step.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderBasicForm = (formIndex: number) => {
    const form = propertyForms[formIndex];
    const costPerSqFt = calculateCostPerSqFt(form);
    const isExpensive = costPerSqFt > 25000;

    return (
      <div className="space-y-4">
        {/* Property Name with Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏠 Property Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleEstateNameChange(formIndex, e.target.value)}
            className="input-field text-lg"
            placeholder="Start typing estate name..."
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
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {suggestions.map((estate, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEstateSelect(formIndex, estate)}
                  className="block w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{estate.name}</div>
                      <div className="text-sm text-gray-500">{estate.address}</div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div>{estate.district}</div>
                      <div className="font-medium text-blue-600">{estate.pricePerFt}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {isLoadingEstates && (
            <div className="absolute right-3 top-12 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Size and Price - Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📏 Size (ft²) *
            </label>
            <input
              type="number"
              value={form.size || ''}
              onChange={(e) => handleInputChange(formIndex, 'size', Number(e.target.value))}
              className="input-field text-lg"
              placeholder="500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Price (萬 HKD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                $
              </span>
              <input
                type="number"
                value={form.price ? form.price / 10000 : ''}
                onChange={(e) => handleInputChange(formIndex, 'price', Number(e.target.value) * 10000)}
                className="input-field pl-8 text-lg"
                placeholder="800"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                萬
              </span>
            </div>
          </div>
        </div>

        {/* Cost per ft² Feedback - Enhanced */}
        {costPerSqFt > 0 && (
          <div className={`p-4 rounded-lg border-2 ${
            isExpensive 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{isExpensive ? '🔥' : '💚'}</span>
              <div>
                <div className={`font-semibold ${isExpensive ? 'text-red-800' : 'text-green-800'}`}>
                  ${costPerSqFt.toLocaleString()}/ft²
                </div>
                <div className={`text-sm ${isExpensive ? 'text-red-600' : 'text-green-600'}`}>
                  {isExpensive ? 'Premium pricing' : 'Good value'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailsForm = (formIndex: number) => {
    const form = propertyForms[formIndex];

    return (
      <div className="space-y-4">
        {/* Rooms and Toilets */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🛏️ Rooms
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.rooms || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  handleInputChange(formIndex, 'rooms', '');
                  return;
                }
                const numValue = parseInt(inputValue);
                if (!isNaN(numValue)) {
                  handleInputChange(formIndex, 'rooms', numValue);
                }
              }}
              onBlur={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '' || parseInt(inputValue) < 1) {
                  handleInputChange(formIndex, 'rooms', 1);
                } else if (parseInt(inputValue) > 10) {
                  handleInputChange(formIndex, 'rooms', 10);
                }
              }}
              className="input-field text-center text-lg font-semibold"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚽 Toilets
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={form.toilets || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  handleInputChange(formIndex, 'toilets', '');
                  return;
                }
                const numValue = parseInt(inputValue);
                if (!isNaN(numValue)) {
                  handleInputChange(formIndex, 'toilets', numValue);
                }
              }}
              onBlur={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '' || parseInt(inputValue) < 1) {
                  handleInputChange(formIndex, 'toilets', 1);
                } else if (parseInt(inputValue) > 8) {
                  handleInputChange(formIndex, 'toilets', 8);
                }
              }}
              className="input-field text-center text-lg font-semibold"
              placeholder="1"
            />
          </div>
        </div>

        {/* District and Building Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 District
            </label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => handleDistrictInputChange(formIndex, e.target.value)}
              className="input-field"
              placeholder="e.g., 中西區, 九龍城"
            />
            
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏗️ Building Age (years)
            </label>
            <input
              type="number"
              value={form.buildingAge || ''}
              onChange={(e) => handleInputChange(formIndex, 'buildingAge', Number(e.target.value))}
              className="input-field"
              placeholder="10"
            />
          </div>
        </div>

        {/* School Net - Auto-filled */}
        {form.schoolNet && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">🎓</span>
              <span className="text-sm text-green-700">
                <strong>School Net:</strong> {form.schoolNet}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExtrasForm = (formIndex: number) => {
    const form = propertyForms[formIndex];
    const managementFeeSuggestion = Math.round(form.size * 2.7);

    return (
      <div className="space-y-4">
        {/* Parking */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🚗 Parking
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              { value: 'none', label: '❌ None', desc: 'No parking' },
              { value: 'included', label: '✅ Included', desc: 'Free with unit' },
              { value: 'additional', label: '💰 Additional', desc: 'Extra cost' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleInputChange(formIndex, 'parkingType', option.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  form.parkingType === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Parking Price */}
        {form.parkingType === 'additional' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Price
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
                placeholder="500000"
              />
            </div>
          </div>
        )}

        {/* Management Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏢 Management Fee (per month)
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
              placeholder={managementFeeSuggestion.toString()}
            />
          </div>
          {form.size > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              💡 Suggested: ${managementFeeSuggestion} (based on $2.7/ft²)
            </p>
          )}
        </div>

        {/* Property Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔗 Property Link (optional)
          </label>
          <input
            type="url"
            value={form.propertyLink}
            onChange={(e) => handleInputChange(formIndex, 'propertyLink', e.target.value)}
            className="input-field"
            placeholder="https://example.com/property-listing"
          />
        </div>
      </div>
    );
  };

  const renderQuickForm = (formIndex: number) => {
    const form = propertyForms[formIndex];
    const costPerSqFt = calculateCostPerSqFt(form);
    const isExpensive = costPerSqFt > 25000;

    return (
      <div className="space-y-4">
        {/* All fields in compact layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Property Name */}
          <div className="md:col-span-2 lg:col-span-3 relative">
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleEstateNameChange(formIndex, e.target.value)}
              className="input-field text-lg"
              placeholder="🏠 Property name..."
              required
            />
            
            {showSuggestions && suggestions.length > 0 && activeSuggestionIndex === formIndex && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map((estate, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEstateSelect(formIndex, estate)}
                    className="block w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{estate.name}</div>
                    <div className="text-sm text-gray-500">{estate.address} • {estate.district}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size */}
          <div>
            <input
              type="number"
              value={form.size || ''}
              onChange={(e) => handleInputChange(formIndex, 'size', Number(e.target.value))}
              className="input-field"
              placeholder="📏 Size (ft²)"
              required
            />
          </div>

          {/* Price */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={form.price ? form.price / 10000 : ''}
              onChange={(e) => handleInputChange(formIndex, 'price', Number(e.target.value) * 10000)}
              className="input-field pl-8"
              placeholder="💰 Price (萬)"
              required
            />
          </div>

          {/* Rooms */}
          <div>
            <input
              type="number"
              min="1"
              max="10"
              value={form.rooms || ''}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange(formIndex, 'rooms', value === '' ? '' : parseInt(value));
              }}
              className="input-field text-center"
              placeholder="🛏️ Rooms"
            />
          </div>

          {/* District */}
          <div className="relative">
            <input
              type="text"
              value={form.district}
              onChange={(e) => handleDistrictInputChange(formIndex, e.target.value)}
              className="input-field"
              placeholder="📍 District"
            />
            
            {showDistrictSuggestions && districtSuggestions.length > 0 && activeDistrictSuggestionIndex === formIndex && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {districtSuggestions.map((district, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDistrictSelect(formIndex, district)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {district}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Management Fee */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={form.managementFee || ''}
              onChange={(e) => handleInputChange(formIndex, 'managementFee', Number(e.target.value))}
              className="input-field pl-8"
              placeholder="🏢 Mgmt Fee"
            />
          </div>
        </div>

        {/* Cost feedback */}
        {costPerSqFt > 0 && (
          <div className={`p-3 rounded-lg text-sm ${
            isExpensive ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            <strong>${costPerSqFt.toLocaleString()}/ft²</strong> • {isExpensive ? 'Premium pricing' : 'Good value'}
          </div>
        )}
      </div>
    );
  };

  const renderPropertyForm = (formIndex: number) => {
    const form = propertyForms[formIndex];
    const completionPercentage = getFormCompletionPercentage(form);

    return (
      <div key={formIndex} className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingPropertyId ? (
                  <span className="flex items-center">
                    <span className="text-blue-600 mr-2">✏️</span>
                    Edit Property
                  </span>
                ) : (
                  `Add Property ${properties.length + 1}`
                )}
              </h3>
              {inputMode === 'guided' && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{completionPercentage}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {inputMode === 'guided' && renderProgressSteps(formIndex)}
          
          {inputMode === 'guided' ? (
            <>
              {activeFormStep === 'basic' && renderBasicForm(formIndex)}
              {activeFormStep === 'details' && renderDetailsForm(formIndex)}
              {activeFormStep === 'extras' && renderExtrasForm(formIndex)}
            </>
          ) : (
            renderQuickForm(formIndex)
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center">
            {inputMode === 'guided' && activeFormStep !== 'basic' && (
              <button
                onClick={() => {
                  const steps: FormStep[] = ['basic', 'details', 'extras'];
                  const currentIndex = steps.indexOf(activeFormStep);
                  if (currentIndex > 0) {
                    setActiveFormStep(steps[currentIndex - 1]);
                  }
                }}
                className="btn-secondary"
              >
                ← Previous
              </button>
            )}
            
            <div className="flex space-x-3 ml-auto">
              {editingPropertyId && (
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setPropertyForms([{
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
                      propertyLink: '',
                    }]);
                    setActiveFormStep('basic');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
              
              {inputMode === 'guided' && activeFormStep !== 'extras' && isBasicFormValid(form) && (
                <button
                  onClick={() => {
                    const steps: FormStep[] = ['basic', 'details', 'extras'];
                    const currentIndex = steps.indexOf(activeFormStep);
                    if (currentIndex < steps.length - 1) {
                      setActiveFormStep(steps[currentIndex + 1]);
                    }
                  }}
                  className="btn-primary"
                >
                  Next →
                </button>
              )}
              
              {(inputMode === 'quick' || activeFormStep === 'extras') && (
                <button
                  onClick={() => handleAddProperty(formIndex)}
                  disabled={!isPropertyValid(form)}
                  className="btn-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed px-8"
                >
                  {editingPropertyId ? 'Update Property' : 'Add Property'} ✨
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          ✅ {showSuccessAnimation} added successfully!
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Add Properties to Compare
        </h2>
        <p className="text-gray-600">
          Add up to 5 properties to find your perfect home
        </p>
      </div>

      {/* Mode Toggle */}
      {renderModeToggle()}

      {/* Added Properties Section */}
      {properties.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                {properties.length}
              </span>
              Added Properties ({properties.length}/5)
            </h3>
            {properties.length >= 2 && (
              <button
                onClick={() => {
                  if (canProceedToNextStep()) {
                    nextStep();
                  }
                }}
                className="btn-primary px-6 py-3 text-lg font-bold"
              >
                🚀 Compare Now
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property, index) => (
              <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">{property.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-semibold">${(property.price / 10000).toFixed(0)}萬</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-semibold">{property.size} ft²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Layout:</span>
                        <span className="font-semibold">{property.rooms}R {property.toilets}T</span>
                      </div>
                      {property.district && (
                        <div className="flex justify-between">
                          <span>District:</span>
                          <span className="font-semibold">{property.district}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingProperty(property.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeProperty(property.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-green-100 text-green-800' :
                    index === 1 ? 'bg-blue-100 text-blue-800' :
                    index === 2 ? 'bg-purple-100 text-purple-800' :
                    index === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {index === 0 ? '🏆 #1' : 
                     index === 1 ? '🥈 #2' : 
                     index === 2 ? '🥉 #3' : 
                     index === 3 ? '4️⃣ #4' :
                     '5️⃣ #5'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Input Form */}
      {properties.length < 5 && (
        <div>
          {renderPropertyForm(0)}
        </div>
      )}

      {/* Max Properties Message */}
      {properties.length >= 5 && (
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Maximum Properties Reached!
          </h3>
          <p className="text-gray-600 mb-4">
            You've added 5 properties. Ready to compare them?
          </p>
          <button
            onClick={() => {
              if (canProceedToNextStep()) {
                nextStep();
              }
            }}
            className="btn-primary px-8 py-3 text-lg font-bold"
          >
            🚀 Compare All Properties
          </button>
        </div>
      )}
    </div>
  );
} 