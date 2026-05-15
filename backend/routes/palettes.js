const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const db = require('../config/db');

// Palettes de l'opérateur connecté ← DOIT ÊTRE EN PREMIER
router.get('/my-palettes', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, m.nom as matiere_nom
       FROM palettes p
       LEFT JOIN matieres m ON p.matiere_id = m.id
       WHERE p.operateur_id = ?
       ORDER BY p.scan_time DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Palettes aujourd'hui de l'opérateur connecté
router.get('/my-palettes/today', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, m.nom as matiere_nom
       FROM palettes p
       LEFT JOIN matieres m ON p.matiere_id = m.id
       WHERE p.operateur_id = ? AND DATE(p.scan_time) = CURDATE()
       ORDER BY p.scan_time DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Palettes par matière
router.get('/matiere/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name as operateur_nom
       FROM palettes p
       LEFT JOIN users u ON p.operateur_id = u.id
       WHERE p.matiere_id = ?
       ORDER BY p.scan_time DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Palettes d'une matière aujourd'hui
router.get('/matiere/:id/today', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name as operateur_nom
       FROM palettes p
       LEFT JOIN users u ON p.operateur_id = u.id
       WHERE p.matiere_id = ? AND DATE(p.scan_time) = CURDATE()
       ORDER BY p.scan_time DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter une palette
router.post('/', auth, async (req, res) => {
  try {
    const { code_barre, matiere_id, quantite, fournisseur, date_entree } = req.body;
    if (!matiere_id || !quantite)
      return res.status(400).json({ message: 'Matière et quantité sont requis' });

    await db.query(
      'INSERT INTO palettes (code_barre, matiere_id, quantite, fournisseur, date_entree, operateur_id) VALUES (?,?,?,?,?,?)',
      [code_barre, matiere_id, quantite, fournisseur, date_entree, req.user.id]
    );

    await db.query(
      `INSERT INTO stock (matiere_id, total_quantite)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE total_quantite = total_quantite + VALUES(total_quantite)`,
      [matiere_id, quantite]
    );

    res.json({ message: 'Palette ajoutée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Voir toutes les palettes (admin)
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, m.nom as matiere_nom, u.name as operateur_nom
       FROM palettes p
       LEFT JOIN matieres m ON p.matiere_id = m.id
       LEFT JOIN users u ON p.operateur_id = u.id
       ORDER BY p.scan_time DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier palette
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { code_barre, matiere_id, quantite, fournisseur, date_entree } = req.body;
    await db.query(
      'UPDATE palettes SET code_barre=?, matiere_id=?, quantite=?, fournisseur=?, date_entree=? WHERE id=?',
      [code_barre, matiere_id, quantite, fournisseur, date_entree, req.params.id]
    );
    res.json({ message: 'Palette modifiée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer palette
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM palettes WHERE id=?', [req.params.id]);
    res.json({ message: 'Palette supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;