# 📦 PaletteApp — Application de Gestion des Palettes

Application complète de gestion et traçabilité des palettes pour une entreprise agroalimentaire.

## 🏗️ Architecture

palette-app/
├── backend/     → Node.js + Express + MySQL
├── frontend/    → React.js + Bootstrap (Admin Web)
└── mobile/      → React Native + Expo (Opérateur & Admin terrain)

## 👥 Utilisateurs

| Rôle | Plateforme | Accès |
|------|------------|-------|
| Admin | Web + Mobile | Gestion complète |
| Opérateur | Mobile | Scan palettes |

## ✨ Fonctionnalités

### 💻 Application Web (Admin)
- Créer et gérer les matières avec QR code automatique
- Dashboard avec statistiques en temps réel
- Gestion des opérateurs
- Export Excel des palettes

### 📱 Application Mobile (Opérateur)
- Scan code barre palette
- Sélection de la matière depuis une liste
- Historique des palettes scannées

### 📱 Application Mobile (Admin terrain)
- Scan QR code matière
- Voir les statistiques en temps réel
- Mode opérateur disponible

## 🛠️ Technologies

- **Backend** : Node.js, Express.js, MySQL, JWT
- **Frontend** : React.js, Bootstrap, Vite
- **Mobile** : React Native, Expo

## 🚀 Installation

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npx expo start
```

## 📊 Base de données

Tables principales :
- `users` — Administrateurs et opérateurs
- `matieres` — Matières avec QR codes
- `palettes` — Palettes enregistrées
- `stock` — Stock par matière