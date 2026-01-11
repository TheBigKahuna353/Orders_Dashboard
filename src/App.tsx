
import { HashRouter, Route, Routes } from 'react-router';
import Dashboard from './Dashboard/Dashboard';
import Forecast from './Forecast/Forecast';
import { NavBar } from './NavBar/NavBar';
import useSystemTheme from './useSystemTheme';
import { ThemeProvider, createTheme } from '@mui/material';

export default function App() {

  const isDarkMode = useSystemTheme();

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
        },
    });

  return (
    <ThemeProvider theme={theme}>
      <HashRouter basename='/'>
        <NavBar />
        <Routes>
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}


