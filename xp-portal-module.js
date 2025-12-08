import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class WidgetCoucou extends LitElement {
    
    static properties = {
        tiles: { type: Array, state: true }, 
        loading: { type: Boolean, state: true },
        filterText: { type: String, state: true }
    };

    constructor() {
        super();
        this.tiles = [];
        this.loading = true;
        this.filterText = '';
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
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            box-sizing: border-box; 
            --tile-border-color: #e4e4e4ff;
        }

        /* 2. CONTENEUR DE LA LISTE (Gère le défilement vertical) */
        .tile-list-container {
            flex-grow: 1; 
            overflow-y: auto; 
            padding-right: 10px; 
            margin-top: 10px;
        }

        /* 3. BARRE DE RECHERCHE */
        .search-box {
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 2px 8px;
            background: white;
            flex-shrink: 0; 
        }
        .search-box input {
            border: none;
            flex-grow: 1;
            padding: 5px;
            outline: none;
        }
        .search-icon {
            padding-right: 8px;
            color: #666;
        }

        /* 4. MISE EN PAGE DES TUILES (Adaptative avec Flexbox) */
        .tile-list {
            display: flex;
            flex-wrap: wrap; /* CRITIQUE : Permet le retour à la ligne */
            gap: 10px; 
            padding-top: 5px;
            justify-content: flex-start;
            align-content: flex-start; 
        }
        
.tile {
            width: 180px; /* Augmenté de 150px à 180px */
            height: auto;
            box-sizing: border-box; 
            padding: 8px; /* Réduit le padding de 10px à 8px pour gagner de la hauteur */
            border: 1px solid #e0e0e0;
            border-left: 5px solid var(--tile-border-color);
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        /* NOUVEAUX STYLES : Flexbox pour aligner l'icône et le texte */
        .tile-content {
            display: flex;
            align-items: center;
            min-height: 30px; /* Réduit la hauteur minimale de 40px à 30px */
            width: 100%;
        }

        .tile-icon {
            flex-shrink: 0; 
            width: 30px; 
            font-size: 1.5em; 
            text-align: center;
            margin-right: 8px;
        }

        .default-icon {
            color: #888; 
        }

        .tile-text {
            flex-grow: 1; 
            overflow: hidden; 
            white-space: normal;
        }

        .tile-name {
            font-weight: bold;
            color: var(--tile-border-color);
            margin-bottom: 2px;
            word-break: break-word; 
            line-height: 1.2;
        }
        .loading {
            font-style: italic;
            color: gray;
        }
    `;

    firstUpdated() {
        this.fetchTiles();
    }

    handleFilterInput(e) {
        this.filterText = e.target.value; 
    }
    
    async fetchTiles() {
        const apiURL = '/api/tiles'; 
        
        try {
            const response = await fetch(apiURL);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json(); 
            this.tiles = data;
            
        } catch (error) {
            console.error("Erreur lors du chargement des tuiles:", error);
        } finally {
            this.loading = false;
        }
    }
    
    handleTileClick(url) {
        if (url) {
            window.open(url, '_blank'); 
        }
    }

    render() {
        const query = this.filterText.toLowerCase().trim();
        const filteredTiles = this.tiles.filter(tile => {
            if (!query) return true;
            
            return tile.name.toLowerCase().includes(query) ||
                   tile.description.toLowerCase().includes(query);
        });

        if (this.loading) {
            return html`<div class="loading">Chargement des tuiles...</div>`;
        }

        return html`
            
            <h3>Cherchez et utilisez vos applications (${filteredTiles.length} / ${this.tiles.length})</h3>
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Filtrer par nom ou description..."
                    .value="${this.filterText}"
                    @input="${this.handleFilterInput}"
                >
            </div>

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
                                                : html`<span class="default-icon">🗂️</span>` /* Icône neutre */
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
}

customElements.define('widget-xp-portal', WidgetCoucou);