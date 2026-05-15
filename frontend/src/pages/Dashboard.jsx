import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

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

  // Données pour graphique par matière
  const dataByMatiere = matieres.map(m => ({
    name: m.nom,
    stock: m.stock_total || 0,
    palettes: m.total_palettes || 0
  }));

  // Données pour graphique par jour (7 derniers jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const count = palettes.filter(p =>
      new Date(p.scan_time).toDateString() === dateStr
    ).length;
    return {
      jour: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      palettes: count
    };
  });

  // Données pour graphique camembert
  const pieData = matieres.map(m => ({
    name: m.nom,
    value: m.total_palettes || 0
  })).filter(m => m.value > 0);

  const COLORS = ['#00b894', '#6f42c1', '#f39c12', '#e74c3c', '#17a2b8', '#fd7e14'];

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

        {/* Stats cards */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Matières', value: matieres.length, color: '#00b894', bg: '#e8f8f5', icon: 'bi-boxes' },
            { label: 'Total palettes', value: palettes.length, color: '#6f42c1', bg: '#f0ebff', icon: 'bi-box-seam' },
            { label: "Aujourd'hui", value: today, color: '#f39c12', bg: '#fff3cd', icon: 'bi-calendar-day' },
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

        {/* Graphiques */}
        <div className="row g-4 mb-4">

          {/* Graphique palettes par jour */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-header border-0 px-4 pt-4 pb-0" style={{ background: 'transparent' }}>
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-bar-chart me-2" style={{ color: '#00b894' }}></i>
                  Palettes scannées — 7 derniers jours
                </h5>
              </div>
              <div className="card-body p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} palettes`, 'Scannées']}
                    />
                    <Bar dataKey="palettes" fill="#00b894" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Camembert répartition matières */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-header border-0 px-4 pt-4 pb-0" style={{ background: 'transparent' }}>
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-pie-chart me-2" style={{ color: '#6f42c1' }}></i>
                  Répartition par matière
                </h5>
              </div>
              <div className="card-body p-4">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} palettes`]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-pie-chart text-muted" style={{ fontSize: 48 }}></i>
                    <p className="text-muted mt-2 small">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique stock par matière */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
          <div className="card-header border-0 px-4 pt-4 pb-0" style={{ background: 'transparent' }}>
            <h5 className="fw-bold mb-0">
              <i className="bi bi-graph-up me-2" style={{ color: '#f39c12' }}></i>
              Stock par matière
            </h5>
          </div>
          <div className="card-body p-4">
            {dataByMatiere.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataByMatiere} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value, name) => [value, name === 'stock' ? 'Stock total' : 'Palettes']}
                  />
                  <Bar dataKey="stock" fill="#00b894" radius={[0, 6, 6, 0]} name="stock" />
                  <Bar dataKey="palettes" fill="#6f42c1" radius={[0, 6, 6, 0]} name="palettes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-graph-up text-muted" style={{ fontSize: 48 }}></i>
                <p className="text-muted mt-2">Aucune données disponibles</p>
              </div>
            )}
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
                    <th className="py-3">Date & Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {palettes.slice(0, 10).map(p => (
                    <tr key={p.id}>
                      <td className="px-4"><strong>{p.code_barre || '—'}</strong></td>
                      <td>
                        <span className="badge px-3 py-2" style={{ background: '#e8f8f5', color: '#00b894' }}>
                          {p.matiere_nom}
                        </span>
                      </td>
                      <td><strong>{p.quantite}</strong> unités</td>
                      <td>{p.fournisseur || '—'}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: 28, height: 28, background: '#e8f8f5', minWidth: 28 }}>
                            <i className="bi bi-person-fill" style={{ color: '#00b894', fontSize: 12 }}></i>
                          </div>
                          {p.operateur_nom || '—'}
                        </div>
                      </td>
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