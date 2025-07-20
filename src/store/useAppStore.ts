import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MortgageType } from '@/utils/mortgage';

export interface BuyerInfo {
  monthlyIncome: number;
  downpaymentBudget: number;
  isFirstTimeBuyer: boolean;
  mortgageType: MortgageType;
  mortgageYears: number;
  // Mortgage rate configurations
  hiborRate: number;
  hiborSpread: number;
  primeRate: number;
  primeDiscount: number;
  manualRate: number;
}

export interface Property {
  id: string;
  name: string;
  size: number; // ft²
  price: number;
  rooms: number;
  toilets: number;
  buildingAge: number; // 樓齡
  district: string; // 地區
  schoolNet?: string; // 小學校網 (optional)
  carParkIncluded: boolean;
  carParkPrice: number;
  managementFee: number;
}

export interface AppState {
  // Step management
  currentStep: number;
  maxSteps: number;
  
  // User data
  buyerInfo: BuyerInfo;
  properties: Property[];
  
  // UI state
  language: 'en' | 'zh';
  isLoading: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBuyerInfo: (info: Partial<BuyerInfo>) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  removeProperty: (id: string) => void;
  clearProperties: () => void;
  setLanguage: (lang: 'en' | 'zh') => void;
  setLoading: (loading: boolean) => void;
  
  // Computed values
  canProceedToNextStep: () => boolean;
  getPropertyById: (id: string) => Property | undefined;
}

const defaultBuyerInfo: BuyerInfo = {
  monthlyIncome: 50000,
  downpaymentBudget: 2000000,
  isFirstTimeBuyer: true,
  mortgageType: 'H-mortgage',
  mortgageYears: 30,
  hiborRate: 1.07,
  hiborSpread: 1.3,
  primeRate: 5.25,
  primeDiscount: 2.0,
  manualRate: 4.125,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      maxSteps: 3,
      buyerInfo: defaultBuyerInfo,
      properties: [],
      language: 'en',
      isLoading: false,
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const { currentStep, maxSteps, canProceedToNextStep } = get();
        if (currentStep < maxSteps && canProceedToNextStep()) {
          set({ currentStep: currentStep + 1 });
          // Scroll to top on mobile
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
          // Scroll to top on mobile
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      },
      
      updateBuyerInfo: (info) =>
        set((state) => ({
          buyerInfo: { ...state.buyerInfo, ...info },
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
      
      clearProperties: () => set({ properties: [] }),
      
      setLanguage: (language) => set({ language }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      canProceedToNextStep: () => {
        const { currentStep, buyerInfo, properties } = get();
        
        switch (currentStep) {
          case 1:
            return buyerInfo.monthlyIncome > 0 && buyerInfo.downpaymentBudget > 0;
          case 2:
            return properties.length > 0;
          default:
            return true;
        }
      },
      
      getPropertyById: (id) =>
        get().properties.find((p) => p.id === id),
    }),
    {
      name: 'hk-property-comparison-storage',
      partialize: (state) => ({
        buyerInfo: state.buyerInfo,
        properties: state.properties,
        language: state.language,
      }),
    }
  )
); 