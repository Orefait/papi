const http = require('http');
const fs = require('fs');
const path = require('path');

// ==========================================================
// 🚀 NOUVELLE GESTION DE L'ENVIRONNEMENT (Local vs. Render)
// ==========================================================

// 1. DÉFINITION DU PORT : Utilise process.env.PORT pour Render ou 8080 en local.
const PORT = process.env.PORT || 8080;

// 2. DÉFINITION DE L'HÔTE : Utilise '0.0.0.0' pour écouter toutes les interfaces 
//    (requis par Render) ou '127.0.0.1' pour forcer le local si besoin.
//    NOTE: '0.0.0.0' fonctionne généralement bien pour les deux.
const HOST = process.env.PORT ? '0.0.0.0' : '127.0.0.1'; 

const directory = __dirname;
// --- NOUVEAUX CHEMINS ---
const TILES_API_PATH = '/api/tiles';
const TILES_JSON_FILE = path.join(__dirname, 'tiles.json');
// -------------------------

const server = http.createServer((req, res) => {
    // 1. GESTION CORS (CRITIQUE pour l'injection sur un site tiers HTTPS)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Vérifie si la requête est l'appel à l'API des tuiles
    if (req.url.split('?')[0] === TILES_API_PATH) {
        fs.readFile(TILES_JSON_FILE, (error, content) => {
            if (error) {
                // Erreur de lecture du fichier de données
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Fichier de données ${path.basename(TILES_JSON_FILE)} non trouvé ou illisible.` }));
                return;
            }
            // Succès: Envoi des données JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content, 'utf-8');
        });
        return; // Arrête le traitement pour cette requête
    }

    // 2. LOGIQUE EXISTANTE (Sert les fichiers statiques .js, .html, etc.)
    
    // On enlève les éventuels paramètres de requête
    let filePath = path.join(directory, req.url.split('?')[0]);
    
    if (filePath.endsWith('/')) {
        filePath += 'index.html'; 
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    let contentType = 'text/html';

    const mimeTypes = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.html': 'text/html'
    };


    contentType = mimeTypes[extname] || 'application/octet-stream';
        if (filePath.endsWith('G3R0C3')) {
         contentType = 'application/javascript'; 
    }

    // 3. LECTURE ET ENVOI DU FICHIER STATIQUE
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end(`Fichier non trouvé: ${req.url}`);
            } else {
                res.writeHead(500);
                res.end('Erreur serveur: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});


server.listen(PORT, HOST, () => {
    // Si l'hôte est '0.0.0.0', on affiche 'localhost' pour la clarté en local
    const displayHost = (HOST === '0.0.0.0' && !process.env.PORT) ? 'localhost' : HOST;
    
    console.log(`✅ Serveur Node.js démarré sur http://${displayHost}:${PORT}`);
    console.log(`   (Hôte d'écoute réel: ${HOST})`);
    console.log(`   API Tuiles accessible via http://${displayHost}:${PORT}${TILES_API_PATH}`);
});