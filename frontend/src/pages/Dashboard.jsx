import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [matieres, setMatieres] = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get('/matieres').then(res => setMatieres(res.data));
    api.get('/palettes').then(res => setPalettes(res.data));
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  const today = palettes.filter(p =>
    new Date(p.scan_time).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,32,39,0.97) 0%, rgba(0,184,148,0.85) 100%), url(https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 32px',
        borderBottom: '3px solid #00b894'
      }}>
        <div className="container-fluid">
          <h3 className="text-white fw-bold mb-1">
            <i className="bi bi-speedometer2 me-2"></i>
            Tableau de bord
          </h3>
          <p className="text-white-50 mb-0">Bienvenue {user?.name} — Vue globale du système</p>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Matières', value: matieres.length, color: '#00b894', bg: '#e8f8f5', icon: 'bi-boxes' },
            { label: 'Total palettes', value: palettes.length, color: '#6f42c1', bg: '#f0ebff', icon: 'bi-box-seam' },
            { label: "Palettes aujourd'hui", value: today, color: '#f39c12', bg: '#fff3cd', icon: 'bi-calendar-day' },
            { label: 'Opérateurs', value: users.filter(u => u.role === 'operateur').length, color: '#17a2b8', bg: '#d1ecf1', icon: 'bi-people' },
          ].map((s, i) => (
            <div className="col-md-3" key={i}>
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16, borderTop: `4px solid ${s.color}` }}>
                <div className="card-body d-flex align-items-center p-4">
                  <div className="rounded-3 d-flex align-items-center justify-content-center me-3"
                    style={{ width: 56, height: 56, background: s.bg }}>
                    <i className={`bi ${s.icon}`} style={{ fontSize: 24, color: s.color }}></i>
                  </div>
                  <div>
                    <div className="text-muted small">{s.label}</div>
                    <div className="fw-bold fs-2" style={{ color: s.color }}>{s.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stock par matière */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
          <div className="card-header border-0 px-4 pt-4 pb-0" style={{ background: 'transparent' }}>
            <h5 className="fw-bold mb-0">
              <i className="bi bi-archive me-2" style={{ color: '#00b894' }}></i>
              Stock par matière
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {matieres.map(m => (
                <div className="col-md-3" key={m.id}>
                  <div className="p-4 rounded-3" style={{ background: '#f8f9fa' }}>
                    <div className="fw-bold fs-5 mb-1">{m.nom}</div>
                    <div className="fw-bold" style={{ fontSize: 32, color: '#00b894' }}>
                      {m.stock_total || 0}
                    </div>
                    <div className="text-muted small">unités en stock</div>
                    <div className="text-muted small mt-1">
                      <i className="bi bi-box-seam me-1"></i>
                      {m.total_palettes || 0} palettes total
                    </div>
                    <div className="progress mt-2" style={{ height: 6 }}>
                      <div className="progress-bar" style={{
                        width: `${Math.min((m.stock_total || 0), 100)}%`,
                        background: 'linear-gradient(135deg, #00b894, #00cec9)'
                      }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dernières palettes */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-header border-0 px-4 pt-4 pb-0" style={{ background: 'transparent' }}>
            <h5 className="fw-bold mb-0">
              <i className="bi bi-clock-history me-2" style={{ color: '#00b894' }}></i>
              Dernières palettes ajoutées
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th className="px-4 py-3">Code barre</th>
                    <th className="py-3">Matière</th>
                    <th className="py-3">Quantité</th>
                    <th className="py-3">Fournisseur</th>
                    <th className="py-3">Opérateur</th>
                    <th className="py-3">Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {palettes.slice(0, 10).map(p => (
                    <tr key={p.id}>
                      <td className="px-4"><strong>{p.code_barre || '—'}</strong></td>
                      <td><span className="badge px-3 py-2" style={{ background: '#e8f8f5', color: '#00b894' }}>{p.matiere_nom}</span></td>
                      <td>{p.quantite} unités</td>
                      <td>{p.fournisseur || '—'}</td>
                      <td><i className="bi bi-person me-1 text-muted"></i>{p.operateur_nom || '—'}</td>
                      <td>
                        <div className="fw-semibold">{new Date(p.scan_time).toLocaleDateString('fr-FR')}</div>
                        <small className="text-muted">{new Date(p.scan_time).toLocaleTimeString('fr-FR')}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {palettes.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: 48 }}></i>
                  <p className="text-muted mt-2">Aucune palette enregistrée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}