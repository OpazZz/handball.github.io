# Handball Coach v1.2 — Map Shoot

## Fonctions
- Chronomètre de match avec pause/reprise et périodes.
- Effectif, entrées/sorties et temps de jeu individuel.
- Onglet Map Shoot : toucher librement le but pour marquer la position d'impact.
- Trois résultats de tir : but, arrêt, non cadré.
- Sélection du joueur, zone de tir, commentaire facultatif.
- Statistiques globales, par joueur et par zone : tirs, buts, arrêts, non cadrés et taux de réussite.
- Historique récent avec suppression d'une saisie erronée.
- Export CSV des tirs (positions comprises).
- Sauvegarde locale et cache hors ligne.

## Tester
Les PWA nécessitent HTTPS ou localhost pour l'installation et le fonctionnement hors ligne. En local :
`python -m http.server 8000`
puis ouvrir `http://localhost:8000`.

## Installation téléphone
Déployer tous les fichiers sur un hébergement HTTPS. Android : menu Chrome > Installer/Ajouter à l'écran d'accueil. iPhone : Safari > Partager > Sur l'écran d'accueil.

## Calculs
Taux de réussite = buts / total des tirs enregistrés × 100. Les arrêts et tirs non cadrés comptent comme tentatives mais pas comme buts.
Les données restent sur l'appareil et ne sont pas synchronisées. Exporter régulièrement le CSV.
