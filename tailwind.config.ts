/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          '50': 'hsl(6, 94%, 97%)',
          '100': 'hsl(6, 94%, 94%)',
          '200': 'hsl(6, 94%, 86%)',
          '300': 'hsl(6, 94%, 76%)',
          '400': 'hsl(6, 94%, 64%)',
          '500': 'hsl(6, 94%, 50%)',
          '600': 'hsl(6, 94%, 40%)',
          '700': 'hsl(6, 94%, 32%)',
          '800': 'hsl(6, 94%, 24%)',
          '900': 'hsl(6, 94%, 16%)',
          '950': 'hsl(6, 94%, 10%)',
          DEFAULT: '#f95c4b'
        },
        secondary: {
          '50': 'hsl(3, 73%, 97%)',
          '100': 'hsl(3, 73%, 94%)',
          '200': 'hsl(3, 73%, 86%)',
          '300': 'hsl(3, 73%, 76%)',
          '400': 'hsl(3, 73%, 64%)',
          '500': 'hsl(3, 73%, 50%)',
          '600': 'hsl(3, 73%, 40%)',
          '700': 'hsl(3, 73%, 32%)',
          '800': 'hsl(3, 73%, 24%)',
          '900': 'hsl(3, 73%, 16%)',
          '950': 'hsl(3, 73%, 10%)',
          DEFAULT: '#ee9590'
        },
        accent: {
          '50': 'hsl(47, 26%, 97%)',
          '100': 'hsl(47, 26%, 94%)',
          '200': 'hsl(47, 26%, 86%)',
          '300': 'hsl(47, 26%, 76%)',
          '400': 'hsl(47, 26%, 64%)',
          '500': 'hsl(47, 26%, 50%)',
          '600': 'hsl(47, 26%, 40%)',
          '700': 'hsl(47, 26%, 32%)',
          '800': 'hsl(47, 26%, 24%)',
          '900': 'hsl(47, 26%, 16%)',
          '950': 'hsl(47, 26%, 10%)',
          DEFAULT: '#f2f0e9'
        },
        'neutral-50': '#e5e7eb',
        'neutral-100': '#181619',
        'neutral-200': '#ffffff',
        'neutral-300': '#403b42',
        background: '#f2f0e9',
        foreground: '#181619'
      },
      fontFamily: {
        body: [
          'Manrope',
          'sans-serif'
        ],
        heading: [
          'Zalando Sans SemiExpanded',
          'sans-serif'
        ]
      },
      fontSize: {
        '10': [
          '10px',
          {
            lineHeight: '10px'
          }
        ],
        '11': [
          '11px',
          {
            lineHeight: '14.3px',
            letterSpacing: '0.11px'
          }
        ],
        '12': [
          '12px',
          {
            lineHeight: '12px',
            letterSpacing: '0.6px'
          }
        ],
        '13': [
          '13px',
          {
            lineHeight: '19.5px'
          }
        ],
        '14': [
          '14px',
          {
            lineHeight: '19.04px'
          }
        ],
        '16': [
          '16px',
          {
            lineHeight: '22px'
          }
        ],
        '18': [
          '18px',
          {
            lineHeight: '24.3px'
          }
        ],
        '20': [
          '20px',
          {
            lineHeight: '27px'
          }
        ],
        '24': [
          '24px',
          {
            lineHeight: '28.56px'
          }
        ],
        '30': [
          '30px',
          {
            lineHeight: '35.7px'
          }
        ],
        '48': [
          '48px',
          {
            lineHeight: '55.68px'
          }
        ],
        '52': [
          '52px',
          {
            lineHeight: '52px'
          }
        ],
        '57': [
          '57px',
          {
            lineHeight: '65.55px'
          }
        ],
        '69': [
          '69px',
          {
            lineHeight: '75.9px'
          }
        ],
        '104': [
          '104px',
          {
            lineHeight: '92.56px',
            letterSpacing: '-10.4px'
          }
        ]
      },
      spacing: {
        '20': '80px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '48': '192px',
        '52': '208px',
        '80': '320px',
        '100': '400px',
        '112': '448px',
        '1px': '1px',
        '311px': '311px'
      },
      borderRadius: {
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px'
      },
      boxShadow: {
        xs: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 1px 2px 0px, rgba(0, 0, 0, 0) 0px 4px 12px 0px',
        sm: 'rgba(249, 94, 77, 0.3) 0px 0px 40px 0px'
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '1450px': '1450px',
        '2xl': '1536px'
      },
      transitionDuration: {
        '100': '0.1s',
        '200': '0.2s',
        '220': '0.22s',
        '250': '0.25s',
        '300': '0.3s',
        '350': '0.35s',
        '400': '0.4s',
        '450': '0.45s',
        '500': '0.5s',
        '550': '0.55s',
        '600': '0.6s',
        '700': '0.7s'
      },
      transitionTimingFunction: {
        custom: 'cubic-bezier(0.34, 1.7, 0.64, 1)',
        default: 'ease'
      },
      container: {
        center: true,
        padding: '40px'
      },
      maxWidth: {
        container: '1520px'
      }
    },
  },
};
