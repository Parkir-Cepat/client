// Types related to Material UI
import type { Theme, ThemeOptions } from '@mui/material/styles';

// Add additional theme options here
export interface ExtendedThemeOptions extends ThemeOptions {
  // Add custom theme options
  customColors: {
    primary: string;
    secondary: string;
  };
}

export interface ExtendedTheme extends Theme {
  // Add custom theme properties
  customColors: {
    primary: string;
    secondary: string;
  };
}
