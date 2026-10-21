// React Theme — extracted from https://symboolic.com/
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
  };
  fonts: {
    body: string;
  };
  fontSizes: {
    '13': string;
    '14': string;
    '16': string;
    '18': string;
    '20': string;
    '24': string;
    '30': string;
    '48': string;
    '52': string;
    '57': string;
    '69': string;
    '104': string;
  };
  space: {
    '1': string;
    '80': string;
    '112': string;
    '128': string;
    '144': string;
    '160': string;
    '192': string;
    '208': string;
    '311': string;
    '320': string;
    '400': string;
    '448': string;
  };
  radii: {
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    xs: string;
    md: string;
    xl: string;
  };
  states: {
    hover: { opacity: number };
    focus: { opacity: number };
    active: { opacity: number };
    disabled: { opacity: number };
  };
}

export const theme: Theme = {
  colors: {
    primary: "#f95c4b",
    secondary: "#ee9590",
    accent: "#f2f0e9",
    background: "#f2f0e9",
    foreground: "#181619",
    neutral50: "#e5e7eb",
    neutral100: "#181619",
    neutral200: "#ffffff",
    neutral300: "#403b42",
  },
  fonts: {
    body: "'Manrope', sans-serif",
  },
  fontSizes: {
    "13": "13px",
    "14": "14px",
    "16": "16px",
    "18": "18px",
    "20": "20px",
    "24": "24px",
    "30": "30px",
    "48": "48px",
    "52": "52px",
    "57": "57px",
    "69": "69px",
    "104": "104px",
  },
  space: {
    "1": "1px",
    "80": "80px",
    "112": "112px",
    "128": "128px",
    "144": "144px",
    "160": "160px",
    "192": "192px",
    "208": "208px",
    "311": "311px",
    "320": "320px",
    "400": "400px",
    "448": "448px",
  },
  radii: {
    md: "8px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  shadows: {
    none: "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
    xs: "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.7) 0px 1px 0px 0px inset",
    md: "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 1px 2px 0px, rgba(0, 0, 0, 0) 0px 4px 12px 0px",
    xl: "rgba(249, 94, 77, 0.3) 0px 0px 40px 0px",
  },
  states: {
    hover: {
      opacity: 0.08,
    },
    focus: {
      opacity: 0.12,
    },
    active: {
      opacity: 0.16,
    },
    disabled: {
      opacity: 0.38,
    },
  },
};

// MUI v5 theme
export const muiTheme = {
  palette: {
    primary: {
      main: "#f95c4b",
      light: "hsl(6, 94%, 79%)",
      dark: "hsl(6, 94%, 49%)",
    },
    secondary: {
      main: "#ee9590",
      light: "hsl(3, 73%, 90%)",
      dark: "hsl(3, 73%, 60%)",
    },
    background: {
      default: "#f2f0e9",
      paper: "#ffffff",
    },
    text: {
      primary: "#181619",
      secondary: "#f2f0e9",
    },
  },
  typography: {
    fontFamily: "'Manrope', sans-serif",
    h1: {
      fontSize: "48px",
      fontWeight: "600",
      lineHeight: "55.68px",
    },
    h2: {
      fontSize: "30px",
      fontWeight: "600",
      lineHeight: "35.7px",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.9) 0px 1px 0px 0px inset",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.2) 0px 1px 0px 0px inset",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.7) 0px 1px 0px 0px inset",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 1px 2px 0px, rgba(0, 0, 0, 0) 0px 4px 12px 0px",
  ],
};

export default theme;
