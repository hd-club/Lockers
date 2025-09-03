/* Hedo Lockers – Service Worker (GitHub Pages) */
const CACHE_NAME = "hedo-lockers-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install: pré-cache des assets de base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
});

// Activate: supprime les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: réseau-d'abord pour index.html, cache-d'abord pour le reste
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // même origine seulement (éviter d'intercepter tout le web)
  if (url.origin !== location.origin) {
    // runtime-cache "stale-while-revalidate" simple pour les CDN (ZXing/Firebase)
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        }).catch(() => hit) // offline → retourne le cache si dispo
      )
    );
    return;
  }

  const isIndex = url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");
  if (isIndex) {
    // réseau d’abord pour index (mise à jour du shell)
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    // cache d’abord pour les autres assets
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
      )
    );
  }
});
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ...

const emailInput = document.getElementById("admin-email");
const passInput  = document.getElementById("admin-pass");
const btnLogin   = document.getElementById("btn-login");
const btnLogout  = document.getElementById("btn-logout");
const authStatus = document.getElementById("auth-status");
const roleStatus = document.getElementById("role-status");

btnLogin.onclick = async ()=>{
  try {
    const email = emailInput.value.trim();
    const pass  = passInput.value.trim();
    if (!email || !pass) return alert("Email et mot de passe requis");
    await signInWithEmailAndPassword(auth, email, pass);
  } catch(e) {
    alert("Erreur connexion : " + (e.message || e));
  }
};

btnLogout.onclick = ()=> signOut(auth);

onAuthStateChanged(auth, async (user)=>{
  authStatus.textContent = user ? `Connecté: ${user.email}` : "Non connecté";
  state.uid = user ? user.uid : null;
  state.isAdmin = false;
  if (user){
    const d = await getDoc(ADMINS(user.uid));
    state.isAdmin = d.exists();
  }
  roleStatus.textContent = state.isAdmin ? "• Admin" : "";
  renderCards?.();
});