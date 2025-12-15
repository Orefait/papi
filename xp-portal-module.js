import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

// ==========================================================
// LOGIQUE : Récupération de l'URL de base du composant
// ==========================================================
const scriptBaseURL = new URL('./', import.meta.url).origin; 

export class WidgetCoucou extends LitElement {
    
    static properties = {
        myTiles: { type: Array, state: true }, 
        allTiles: { type: Array, state: true },
        loading: { type: Boolean, state: true },
        filterText: { type: String, state: true },
        activeTab: { type: String, state: true } 
    };

    constructor() {
        super();
        this.myTiles = [];
        this.allTiles = [];
        this.loading = true;
        this.filterText = '';
        this.activeTab = 'apps'; 
    }

    static styles = css`
        /* 1. STYLES DU HOST et GESTION DE LA TAILLE GLOBALE */
        :host {
            display: flex; 
            flex-direction: column;
            width: 100%;  
            height: 100%; 
            min-height: 200px; 
            font-family: sans-serif;
            background-color: #000000ff;
            color: #ffffff; /* ➡️ Texte principal en blanc par défaut */
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            box-sizing: border-box; 
            --tile-border-color: #e4e4e4ff;
        }

        /* Styles du titre H3 */
        h3 {
            color: white; 
            margin-top: 0; 
            margin-bottom: 10px; 
        }

        /* ======================================= */
        /* STYLES DES ONGLETS (TABS)               */
        /* ======================================= */
        .tabs {
            display: flex;
            margin-bottom: 5px; 
            flex-shrink: 0; 
        }
        .tab-button {
            background-color: #1a1a1a; 
            color: #ddd;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-weight: bold;
            border-radius: 5px 5px 0 0;
            transition: background-color 0.2s, color 0.2s;
            margin-right: 2px;
            border: 1px solid #333; 
        }
        .tab-button.active {
            background-color: #333; 
            color: #fff; 
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
            z-index: 1; 
            border-bottom: 1px solid #333; 
        }
        .tab-content {
            flex-grow: 1; 
            overflow-y: auto;
            background-color: #1a1a1a; 
            color: #ffffff; 
            padding: 15px;
            border-radius: 0 5px 5px 5px;
            min-height: 0; 
            border: 1px solid #333;
        }
        /* ======================================= */

        /* Styles pour l'onglet "Mon Support" */
        .support-zone {
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #555; 
            border-radius: 5px;
            background-color: #2a2a2a; 
        }
        .support-zone h4 {
            color: #7b9eff; 
            margin-top: 0;
            border-bottom: 1px dashed #555;
            padding-bottom: 5px;
        }
        .contact-link {
            display: block;
            margin: 5px 0;
            color: #90ee90; 
            text-decoration: none;
        }
        /* Fin Styles Support */
        
        /* 2. CONTENEUR DE LA LISTE (Gère le défilement vertical) */
        .tile-list-container {
            flex-grow: 1; 
            overflow-y: auto; 
            padding-right: 10px; 
        }

        /* 3. BARRE DE RECHERCHE */
        .search-box {
            display: flex;
            align-items: center;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 2px 8px;
            background: #333; 
            flex-shrink: 0; 
            margin-bottom: 10px; 
        }
        .search-box input {
            border: none;
            flex-grow: 1;
            padding: 5px;
            outline: none;
            background: #333;
            color: white;
        }

        .search-box input::placeholder {
            color: #aaa;
        }
        .search-icon {
            padding-right: 8px;
            color: #aaa; 
        }

        /* 4. MISE EN PAGE DES TUILES */
        .tile-list {
            display: flex;
            flex-wrap: wrap; 
            gap: 10px; 
            padding-top: 5px;
            justify-content: flex-start;
            align-content: flex-start; 
        }
        
        .tile {
            width: 180px; 
            height: auto;
            box-sizing: border-box; 
            padding: 8px; 
            border: 1px solid #555;
            border-left: 5px solid var(--tile-border-color);
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
            background-color: #2a2a2a; 
        }

        .tile:hover {
             background-color: #3a3a3a; 
        }

        .tile-content {
            display: flex;
            align-items: center;
            min-height: 30px; 
            width: 100%;
        }
        
        .tile-icon {
            flex-shrink: 0; 
            width: 50px; 
            font-size: 2.5em; 
            text-align: center;
            margin-right: 8px;
        }

        .default-icon {
            color: #aaa; 
        }

        .tile-text {
            flex-grow: 1; 
            overflow: hidden; 
            white-space: normal;
        }

        .tile-name {
            font-weight: bold;
            color: #fff;
            margin-bottom: 2px;
            word-break: break-word; 
            line-height: 1.2;
        }
        .loading {
            font-style: italic;
            color: #aaa;
        }
        small {
            color: #aaa; 
        }
    `;

    firstUpdated() {
        this.fetchTiles('apps'); 
    }

    handleFilterInput(e) {
        this.filterText = e.target.value; 
    }
    
 
    changeTab(tabName) {
        this.activeTab = tabName;
        this.filterText = ''; 
        
        if (tabName === 'apps' && this.myTiles.length === 0) {
            this.fetchTiles('apps');
        // Charger Toutes les applications si l'onglet est activé et la liste est vide
        } else if (tabName === 'all-apps' && this.allTiles.length === 0) {
            this.fetchTiles('all-apps');
        }
    }


    async fetchTiles(type) {
        this.loading = true; 
        
        // Choisit la bonne route API : /api/my-tiles (pour 'apps') ou /api/tiles (pour 'all-apps')
        const apiPath = type === 'apps' ? '/api/my-tiles' : '/api/tiles';
        const apiURL = `${scriptBaseURL}${apiPath}`;
        
        try {
            const response = await fetch(apiURL);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json(); 
            
            // Stocke les données dans la propriété appropriée
            if (type === 'apps') {
                this.myTiles = data;
            } else {
                this.allTiles = data;
            }
            
        } catch (error) {
            console.error(`Erreur lors du chargement des tuiles (${type}):`, error);
        } finally {
            this.loading = false;
        }
    }
    
    handleTileClick(url) {
        if (url) {
            window.open(url, '_blank'); 
        }
    }
    
    // ➡️ Logique de rendu des tuiles (réutilisée pour les deux onglets d'applications)
    renderTileList(tilesSource, isMyAppsTab) {
        // Détermine la liste et la taille totale en fonction de l'onglet
        const tilesToFilter = tilesSource || [];
        // Utilise la taille de la liste non filtrée pour le compteur total
        const totalTiles = isMyAppsTab ? this.myTiles.length : this.allTiles.length;
        
        // Applique le filtre de recherche
        const query = this.filterText.toLowerCase().trim();
        const filteredTiles = tilesToFilter.filter(tile => {
            if (!query) return true;
            
            return tile.name.toLowerCase().includes(query) ||
                   tile.description.toLowerCase().includes(query);
        });
        
        // Si l'onglet actif n'a pas encore de données et charge, affiche le loading
        if (this.loading && tilesToFilter.length === 0 && (isMyAppsTab && this.activeTab === 'apps' || !isMyAppsTab && this.activeTab === 'all-apps')) {
            return html`<div class="loading">Chargement des tuiles...</div>`;
        }
        
        const showSearch = true; // Afficher la recherche pour les deux onglets

        return html`
            <h3>
                ${isMyAppsTab ? 'Cherchez et utilisez vos applications' : 'Catalogue de toutes les applications'} 
                (${filteredTiles.length} / ${totalTiles})
            </h3>
            
            ${showSearch ? html`
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Filtrer par nom ou description..."
                        .value="${this.filterText}"
                        @input="${this.handleFilterInput}"
                    >
                </div>
            ` : ''}

            <div class="tile-list-container">
                ${filteredTiles.length === 0
                    ? html`<div>Aucune application ne correspond à votre recherche.</div>`
                    : html`
                        <div class="tile-list">
                            ${filteredTiles.map(tile => html`
                                <div 
                                    class="tile" 
                                    @click="${() => this.handleTileClick(tile.url)}" 
                                    title="${tile.description}"
                                >
                                    <div class="tile-content">
                                        <div class="tile-icon">
                                            ${tile.iconURL 
                                                ? html`<span role="img" aria-label="Icône">${tile.iconURL}</span>`
                                                : html`<span class="default-icon">🗂️</span>` 
                                            }
                                        </div>
                                        <div class="tile-text">
                                            <div class="tile-name">${tile.name}</div>
                                            <small>${tile.description}</small>
                                        </div>
                                    </div>
                                </div>
                            `)}
                        </div>
                    `
                }
            </div>
        `;
    }

    renderAppsTab() {
        return this.renderTileList(this.myTiles, true);
    }
    
    renderAllAppsTab() {
        return this.renderTileList(this.allTiles, false);
    }

    renderSupportTab() {
        return html`
            <div class="support-zone">
                <h4>🔑 Mon Authentification</h4>
                <p>Votre type d'authentification préférée : **SSO/SAML**.</p>
                <p>
                    <a href="mailto:support@entreprise.com" class="contact-link">📧 Contacter le support Authentification</a>
                    <a href="tel:+33123456789" class="contact-link">📞 Appeler le support Authentification (ext. 100)</a>
                </p>
            </div>

            <div class="support-zone">
                <h4>🔗 Mes droits / Encore plus d'applications :-)</h4>
                <p>Demander un accès ou modifier vos droits existants :</p>
                <ul>
                    <li><a href="https://portal.com/request-access" target="_blank" class="contact-link">🚀 Demander une nouvelle application</a></li>
                    <li><a href="https://portal.com/manage-rights" target="_blank" class="contact-link">🔒 Gérer mes droits sur les applications existantes</a></li>
                </ul>
            </div>

            <div class="support-zone">
                <h4>💡 Mon Soutien / Mon Support Général</h4>
                <p>Pour l'aide sur le matériel, les logiciels de bureautique, la connexion réseau, etc. :</p>
                <p>
                    <a href="mailto:helpdesk@entreprise.com" class="contact-link">📧 Contacter le Soutien Général</a>
                    <a href="tel:+33123456799" class="contact-link">📞 Appeler le Soutien Technique (ext. 200)</a>
                </p>
            </div>
        `;
    }

    render() {
        return html`
            <div class="tabs">
                <button 
                    class="tab-button ${this.activeTab === 'apps' ? 'active' : ''}" 
                    @click="${() => this.changeTab('apps')}"
                >
                    Mes applications
                </button>
                <button 
                    class="tab-button ${this.activeTab === 'all-apps' ? 'active' : ''}" 
                    @click="${() => this.changeTab('all-apps')}"
                >
                    Toutes les applications
                </button>
                <button 
                    class="tab-button ${this.activeTab === 'support' ? 'active' : ''}" 
                    @click="${() => this.changeTab('support')}"
                >
                    Mon support
                </button>
            </div>
            
            <div class="tab-content">
                ${this.activeTab === 'apps' 
                    ? this.renderAppsTab() 
                    : this.activeTab === 'all-apps' 
                        ? this.renderAllAppsTab()
                        : this.renderSupportTab()
                }
            </div>
        `;
    }
}

customElements.define('widget-xp-portal', WidgetCoucou);