import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'admin') navigate('/dashboard');
      else navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="min-vh-100 w-100 d-flex align-items-center"
        style={{ background: 'linear-gradient(135deg, rgba(15,32,39,0.92) 0%, rgba(44,83,100,0.85) 100%)' }}>
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 text-white mb-5 mb-md-0">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 60, height: 60, background: '#00b894' }}>
                  <i className="bi bi-box-seam" style={{ fontSize: 28 }}></i>
                </div>
                <h1 className="fw-bold mb-0" style={{ fontSize: 36 }}>PaletteApp</h1>
              </div>
              <h2 className="fw-bold mb-3" style={{ fontSize: 28, lineHeight: 1.3 }}>
                Gestion & Traçabilité<br />des Palettes
              </h2>
              <p className="text-white-50 mb-4" style={{ fontSize: 16, lineHeight: 1.8 }}>
                Système professionnel de gestion des entrées de palettes,
                scan QR code en temps réel et suivi du stock.
              </p>
              <div className="d-flex gap-4">
                {[
                  { icon: '📱', label: 'Mobile' },
                  { icon: '💻', label: 'Web' },
                  { icon: '⚡', label: 'Temps réel' },
                  { icon: '📊', label: 'Statistiques' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div style={{ fontSize: 24 }}>{item.icon}</div>
                    <small className="text-white-50">{item.label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-lg" style={{ borderRadius: 20 }}>
                <div className="card-body p-5">
                  <h4 className="fw-bold mb-1">Connexion Admin</h4>
                  <p className="text-muted small mb-4">Accédez à votre espace de gestion</p>

                  {error && (
                    <div className="alert alert-danger border-0" style={{ borderRadius: 10 }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input type="email" className="form-control border-start-0"
                          placeholder="exemple@email.com"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-semibold small">Mot de passe</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input type="password" className="form-control border-start-0"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })} required />
                      </div>
                    </div>
                    <button type="submit" className="btn w-100 text-white fw-semibold py-3"
                      style={{ background: 'linear-gradient(135deg, #00b894, #00cec9)', borderRadius: 12 }}
                      disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</>
                        : <><i className="bi bi-box-arrow-in-right me-2"></i>Se connecter</>
                      }
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}