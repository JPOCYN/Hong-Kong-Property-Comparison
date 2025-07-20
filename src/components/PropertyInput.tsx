'use client';

import { useState } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
import { getTranslation } from '@/utils/translations';
import { Property } from '@/store/useAppStore';

export default function PropertyInput() {
  const { properties, addProperty, language } = usePropertyStore();
  const t = (key: string) => getTranslation(key, language);

  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    size: 0,
    price: 0,
    rooms: 1,
    toilets: 1,
    carParkIncluded: false,
    carParkPrice: 0,
    managementFee: 0,
  });

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      buildingAge: 0, // Default value
      district: '', // Default value
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
      carParkIncluded: false,
      carParkPrice: 0,
      managementFee: 0,
    });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">{t('property.title')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('property.size')} *
            </label>
            <input
              type="number"
              value={formData.size || ''}
              onChange={(e) => handleInputChange('size', Number(e.target.value))}
              className="input-field"
              placeholder={t('placeholder.size')}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('property.price')} *
            </label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              className="input-field"
              placeholder={t('placeholder.price')}
              required
            />
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Car Park */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <input
                    type="number"
                    value={formData.carParkPrice || ''}
                    onChange={(e) => handleInputChange('carParkPrice', Number(e.target.value))}
                    className="input-field"
                    placeholder={t('property.carParkPrice')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Management Fee */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('property.managementFee')}
            </label>
            <input
              type="number"
              value={formData.managementFee || ''}
              onChange={(e) => handleInputChange('managementFee', Number(e.target.value))}
              className="input-field"
              placeholder="0"
            />
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