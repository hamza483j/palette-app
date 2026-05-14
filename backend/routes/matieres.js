const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Voir toutes les matières
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, 
       COALESCE(s.total_quantite, 0) as stock_total,
       COUNT(p.id) as total_palettes
       FROM matieres m
       LEFT JOIN stock s ON m.id = s.matiere_id
       LEFT JOIN palettes p ON m.id = p.matiere_id
       GROUP BY m.id
       ORDER BY m.nom`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Voir une matière par QR code
router.get('/qr/:qr_code', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, 
       COALESCE(s.total_quantite, 0) as stock_total,
       COUNT(p.id) as total_palettes
       FROM matieres m
       LEFT JOIN stock s ON m.id = s.matiere_id
       LEFT JOIN palettes p ON m.id = p.matiere_id
       WHERE m.qr_code = ?
       GROUP BY m.id`,
      [req.params.qr_code]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Matière introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer une matière
router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const { nom, description } = req.body;
    if (!nom)
      return res.status(400).json({ message: 'Nom requis' });

    const qr_code = `MAT-${nom.toUpperCase().replace(/\s/g, '-')}-${uuidv4().slice(0, 8)}`;

    await db.query(
      'INSERT INTO matieres (nom, description, qr_code) VALUES (?,?,?)',
      [nom, description, qr_code]
    );
    res.json({ message: 'Matière créée avec succès', qr_code });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Modifier une matière
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { nom, description } = req.body;
    await db.query(
      'UPDATE matieres SET nom=?, description=? WHERE id=?',
      [nom, description, req.params.id]
    );
    res.json({ message: 'Matière modifiée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une matière
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM matieres WHERE id=?', [req.params.id]);
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;