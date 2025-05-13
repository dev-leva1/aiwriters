import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChakraProvider, ColorModeProvider, useColorMode } from '@chakra-ui/react';

type ThemeContextType = {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Проверяем сохраненную тему в localStorage
  const getInitialColorMode = (): 'light' | 'dark' => {
    const savedColorMode = localStorage.getItem('chakra-ui-color-mode');
    return (savedColorMode === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  };

  const [colorMode, setColorMode] = useState<'light' | 'dark'>(getInitialColorMode);

  // Переключатель темы
  const toggleColorMode = () => {
    const newColorMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newColorMode);
    localStorage.setItem('chakra-ui-color-mode', newColorMode);
  };

  // Применяем тему при загрузке и изменении
  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', colorMode);
  }, [colorMode]);

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
      <ChakraProvider>
        <ColorModeProvider
          options={{
            initialColorMode: colorMode,
            useSystemColorMode: false,
          }}
        >
          {children}
        </ColorModeProvider>
      </ChakraProvider>
    </ThemeContext.Provider>
  );
};

// Хук для использования контекста темы в компонентах
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Компонент для доступа к цветовому режиму Chakra UI
export const ThemeColorMode: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toggleColorMode } = useTheme();
  const { colorMode } = useColorMode();

  // Синхронизируем состояние нашего контекста с Chakra UI
  useEffect(() => {
    if ((colorMode === 'light' || colorMode === 'dark') && 
        localStorage.getItem('chakra-ui-color-mode') !== colorMode) {
      localStorage.setItem('chakra-ui-color-mode', colorMode);
    }
  }, [colorMode]);

  return <>{children}</>;
}; 