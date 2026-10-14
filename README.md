# Handball Coach — version 1.0

Application web progressive (PWA) de suivi des temps de jeu.

## Fonctionnalités
- Chronomètre du match, pause/reprise et périodes.
- Effectif modifiable avec numéro et nom.
- Entrée/sortie d'un joueur en un appui.
- Cumul individuel du temps de jeu, y compris après plusieurs rotations.
- Maximum de 7 joueurs actifs simultanément.
- Export des temps de jeu en CSV.
- Sauvegarde locale dans le navigateur.
- Cache hors ligne via Service Worker.

## Tester en local
Les PWA nécessitent HTTPS ou localhost pour l'installation et le fonctionnement hors ligne.
Depuis le dossier, lance par exemple :

```bash
python -m http.server 8000
```

Puis ouvre `http://localhost:8000`.

## Publier pour installation sur téléphone
Déploie tous les fichiers du dossier sur un hébergement HTTPS (par exemple GitHub Pages, Netlify ou un hébergement web). Sur Android, ouvre l'URL dans Chrome et choisis Installer/Ajouter à l'écran d'accueil. Sur iPhone, ouvre l'URL dans Safari, bouton Partager, puis « Sur l'écran d'accueil ».

## À savoir
- Les données sont enregistrées sur l'appareil, dans le navigateur. Elles ne sont pas synchronisées entre plusieurs appareils.
- Pour éviter de perdre les données, exporte régulièrement les temps de jeu en CSV.
- Le chrono du match est un chrono écoulé qui compte les pauses uniquement lorsque le coach appuie sur Pause.
