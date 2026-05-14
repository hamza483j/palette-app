import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function AllPalettes() {
  const [palettes, setPalettes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('all');
  const [matieres, setMatieres] = useState([]);

  useEffect(() => {
    api.get('/palettes').then(res => setPalettes(res.data));
    api.get('/matieres').then(res => setMatieres(res.data));
  }, []);

  const filtered = palettes.filter(p => {
    const matchSearch =
      p.code_barre?.toLowerCase().includes(search.toLowerCase()) ||
      p.matiere_nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.fournisseur?.toLowerCase().includes(search.toLowerCase()) ||
      p.operateur_nom?.toLowerCase().includes(search.toLowerCase());
    const matchMatiere = filterMatiere === 'all' || p.matiere_id === parseInt(filterMatiere);
    return matchSearch && matchMatiere;
  });

  const exportExcel = () => {
    const data = filtered.map(p => ({
      'Code barre': p.code_barre || '—',
      'Matière': p.matiere_nom,
      'Quantité': p.quantite,
      'Fournisseur': p.fournisseur || '—',
      'Opérateur': p.operateur_nom || '—',
      'Date': new Date(p.scan_time).toLocaleDateString('fr-FR'),
      'Heure': new Date(p.scan_time).toLocaleTimeString('fr-FR'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Palettes');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }),
      `Palettes_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`);
  };

  const today = palettes.filter(p =>
    new Date(p.scan_time).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,32,39,0.95) 0%, rgba(111,66,193,0.85) 100%), url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 32px',
        borderBottom: '3px solid #6f42c1'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: '#6f42c1', minWidth: 64 }}>
                <i className="bi bi-box-seam text-white" style={{ fontSize: 30 }}></i>
              </div>
              <div>
                <h3 className="text-white fw-bold mb-1">Toutes les palettes</h3>
                <p className="text-white-50 mb-0">{palettes.length} palettes — {today} aujourd'hui</p>
              </div>
            </div>
            <button className="btn text-white fw-semibold px-4 py-2"
              style={{ background: '#1D6F42', borderRadius: 10 }} onClick={exportExcel}>
              <i className="bi bi-file-earmark-excel me-2"></i>Exporter Excel
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Filtres */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-body p-3 d-flex gap-3 flex-wrap align-items-center">
            <div className="flex-grow-1">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input className="form-control border-start-0"
                  placeholder="Rechercher par code, matière, fournisseur, opérateur..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <select className="form-select w-auto"
              value={filterMatiere} onChange={e => setFilterMatiere(e.target.value)}>
              <option value="all">Toutes les matières</option>
              {matieres.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="py-3">Code barre</th>
                    <th className="py-3">Matière</th>
                    <th className="py-3">Quantité</th>
                    <th className="py-3">Fournisseur</th>
                    <th className="py-3">Opérateur</th>
                    <th className="py-3">Date & Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td className="px-4">{p.id}</td>
                      <td><strong>{p.code_barre || <span className="text-muted">—</span>}</strong></td>
                      <td>
                        <span className="badge px-3 py-2" style={{ background: '#e8f8f5', color: '#00b894' }}>
                          {p.matiere_nom}
                        </span>
                      </td>
                      <td><strong>{p.quantite}</strong> unités</td>
                      <td>{p.fournisseur || <span className="text-muted">—</span>}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: 32, height: 32, background: '#e8f8f5', minWidth: 32 }}>
                            <i className="bi bi-person-fill" style={{ color: '#00b894', fontSize: 14 }}></i>
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
              {filtered.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: 48 }}></i>
                  <p className="text-muted mt-2">Aucune palette trouvée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}