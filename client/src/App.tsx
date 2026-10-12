import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Riwayat from './pages/Riwayat';
import TitikJaga from './pages/TitikJaga';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/titik-jaga" element={<TitikJaga />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
