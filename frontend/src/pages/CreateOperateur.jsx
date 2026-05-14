import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function CreateOperateur() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/create-operateur', form);
      setMessage({ type: 'success', text: '✅ Opérateur créé avec succès !' });
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erreur' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,32,39,0.95) 0%, rgba(23,162,184,0.9) 100%), url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 32px',
        borderBottom: '3px solid #17a2b8'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-4">
            <button className="btn btn-sm text-white-50 px-0"
              onClick={() => navigate('/users')}>
              <i className="bi bi-arrow-left me-1"></i>Retour
            </button>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: '#17a2b8', minWidth: 64 }}>
                <i className="bi bi-person-plus text-white" style={{ fontSize: 30 }}></i>
              </div>
              <div>
                <h3 className="text-white fw-bold mb-1">Créer un opérateur</h3>
                <p className="text-white-50 mb-0">Ajouter un nouveau compte opérateur</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            {message && (
              <div className={`alert alert-${message.type} border-0 shadow-sm mb-4`} style={{ borderRadius: 12 }}>
                {message.text}
                {message.type === 'success' && (
                  <button className="btn btn-sm ms-3 text-white"
                    style={{ background: '#17a2b8', borderRadius: 8 }}
                    onClick={() => navigate('/users')}>
                    Voir les opérateurs
                  </button>
                )}
              </div>
            )}

            <div className="card border-0 shadow-sm" style={{ borderRadius: 20, borderTop: '5px solid #17a2b8' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-person-badge me-2" style={{ color: '#17a2b8' }}></i>
                  Informations opérateur
                </h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nom complet</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input className="form-control border-start-0" placeholder="Nom de l'opérateur"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input type="email" className="form-control border-start-0" placeholder="email@exemple.com"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Mot de passe</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input type="password" className="form-control border-start-0" placeholder="••••••••"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="btn w-100 text-white fw-semibold py-3"
                    style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)', borderRadius: 12 }}
                    disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Création...</>
                      : <><i className="bi bi-person-check me-2"></i>Créer l'opérateur</>
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}