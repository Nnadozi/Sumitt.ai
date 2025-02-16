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
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const systemScheme = useColorScheme();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
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

  const resolvedTheme = useMemo(() => {
    const activeTheme = theme === 'system' ? systemScheme : theme;
    return activeTheme === 'dark' ? MyDarkTheme : MyLightTheme;
  }, [theme, systemScheme]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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
