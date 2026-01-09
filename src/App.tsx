
import { HashRouter, Route, Routes } from 'react-router';
import Dashboard from './Dashboard/Dashboard';
import Forecast from './Forecast/Forecast';

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );



}
export default App
