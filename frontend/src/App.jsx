import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Matieres from './pages/Matieres';
import AddMatiere from './pages/AddMatiere';
import AllPalettes from './pages/AllPalettes';
import AllUsers from './pages/AllUsers';
import CreateOperateur from './pages/CreateOperateur';

function PrivateRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute roles={['admin']}><Dashboard /></PrivateRoute>} />
        <Route path="/matieres" element={<PrivateRoute roles={['admin']}><Matieres /></PrivateRoute>} />
        <Route path="/matieres/add" element={<PrivateRoute roles={['admin']}><AddMatiere /></PrivateRoute>} />
        <Route path="/palettes" element={<PrivateRoute roles={['admin']}><AllPalettes /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute roles={['admin']}><AllUsers /></PrivateRoute>} />
        <Route path="/users/create" element={<PrivateRoute roles={['admin']}><CreateOperateur /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}