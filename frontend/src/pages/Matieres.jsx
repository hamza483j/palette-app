import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

export default function Matieres() {
  const [matieres, setMatieres] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [editMatiere, setEditMatiere] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', description: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchMatieres(); }, []);

  const fetchMatieres = async () => {
    const res = await api.get('/matieres');
    setMatieres(res.data);
  };

  const handleEdit = (m) => {
    setEditMatiere(m);
    setEditForm({ nom: m.nom, description: m.description || '' });
    setMessage('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/matieres/${editMatiere.id}`, editForm);
      setMessage({ type: 'success', text: '✅ Matière modifiée !' });
      setEditMatiere(null);
      fetchMatieres();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erreur' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette matière ?')) return;
    try {
      await api.delete(`/matieres/${id}`);
      setMessage({ type: 'success', text: '✅ Matière supprimée !' });
      fetchMatieres();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Erreur suppression' });
    }
  };

  const downloadQR = (qr_code, nom) => {
    const canvas = document.getElementById(`qr-${qr_code}`);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${nom}.png`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,32,39,0.95) 0%, rgba(0,184,148,0.85) 100%), url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 32px',
        borderBottom: '3px solid #00b894'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: '#00b894', minWidth: 64 }}>
                <i className="bi bi-boxes text-white" style={{ fontSize: 30 }}></i>
              </div>
              <div>
                <h3 className="text-white fw-bold mb-1">Gestion des matières</h3>
                <p className="text-white-50 mb-0">{matieres.length} matières enregistrées</p>
              </div>
            </div>
            <button className="btn text-white fw-semibold px-4 py-2"
              style={{ background: '#00b894', borderRadius: 10 }}
              onClick={() => navigate('/matieres/add')}>
              <i className="bi bi-plus-circle me-2"></i>Nouvelle matière
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
        {editMatiere && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, borderTop: '4px solid #00b894' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-pencil-square me-2" style={{ color: '#00b894' }}></i>
                  Modifier : {editMatiere.nom}
                </h5>
                <button className="btn btn-light btn-sm" onClick={() => setEditMatiere(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Nom</label>
                    <input className="form-control" value={editForm.nom}
                      onChange={e => setEditForm({ ...editForm, nom: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Description</label>
                    <input className="form-control" value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn w-100 text-white"
                      style={{ background: '#00b894', borderRadius: 8 }}>
                      <i className="bi bi-check-circle me-1"></i>Enregistrer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Liste matières */}
          <div className={selectedQR ? 'col-md-8' : 'col-12'}>
            <div className="row g-3">
              {matieres.map(m => (
                <div className="col-md-4" key={m.id}>
                  <div className="card border-0 shadow-sm h-100"
                    style={{ borderRadius: 16, borderTop: '4px solid #00b894' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="fw-bold mb-1">{m.nom}</h5>
                          <small className="text-muted">{m.description || 'Aucune description'}</small>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40, background: '#e8f8f5', minWidth: 40 }}>
                          <i className="bi bi-box" style={{ color: '#00b894' }}></i>
                        </div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="p-2 rounded-3" style={{ background: '#f8f9fa' }}>
                            <small className="text-muted d-block">Stock total</small>
                            <strong style={{ color: '#00b894' }}>{m.stock_total || 0} unités</strong>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2 rounded-3" style={{ background: '#f8f9fa' }}>
                            <small className="text-muted d-block">Palettes</small>
                            <strong style={{ color: '#6f42c1' }}>{m.total_palettes || 0}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-3 mb-3" style={{ background: '#f8f9fa' }}>
                        <small className="text-muted d-block mb-1">QR Code</small>
                        <code style={{ fontSize: 11 }}>{m.qr_code}</code>
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-sm text-white flex-grow-1"
                          style={{ background: '#00b894', borderRadius: 8 }}
                          onClick={() => setSelectedQR(selectedQR?.id === m.id ? null : m)}>
                          <i className="bi bi-qr-code me-1"></i>QR
                        </button>
                        <button className="btn btn-sm text-white"
                          style={{ background: '#17a2b8', borderRadius: 8 }}
                          onClick={() => handleEdit(m)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger"
                          style={{ borderRadius: 8 }}
                          onClick={() => handleDelete(m.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {matieres.length === 0 && (
                <div className="col-12">
                  <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: 16 }}>
                    <i className="bi bi-boxes text-muted" style={{ fontSize: 64 }}></i>
                    <p className="text-muted mt-3">Aucune matière créée</p>
                    <button className="btn text-white px-4"
                      style={{ background: '#00b894', borderRadius: 10 }}
                      onClick={() => navigate('/matieres/add')}>
                      <i className="bi bi-plus-circle me-2"></i>Créer une matière
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Panel */}
          {selectedQR && (
            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center"
                style={{ borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 20 }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15,32,39,0.95), rgba(0,184,148,0.9)), url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80)',
                  backgroundSize: 'cover',
                  padding: '24px'
                }}>
                  <i className="bi bi-qr-code text-white" style={{ fontSize: 40 }}></i>
                  <h5 className="text-white fw-bold mt-2 mb-0">{selectedQR.nom}</h5>
                  <small className="text-white-50">QR code fixe — ne change pas</small>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-center mb-3 p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                    <QRCodeCanvas
                      id={`qr-${selectedQR.qr_code}`}
                      value={selectedQR.qr_code}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <code className="d-block mb-3 small" style={{ color: '#00b894' }}>{selectedQR.qr_code}</code>
                  <button className="btn w-100 text-white fw-semibold py-2 mb-3"
                    style={{ background: '#0f2027', borderRadius: 10 }}
                    onClick={() => downloadQR(selectedQR.qr_code, selectedQR.nom)}>
                    <i className="bi bi-download me-2"></i>Télécharger & Imprimer
                  </button>
                  <div className="p-3 rounded-3 text-start" style={{ background: '#fff3cd' }}>
                    <small className="fw-semibold" style={{ color: '#856404' }}>
                      <i className="bi bi-lightbulb me-1"></i>
                      Imprimez ce QR code et collez-le au mur du poste de travail
                    </small>
                  </div>
                  <button className="btn btn-light w-100 mt-2" style={{ borderRadius: 10 }}
                    onClick={() => setSelectedQR(null)}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}