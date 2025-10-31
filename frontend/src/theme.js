import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '24px',
          paddingRight: '24px',
          '@media (min-width:900px)': {
            paddingLeft: '64px',
            paddingRight: '64px',
          },
          '@media (min-width:1200px)': {
            paddingLeft: '132px',
            paddingRight: '132px',
          },
        },
      },
    },
  },
});

export default theme;
