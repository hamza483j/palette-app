import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations frontend
    if (form.name.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email invalide');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Compte créé avec succès ! Redirection...');
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
        style={{ background: 'linear-gradient(135deg, rgba(15,32,39,0.95) 0%, rgba(44,83,100,0.9) 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">

              {/* Logo */}
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 70, height: 70, background: '#00b894' }}>
                  <i className="bi bi-person-plus text-white" style={{ fontSize: 30 }}></i>
                </div>
                <h4 className="text-white fw-bold mb-1">PaletteApp</h4>
                <p className="text-white-50 small">Créer un compte opérateur</p>
              </div>

              <div className="card border-0 shadow-lg" style={{ borderRadius: 20 }}>
                <div className="card-body p-5">
                  <h5 className="fw-bold mb-1">Inscription</h5>
                  <p className="text-muted small mb-4">Remplissez les informations ci-dessous</p>

                  {error && (
                    <div className="alert alert-danger border-0 d-flex align-items-center gap-2"
                      style={{ borderRadius: 10 }}>
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success border-0 d-flex align-items-center gap-2"
                      style={{ borderRadius: 10 }}>
                      <i className="bi bi-check-circle-fill"></i>
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Nom */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-person me-1" style={{ color: '#00b894' }}></i>
                        Nom complet
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person text-muted"></i>
                        </span>
                        <input type="text"
                          className={`form-control border-start-0 ${form.name.length > 0 && form.name.length < 2 ? 'is-invalid' : form.name.length >= 2 ? 'is-valid' : ''}`}
                          placeholder="Votre nom complet"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required />
                      </div>
                      {form.name.length > 0 && form.name.length < 2 && (
                        <small className="text-danger">Minimum 2 caractères</small>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-envelope me-1" style={{ color: '#00b894' }}></i>
                        Email
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input type="email"
                          className={`form-control border-start-0 ${form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'is-invalid' : form.email.length > 0 ? 'is-valid' : ''}`}
                          placeholder="email@exemple.com"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          required />
                      </div>
                      {form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                        <small className="text-danger">Email invalide</small>
                      )}
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-lock me-1" style={{ color: '#00b894' }}></i>
                        Mot de passe
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control border-start-0 border-end-0 ${form.password.length > 0 && form.password.length < 6 ? 'is-invalid' : form.password.length >= 6 ? 'is-valid' : ''}`}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })}
                          required />
                        <button type="button"
                          className="input-group-text bg-light border-start-0"
                          onClick={() => setShowPassword(!showPassword)}>
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                        </button>
                      </div>
                      {form.password.length > 0 && form.password.length < 6 && (
                        <small className="text-danger">Minimum 6 caractères</small>
                      )}

                      {/* Barre de force du mot de passe */}
                      {form.password.length > 0 && (
                        <div className="mt-2">
                          <div className="progress" style={{ height: 4 }}>
                            <div className="progress-bar"
                              style={{
                                width: form.password.length < 6 ? '33%' : form.password.length < 10 ? '66%' : '100%',
                                background: form.password.length < 6 ? '#e74c3c' : form.password.length < 10 ? '#f39c12' : '#00b894'
                              }}>
                            </div>
                          </div>
                          <small className="text-muted">
                            Force : {form.password.length < 6 ? '🔴 Faible' : form.password.length < 10 ? '🟡 Moyen' : '🟢 Fort'}
                          </small>
                        </div>
                      )}
                    </div>

                    <button type="submit"
                      className="btn w-100 text-white fw-semibold py-3"
                      style={{ background: 'linear-gradient(135deg, #00b894, #00cec9)', borderRadius: 12 }}
                      disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Création...</>
                      ) : (
                        <><i className="bi bi-person-check me-2"></i>Créer le compte</>
                      )}
                    </button>
                  </form>

                  <hr className="my-4" />

                  <p className="text-center text-muted small mb-0">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="fw-semibold" style={{ color: '#00b894' }}>
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-white-50 small mt-3">
                PaletteApp © 2026 — Gestion des palettes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}