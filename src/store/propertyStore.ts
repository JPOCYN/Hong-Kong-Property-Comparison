import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property } from '@/store/useAppStore';
import { MortgageConfig } from '@/utils/mortgage';

interface UserFinancials {
  monthlySalary: number;
  downpaymentBudget: number;
  isFirstTimeBuyer: boolean;
  mortgageConfig: MortgageConfig;
  mortgageYears: number;
}

interface PropertyStore {
  // User financial information
  userFinancials: UserFinancials;
  
  // Properties to compare
  properties: Property[];
  
  // Language setting
  language: 'en' | 'zh';
  
  // Actions
  updateUserFinancials: (financials: Partial<UserFinancials>) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  removeProperty: (id: string) => void;
  clearProperties: () => void;
  setLanguage: (lang: 'en' | 'zh') => void;
  
  // Computed values
  getPropertyById: (id: string) => Property | undefined;
}

const defaultUserFinancials: UserFinancials = {
  monthlySalary: 50000,
  downpaymentBudget: 2000000,
  isFirstTimeBuyer: true,
  mortgageConfig: {
    type: 'H-mortgage',
    hibor: 1.07,
    hSpread: 1.3,
    prime: 5.25,
    pDiscount: 2.0,
  },
  mortgageYears: 30,
};

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      userFinancials: defaultUserFinancials,
      properties: [],
      language: 'en',
      
      updateUserFinancials: (financials) =>
        set((state) => ({
          userFinancials: { ...state.userFinancials, ...financials },
        })),
      
      addProperty: (property) =>
        set((state) => ({
          properties: [...state.properties, property],
        })),
      
      updateProperty: (id, property) =>
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...property } : p
          ),
        })),
      
      removeProperty: (id) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
        })),
      
      clearProperties: () =>
        set({ properties: [] }),
      
      setLanguage: (language) =>
        set({ language }),
      
      getPropertyById: (id) =>
        get().properties.find((p) => p.id === id),
    }),
    {
      name: 'property-comparison-storage',
      partialize: (state) => ({
        userFinancials: state.userFinancials,
        properties: state.properties,
        language: state.language,
      }),
    }
  )
); 