import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Comprehensive theme for healthcare application
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    health: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary healthcare blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Additional healthcare-specific colors
    medical: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    lab: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    pharmacy: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
    '3': '.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  breakpoints: {
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  sizes: {
    max: 'max-content',
    min: 'min-content',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '90rem',
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  components: {
    // Button component customization
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
        _focus: {
          boxShadow: 'outline',
        },
      },
      sizes: {
        lg: {
          fontSize: 'lg',
          px: 8,
          py: 4,
          borderRadius: 'xl',
        },
        md: {
          fontSize: 'md',
          px: 6,
          py: 3,
          borderRadius: 'lg',
        },
        sm: {
          fontSize: 'sm',
          px: 4,
          py: 2,
          borderRadius: 'md',
        },
      },
      variants: {
        solid: {
          bg: 'health.500',
          color: 'white',
          _hover: {
            bg: 'health.600',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'health.700',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'health.500',
          color: 'health.500',
          _hover: {
            bg: 'health.50',
            borderColor: 'health.600',
          },
        },
        ghost: {
          color: 'health.500',
          _hover: {
            bg: 'health.50',
          },
        },
      },
      defaultProps: {
        size: 'md',
        variant: 'solid',
        colorScheme: 'health',
      },
    },
    // Input component customization
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
          _focus: {
            borderColor: 'health.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-health-500)',
          },
        },
      },
      sizes: {
        lg: {
          field: {
            fontSize: 'lg',
            px: 4,
            py: 3,
            borderRadius: 'xl',
          },
        },
        md: {
          field: {
            fontSize: 'md',
            px: 3,
            py: 2,
            borderRadius: 'lg',
          },
        },
        sm: {
          field: {
            fontSize: 'sm',
            px: 2,
            py: 1,
            borderRadius: 'md',
          },
        },
      },
      defaultProps: {
        size: 'md',
        focusBorderColor: 'health.500',
      },
    },
    // Select component customization
    Select: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
          _focus: {
            borderColor: 'health.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-health-500)',
          },
        },
      },
      defaultProps: {
        focusBorderColor: 'health.500',
      },
    },
    // Textarea component customization
    Textarea: {
      baseStyle: {
        borderRadius: 'lg',
        _focus: {
          borderColor: 'health.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-health-500)',
        },
      },
      defaultProps: {
        focusBorderColor: 'health.500',
      },
    },
    // Card component customization
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'base',
          _hover: {
            boxShadow: 'lg',
          },
          transition: 'all 0.2s',
        },
        header: {
          px: 6,
          py: 4,
          borderBottom: '1px solid',
          borderColor: 'gray.200',
        },
        body: {
          px: 6,
          py: 4,
        },
      },
      variants: {
        elevated: {
          container: {
            boxShadow: 'lg',
            _hover: {
              boxShadow: 'xl',
            },
          },
        },
        outline: {
          container: {
            border: '1px solid',
            borderColor: 'gray.200',
            boxShadow: 'none',
          },
        },
      },
      defaultProps: {
        variant: 'elevated',
      },
    },
    // Table component customization
    Table: {
      baseStyle: {
        table: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        th: {
          fontWeight: 'semibold',
          textTransform: 'none',
          letterSpacing: 'normal',
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          bg: 'gray.50',
          py: 3,
          px: 4,
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.100',
          py: 3,
          px: 4,
        },
      },
    },
    // Modal component customization
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
          boxShadow: '2xl',
        },
        header: {
          px: 6,
          py: 4,
          borderBottom: '1px solid',
          borderColor: 'gray.200',
        },
        body: {
          px: 6,
          py: 4,
        },
        footer: {
          px: 6,
          py: 4,
          borderTop: '1px solid',
          borderColor: 'gray.200',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        fontFamily: 'body',
        lineHeight: 'base',
      },
      html: {
        scrollBehavior: 'smooth',
      },
      '*': {
        borderColor: 'gray.200',
      },
      '::selection': {
        bg: 'health.100',
        color: 'health.800',
      },
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'gray.100',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'gray.300',
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: 'gray.400',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export function ChakraUIProvider({ children }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}

export default theme;
