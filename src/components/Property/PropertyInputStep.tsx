'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/utils/translations';
import { Property } from '@/store/useAppStore';
import { getSchoolNetByDistrict, getAllDistricts } from '@/utils/schoolNetMap';
import { estimateManagementFee } from '@/utils/affordability';

export default function PropertyInputStep() {
  const { properties, addProperty, language } = useAppStore();
  const t = (key: string) => getTranslation(key, language);

  const [formData, setFormData] = useState<Partial<Property>>({
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

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (field: keyof Property, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Auto-calculate management fee when size changes
    if (field === 'size' && value > 0) {
      newData.managementFee = estimateManagementFee(value);
    }

    // Auto-fill school net when district changes
    if (field === 'district') {
      const schoolNets = getSchoolNetByDistrict(value);
      if (schoolNets.length > 0) {
        newData.schoolNet = schoolNets[0].code;
      }
    }

    setFormData(newData);
  };

  const handleDistrictInput = (value: string) => {
    setFormData(prev => ({ ...prev, district: value }));
    
    if (value.length > 0) {
      const districts = getAllDistricts();
      const filtered = districts.filter(district => 
        district.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectDistrict = (district: string) => {
    setFormData(prev => ({ ...prev, district }));
    setShowSuggestions(false);
    
    // Auto-fill school net
    const schoolNets = getSchoolNetByDistrict(district);
    if (schoolNets.length > 0) {
      setFormData(prev => ({ ...prev, schoolNet: schoolNets[0].code }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.size || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (properties.length >= 3) {
      alert(t('message.maxProperties'));
      return;
    }

    const newProperty: Property = {
      id: Date.now().toString(),
      name: formData.name!,
      size: formData.size!,
      price: formData.price!,
      rooms: formData.rooms || 1,
      toilets: formData.toilets || 1,
      buildingAge: formData.buildingAge || 0,
      district: formData.district || '',
      schoolNet: formData.schoolNet || '',
      carParkIncluded: formData.carParkIncluded || false,
      carParkPrice: formData.carParkPrice || 0,
      managementFee: formData.managementFee || 0,
    };

    addProperty(newProperty);
    
    // Reset form
    setFormData({
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
  };

  const calculateCostPerSqFt = () => {
    if (formData.price && formData.size) {
      return (formData.price / formData.size).toFixed(0);
    }
    return '';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">{t('property.title')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder={t('placeholder.propertyName')}
              required
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.size')} *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.size || ''}
                onChange={(e) => handleInputChange('size', Number(e.target.value))}
                className="input-field pr-12"
                placeholder={t('placeholder.size')}
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {t('common.ft2')}
              </span>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.price')} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                className="input-field pl-8"
                placeholder={t('placeholder.price')}
                required
              />
            </div>
            {calculateCostPerSqFt() && (
              <p className="text-xs text-gray-500 mt-1">
                {t('property.costPerSqFt')}: ${calculateCostPerSqFt()}/{t('common.ft2')}
              </p>
            )}
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.rooms')}
            </label>
            <input
              type="number"
              min="1"
              value={formData.rooms || 1}
              onChange={(e) => handleInputChange('rooms', Number(e.target.value))}
              className="input-field"
            />
          </div>

          {/* Toilets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.toilets')}
            </label>
            <input
              type="number"
              min="1"
              value={formData.toilets || 1}
              onChange={(e) => handleInputChange('toilets', Number(e.target.value))}
              className="input-field"
            />
          </div>

          {/* Building Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.buildingAge')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.buildingAge || ''}
                onChange={(e) => handleInputChange('buildingAge', Number(e.target.value))}
                className="input-field pr-12"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                years
              </span>
            </div>
          </div>

          {/* District */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.district')}
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleDistrictInput(e.target.value)}
              className="input-field"
              placeholder="e.g., 中西區"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {suggestions.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() => selectDistrict(district)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              {t('property.schoolNet')} ({t('common.optional')})
            </label>
            <input
              type="text"
              value={formData.schoolNet}
              onChange={(e) => handleInputChange('schoolNet', e.target.value)}
              className="input-field"
              placeholder="e.g., 11"
            />
          </div>

          {/* Car Park */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.carPark')}
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.carParkIncluded || false}
                  onChange={(e) => handleInputChange('carParkIncluded', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{t('property.carParkIncluded')}</span>
              </label>
              
              {!formData.carParkIncluded && (
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={formData.carParkPrice || ''}
                      onChange={(e) => handleInputChange('carParkPrice', Number(e.target.value))}
                      className="input-field pl-8"
                      placeholder={t('property.carParkPrice')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Management Fee */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property.managementFee')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={formData.managementFee || ''}
                onChange={(e) => handleInputChange('managementFee', Number(e.target.value))}
                className="input-field pl-8"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Estimated: ${formData.size ? estimateManagementFee(formData.size).toFixed(0) : '0'}/month
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {properties.length}/3 {t('message.maxProperties')}
          </span>
          <button
            type="submit"
            disabled={properties.length >= 3}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('actions.addProperty')}
          </button>
        </div>
      </form>
    </div>
  );
} 