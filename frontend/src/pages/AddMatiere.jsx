import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

export default function AddMatiere() {
  const [form, setForm] = useState({ nom: '', description: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [nomMatiere, setNomMatiere] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/matieres', form);
      setQrCode(res.data.qr_code);
      setNomMatiere(form.nom);
      setMessage({ type: 'success', text: '✅ Matière créée ! QR code généré.' });
      setForm({ nom: '', description: '' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erreur' });
    }
    setLoading(false);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${nomMatiere}.png`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,32,39,0.95) 0%, rgba(0,184,148,0.85) 100%), url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 32px',
        borderBottom: '3px solid #00b894'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-4">
            <button className="btn btn-sm text-white-50 px-0"
              onClick={() => navigate('/matieres')}>
              <i className="bi bi-arrow-left me-1"></i>Retour
            </button>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: '#00b894', minWidth: 64 }}>
                <i className="bi bi-plus-circle text-white" style={{ fontSize: 30 }}></i>
              </div>
              <div>
                <h3 className="text-white fw-bold mb-1">Nouvelle matière</h3>
                <p className="text-white-50 mb-0">Créez une matière et générez son QR code</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4 justify-content-center">

          {/* Formulaire */}
          <div className="col-md-5">
            {message && (
              <div className={`alert alert-${message.type} border-0 shadow-sm mb-4`} style={{ borderRadius: 12 }}>
                {message.text}
              </div>
            )}

            <div className="card border-0 shadow-sm" style={{ borderRadius: 20, borderTop: '5px solid #00b894' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-clipboard-plus me-2" style={{ color: '#00b894' }}></i>
                  Informations matière
                </h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nom de la matière</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-box text-muted"></i>
                      </span>
                      <input className="form-control border-start-0"
                        placeholder="Ex: Lait, Sucre, Farine..."
                        value={form.nom}
                        onChange={e => setForm({ ...form, nom: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description (optionnel)</label>
                    <textarea className="form-control" rows={3}
                      placeholder="Description de la matière..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn w-100 text-white fw-semibold py-3"
                    style={{ background: 'linear-gradient(135deg, #00b894, #00cec9)', borderRadius: 12 }}
                    disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Création...</>
                      : <><i className="bi bi-plus-circle me-2"></i>Créer la matière</>
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center"
              style={{ borderRadius: 20, overflow: 'hidden', position: 'sticky', top: 20 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(15,32,39,0.95), rgba(0,184,148,0.9)), url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80)',
                backgroundSize: 'cover',
                padding: '24px'
              }}>
                <i className="bi bi-qr-code text-white" style={{ fontSize: 40 }}></i>
                <h6 className="text-white fw-bold mt-2 mb-0">QR Code Matière</h6>
                <small className="text-white-50">Fixe — ne change jamais</small>
              </div>
              <div className="card-body p-4">
                {qrCode ? (
                  <>
                    <div className="d-flex justify-content-center mb-3 p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                      <QRCodeCanvas id="qr-canvas" value={qrCode} size={200} level="H" includeMargin={true} />
                    </div>
                    <p className="fw-bold fs-5 mb-1">{nomMatiere}</p>
                    <code className="d-block small mb-4" style={{ color: '#00b894' }}>{qrCode}</code>
                    <button className="btn w-100 text-white fw-semibold py-2 mb-3"
                      style={{ background: '#0f2027', borderRadius: 10 }} onClick={downloadQR}>
                      <i className="bi bi-download me-2"></i>Télécharger & Imprimer
                    </button>
                    <button className="btn w-100 fw-semibold py-2"
                      style={{ background: '#e8f8f5', color: '#00b894', borderRadius: 10 }}
                      onClick={() => navigate('/matieres')}>
                      <i className="bi bi-arrow-left me-2"></i>Voir toutes les matières
                    </button>
                    <div className="mt-3 p-3 rounded-3 text-start" style={{ background: '#fff3cd' }}>
                      <small className="fw-semibold" style={{ color: '#856404' }}>
                        <i className="bi bi-lightbulb me-1"></i>
                        Imprimez ce QR code et collez-le au mur du poste de travail
                      </small>
                    </div>
                  </>
                ) : (
                  <div className="py-4">
                    <i className="bi bi-qr-code text-muted" style={{ fontSize: 80 }}></i>
                    <p className="text-muted mt-3 small">Le QR code apparaîtra<br />après la création</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}