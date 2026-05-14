import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/matieres', label: 'Matières', icon: 'bi-boxes' },
    { path: '/palettes', label: 'Palettes', icon: 'bi-box-seam' },
    { path: '/users', label: 'Opérateurs', icon: 'bi-people' },
  ];

  return (
    <nav className="navbar navbar-expand-lg shadow-sm" style={{
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      borderBottom: '3px solid #00b894'
    }}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand text-white fw-bold d-flex align-items-center gap-2" to="/dashboard">
          <div className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 38, height: 38, background: '#00b894' }}>
            <i className="bi bi-box-seam" style={{ fontSize: 18 }}></i>
          </div>
          <span style={{ fontSize: 20 }}>PaletteApp</span>
        </Link>

        <button className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-4">
            {links.map(link => (
              <li className="nav-item" key={link.path}>
                <Link
                  className="nav-link px-3 py-2 rounded-2 mx-1 d-flex align-items-center gap-2"
                  style={{
                    background: location.pathname === link.path ? '#00b894' : 'transparent',
                    color: location.pathname === link.path ? '#fff' : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s',
                    fontWeight: location.pathname === link.path ? '600' : '400'
                  }}
                  to={link.path}
                >
                  <i className={`bi ${link.icon}`} style={{ fontSize: 14 }}></i>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32, background: '#6f42c1' }}>
                <i className="bi bi-shield-fill" style={{ fontSize: 14, color: '#fff' }}></i>
              </div>
              <div>
                <div className="text-white fw-semibold" style={{ fontSize: 13 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Administrateur</div>
              </div>
            </div>
            <button className="btn btn-sm fw-semibold px-3 py-2"
              style={{ background: 'rgba(231,76,60,0.2)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8 }}
              onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}