import { createTheme } from '@mui/material';

export const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // Brand blue
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#dc004e', // Accent pink
        contrastText: '#ffffff'
      },
      error: {
        main: '#ff4444',  // Alert red
        light: '#ff7777',
        dark: '#cc0000'
      },
      warning: {
        main: '#ffbb33',  // Warning yellow
        light: '#ffcc66',
        dark: '#cc9900'
      },
      success: {
        main: '#00C851',  // Success green
        light: '#33d975',
        dark: '#009f40'
      },
      info: {
        main: '#2196f3',  // Info blue
        light: '#54aff7',
        dark: '#0c7cd5'
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff'
      },
      text: {
        primary: '#000000',
        secondary: '#616161'
      }
    }
  });