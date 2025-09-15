import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import PublicVisualizer from './views/auth/publicView/PublicVisualizer'
import appConfig from '@/configs/app.config'
import './locales'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { useAppSelector } from '@/store'
import { THEME_ENUM } from '@/constants/theme.constant'

const buildMuiTheme = (mode: 'light' | 'dark') =>
  createTheme({
  typography: {
    fontFamily: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ].join(','), // Combine all into a single string
  },
  breakpoints: {
    values: {
      xs: 576, // Tailwind's custom xs screen
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      // xxl: 1536, // '2xl' in Tailwind
    },
  },
  palette: {
    mode,
    text: mode === 'dark'
      ? { primary: '#e5e7eb', secondary: '#9ca3af' }
      : { primary: '#6b7280', secondary: '#9ca3af' },
    background: mode === 'dark'
      ? { default: '#111827', paper: '#1f2937' }
      : { default: '#ffffff', paper: '#f9fafb' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'dark' ? '#4b5563' : '#d1d5db',
            borderRadius: '4px',
          },
        },
      },
    },
    // Ensure MUI Table headers obey dark mode similar to Tailwind table styles
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: mode === 'dark' ? '#f3f4f6' : '#6b7280',
          fontWeight: 600,
          textTransform: 'uppercase',
        },
      },
    },
    // Make row hover subtle and readable across the app
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover > *': {
            backgroundColor: mode === 'dark' ? 'rgba(55, 65, 81, 0.10)' : 'rgba(243, 244, 246, 0.10)',
          },
        },
      },
    },
  },
});



function InnerApp() {
  const mode = useAppSelector((state) => state.theme.mode)
  const muiMode: 'light' | 'dark' = mode === THEME_ENUM.MODE_DARK ? 'dark' : 'light'
  let theme = buildMuiTheme(muiMode)
  theme = responsiveFontSizes(theme)
  return (
    <Theme>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/publicView" element={<PublicVisualizer />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </ThemeProvider>
    </Theme>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <InnerApp />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

export default App