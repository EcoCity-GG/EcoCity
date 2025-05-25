
import * as React from 'react';

// Define the theme context type
interface ThemeContextType {
  theme: 'light'; // We're removing dark mode, so only light theme is available
  setTheme: (theme: 'light') => void;
}

// Create the context
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Create the provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = React.useState<'light'>('light');

  const setTheme = () => {
    // Do nothing since we only support light theme now
    console.log('Only light theme is supported');
  };

  // Return the provider with the theme value and setTheme function
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create the hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
