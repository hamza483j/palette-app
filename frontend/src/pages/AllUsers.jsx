import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const handleEdit = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editUser.id}`, editForm);
      setMessage({ type: 'success', text: '✅ Utilisateur modifié !' });
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Erreur modification' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage({ type: 'success', text: '✅ Utilisateur supprimé' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Erreur suppression' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,32,39,0.95) 0%, rgba(23,162,184,0.9) 100%), url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 32px',
        borderBottom: '3px solid #17a2b8'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: '#17a2b8', minWidth: 64 }}>
                <i className="bi bi-people text-white" style={{ fontSize: 30 }}></i>
              </div>
              <div>
                <h3 className="text-white fw-bold mb-1">Gestion des opérateurs</h3>
                <p className="text-white-50 mb-0">{users.filter(u => u.role === 'operateur').length} opérateurs actifs</p>
              </div>
            </div>
            <button className="btn text-white fw-semibold px-4 py-2"
              style={{ background: '#17a2b8', borderRadius: 10 }}
              onClick={() => navigate('/users/create')}>
              <i className="bi bi-person-plus me-2"></i>Nouvel opérateur
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {message && (
          <div className={`alert alert-${message.type} border-0 shadow-sm mb-4`} style={{ borderRadius: 12 }}>
            {message.text}
          </div>
        )}

        {/* Formulaire modification */}
        {editUser && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, borderTop: '4px solid #17a2b8' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-pencil-square me-2" style={{ color: '#17a2b8' }}></i>
                  Modifier : {editUser.name}
                </h5>
                <button className="btn btn-light btn-sm" onClick={() => setEditUser(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Nom</label>
                    <input className="form-control" value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Email</label>
                    <input type="email" className="form-control" value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Rôle</label>
                    <select className="form-select" value={editForm.role}
                      onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                      <option value="operateur">Opérateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn w-100 text-white"
                      style={{ background: '#17a2b8', borderRadius: 8 }}>
                      <i className="bi bi-check-circle me-1"></i>Enregistrer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total', value: users.length, color: '#00b894', icon: 'bi-people' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#6f42c1', icon: 'bi-shield-fill' },
            { label: 'Opérateurs', value: users.filter(u => u.role === 'operateur').length, color: '#17a2b8', icon: 'bi-person-fill' },
          ].map((s, i) => (
            <div className="col-md-4" key={i}>
              <div className="card border-0 shadow-sm" style={{ borderRadius: 12, borderTop: `4px solid ${s.color}` }}>
                <div className="card-body d-flex align-items-center p-4">
                  <i className={`bi ${s.icon} me-3`} style={{ fontSize: 32, color: s.color }}></i>
                  <div>
                    <div className="text-muted small">{s.label}</div>
                    <div className="fw-bold fs-3">{s.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="py-3">Nom</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Rôle</th>
                    <th className="py-3">Créé le</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-4">{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: 36, height: 36, background: u.role === 'admin' ? '#f0ebff' : '#e8f8f5', minWidth: 36 }}>
                            <i className="bi bi-person-fill"
                              style={{ color: u.role === 'admin' ? '#6f42c1' : '#00b894' }}></i>
                          </div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: u.role === 'admin' ? '#6f42c1' : '#17a2b8' }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm text-white px-3"
                            style={{ background: '#17a2b8', borderRadius: 8 }}
                            onClick={() => handleEdit(u)}>
                            <i className="bi bi-pencil me-1"></i>Modifier
                          </button>
                          {u.role !== 'admin' && (
                            <button className="btn btn-sm btn-outline-danger px-3"
                              style={{ borderRadius: 8 }}
                              onClick={() => handleDelete(u.id)}>
                              <i className="bi bi-trash me-1"></i>Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}