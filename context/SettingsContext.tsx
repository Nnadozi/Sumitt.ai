import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { MyLightTheme, MyDarkTheme } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar'; 

type ThemeType = 'light' | 'dark' | 'system';

interface SettingsContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  resolvedTheme: typeof MyLightTheme | typeof MyDarkTheme;
  customPrimaryColor: string | null;
  setCustomPrimaryColor: (color: string | null) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [customPrimaryColor, setCustomPrimaryColorState] = useState<string | null>(null);
  const systemScheme = useColorScheme();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedColor = await AsyncStorage.getItem('customPrimaryColor');
        
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
        if (savedColor) {
          setCustomPrimaryColorState(savedColor);
        }
      } catch (error) {
        console.error('Failed to load settings from storage:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const activeTheme = theme === 'system' ? systemScheme : theme;
    if (activeTheme === 'dark') {
      NavigationBar.setBackgroundColorAsync(MyDarkTheme.colors.background);
    } else {
      NavigationBar.setBackgroundColorAsync(MyLightTheme.colors.background);
    }
  }, [theme, systemScheme]);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  const setCustomPrimaryColor = async (color: string | null) => {
    try {
      if (color) {
        await AsyncStorage.setItem('customPrimaryColor', color);
      } else {
        await AsyncStorage.removeItem('customPrimaryColor');
      }
      setCustomPrimaryColorState(color);
    } catch (error) {
      console.error('Failed to save custom color to storage:', error);
    }
  };

  const resolvedTheme = useMemo(() => {
    const activeTheme = theme === 'system' ? systemScheme : theme;
    const baseTheme = activeTheme === 'dark' ? MyDarkTheme : MyLightTheme;
    
    // Apply custom primary color if set
    if (customPrimaryColor) {
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: customPrimaryColor,
        },
      };
    }
    
    return baseTheme;
  }, [theme, systemScheme, customPrimaryColor]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, resolvedTheme, customPrimaryColor, setCustomPrimaryColor }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
