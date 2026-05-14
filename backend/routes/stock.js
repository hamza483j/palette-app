const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Voir tout le stock
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, m.nom as matiere_nom
       FROM stock s
       LEFT JOIN matieres m ON s.matiere_id = m.id
       ORDER BY m.nom`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;