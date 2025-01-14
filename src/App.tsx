import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import appConfig from '@/configs/app.config'
import './locales'

const environment = process.env.NODE_ENV

import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
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
      mode: 'light', // or 'dark', depending on Tailwind's `darkMode`
      text: {
        primary: '#6b7280', // gray.500 equivalent
        secondary: '#9ca3af', // gray.400 equivalent
      },
      background: {
        default: '#ffffff',
        paper: '#f9fafb', // Tailwind's light background colors
      },
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
              backgroundColor: '#d1d5db', // Tailwind gray.300
              borderRadius: '4px',
            },
          },
        },
      },
    },
  });
  
  theme = responsiveFontSizes(theme);



function App() {
    return (
        <Provider store={store}>
            
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <Theme>
                    <ThemeProvider theme={theme}>
           
                        <Layout />
                        </ThemeProvider>
        
                    </Theme>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    )
}

export default App
