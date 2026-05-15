const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Voir tous les utilisateurs
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer opérateur par admin
router.post('/create-operateur', auth, role('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis' });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(400).json({ message: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hash, 'operateur']
    );
    res.json({ message: 'Opérateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Changer mot de passe ← AVANT /:id
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(oldPassword, rows[0].password);
    if (!valid)
      return res.status(400).json({ message: 'Ancien mot de passe incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password=? WHERE id=?', [hash, req.user.id]);
    res.json({ message: 'Mot de passe modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier utilisateur
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { name, email, role: userRole } = req.body;
    await db.query(
      'UPDATE users SET name=?, email=?, role=? WHERE id=?',
      [name, email, userRole, req.params.id]
    );
    res.json({ message: 'Utilisateur modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer utilisateur
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;