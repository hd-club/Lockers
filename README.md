# Hedo Lockers - Application React

## Structure complète de l'application

### 📁 Structure des fichiers
```
/home/user/webapp/
├── index.html
├── package.json
├── vite.config.js
├── manifest.webmanifest
├── service-worker.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── config/
│   │   └── firebase.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── FirebaseContext.jsx
│   │   └── LockerContext.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── TopBar.jsx
│   │   ├── BottomNav.jsx
│   │   ├── Drawer.jsx
│   │   ├── Kiosk.jsx
│   │   ├── Admin.jsx
│   │   └── Kiosk.css
│   └── hooks/
│       └── useQRScanner.js
```

### 🎯 Fonctionnalités
- **Kiosk**: Interface client pour scanner des QR codes et trouver des casiers
- **Admin**: Interface d'administration pour gérer les casiers
- **Authentification**: Système de connexion avec Firebase Auth
- **Base de données**: Firestore pour stocker les données des casiers
- **Scanner QR**: Utilisation de la caméra ou douchette USB
- **Cache local**: Stockage local pour performance optimale

### 🔧 Configuration Firebase
Les identifiants Firebase sont déjà configurés dans `src/config/firebase.js`

### 📱 PWA (Progressive Web App)
L'application est configurée comme PWA avec:
- Service worker
- Manifest pour installation
- Icônes et thème
- Mode hors ligne

### 🚀 Installation et lancement
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build
```

### 🔍 Vérification des erreurs

#### Erreurs corrigées:
1. **Fichier Admin.jsx manquant** ✅ Créé
2. **Composant CameraButton manquant** ✅ Supprimé de Layout
3. **Erreur de logique dans Kiosk.jsx** ✅ Corrigée (displayText ne peut pas être un élément React)
4. **Références CSS manquantes** ✅ Créées
5. **Import CSS dans App.jsx** ✅ Supprimé

#### Format React respecté:
- Composants fonctionnels avec hooks
- Props et state gérés correctement
- Context API pour l'état global
- React Router pour la navigation
- Styled-components remplacés par CSS modules

### 🎨 Styles
- Thème sombre moderne
- Couleurs: bleu primaire (#6366f1), fond sombre (#0d0f13)
- Responsive design
- Animations fluides

### 📊 Structure des données
```javascript
// Casier
{
  locker: 1,           // Numéro du casier (1-130)
  uid: "ABC123",       // UID du bracelet (optionnel)
  updatedAt: Timestamp,// Dernière mise à jour
  createdBy: "userId"  // ID de l'utilisateur créateur
}
```

### 🔐 Sécurité
- Authentification Firebase requise pour l'admin
- Vérification des permissions pour modifier/supprimer
- Validation des entrées côté client

### 🔄 Fonctionnement du scanner
1. **Mode caméra**: Utilise getUserMedia avec BarcodeDetector ou jsQR
2. **Mode douchette**: Input caché qui capture le scan clavier
3. **Vibration**: Feedback haptique lors d'un scan réussi
4. **Cache**: Recherche locale avant requête Firestore

### 📝 Notes
- Compatible avec les navigateurs modernes
- PWA installable sur mobile
- Fonctionne hors ligne avec cache
- Supporte jusqu'à 130 casiers numérotés

L'application est maintenant complète et prête à être testée!