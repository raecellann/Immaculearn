export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  hover: string;
}

export interface SpaceThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    dark: ThemeColors;
    light: ThemeColors;
  };
}