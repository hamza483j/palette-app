import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Compte créé ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur inscription');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="min-vh-100 w-100 d-flex align-items-center"
        style={{ background: 'linear-gradient(135deg, rgba(15,32,39,0.92) 0%, rgba(44,83,100,0.85) 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card border-0 shadow-lg" style={{ borderRadius: 20 }}>
                <div className="card-body p-5">
                  <h4 className="fw-bold mb-1">Inscription Opérateur</h4>
                  <p className="text-muted small mb-4">Créer un compte opérateur</p>

                  {error && <div className="alert alert-danger border-0" style={{ borderRadius: 10 }}>{error}</div>}
                  {success && <div className="alert alert-success border-0" style={{ borderRadius: 10 }}>{success}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Nom</label>
                      <input type="text" className="form-control" placeholder="Votre nom"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Email</label>
                      <input type="email" className="form-control" placeholder="email@exemple.com"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-semibold small">Mot de passe</label>
                      <input type="password" className="form-control" placeholder="••••••••"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn w-100 text-white fw-semibold py-3"
                      style={{ background: 'linear-gradient(135deg, #00b894, #00cec9)', borderRadius: 12 }}
                      disabled={loading}>
                      {loading ? 'Création...' : "Créer le compte"}
                    </button>
                  </form>

                  <hr className="my-4" />
                  <p className="text-center text-muted small mb-0">
                    <Link to="/login" style={{ color: '#00b894' }}>← Retour connexion</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}