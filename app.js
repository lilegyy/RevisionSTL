let appData = {};
let currentChapterId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
    setupEventListeners();
});

// Gestion du thème
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        toggleBtn.textContent = '☀️';
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isNowDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isNowDark);
        toggleBtn.textContent = isNowDark ? '☀️' : '🌙';
    });
}

// Chargement des données JSON
async function loadData() {
    try {
        // En local, on utiliserait un fetch. Pour cet exemple, je simule le chargement du JSON.
        // Remplace ceci par fetch('data.json') quand tu auras le fichier.
        const response = await fetch('data.json');
        appData = await response.json();
        renderChapterLists();
    } catch (error) {
        console.error("Erreur de chargement des données:", error);
        document.getElementById('content-area').innerHTML = "<p>Erreur lors du chargement des cours. Vérifiez le fichier data.json.</p>";
    }
}

// Affichage des grilles de chapitres
function renderChapterLists() {
    ['cdd', 'ondes', 'sp'].forEach(spe => {
        const grid = document.getElementById(`grid-${spe}`);
        grid.innerHTML = '';
        
        if(appData[spe]) {
            appData[spe].forEach(chapter => {
                const card = document.createElement('div');
                card.className = 'chapter-card';
                card.innerHTML = `
                    <h3>${chapter.titre}</h3>
                    <p>${chapter.description}</p>
                `;
                card.addEventListener('click', () => openChapter(chapter));
                grid.appendChild(card);
            });
        }
    });
}

// Événements de navigation
function setupEventListeners() {
    // Onglets principaux (CDD, Ondes, SP)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.target).classList.add('active');
        });
    });

    // Bouton Retour
    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('chapter-detail-view').classList.remove('active');
        document.getElementById('chapter-list-view').classList.add('active');
    });

    // Switch Cours / Exercices
    document.getElementById('btn-cours').addEventListener('click', (e) => {
        setMode('cours', e.target);
    });
    document.getElementById('btn-exos').addEventListener('click', (e) => {
        setMode('exercices', e.target);
    });
}

// Ouverture d'un chapitre
function openChapter(chapter) {
    currentChapterId = chapter.id;
    document.getElementById('chapter-title').textContent = chapter.titre;
    
    document.getElementById('chapter-list-view').classList.remove('active');
    document.getElementById('chapter-detail-view').classList.add('active');
    
    // Par défaut on ouvre le cours
    setMode('cours', document.getElementById('btn-cours'));
}

// Basculer entre l'affichage du cours et des exercices
function setMode(mode, btnElement) {
    document.querySelectorAll('.mode-switch button').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    const contentArea = document.getElementById('content-area');
    
    // Trouver les données du chapitre courant
    let chapterData = null;
    for (const spe in appData) {
        const found = appData[spe].find(c => c.id === currentChapterId);
        if (found) { chapterData = found; break; }
    }

    if (mode === 'cours') {
        contentArea.innerHTML = chapterData.cours;
    } else if (mode === 'exercices') {
        contentArea.innerHTML = '';
        if(chapterData.exercices && chapterData.exercices.length > 0) {
            chapterData.exercices.forEach((exo, index) => {
                const exoDiv = document.createElement('div');
                exoDiv.className = 'exo-card';
                exoDiv.innerHTML = `
                    <div class="exo-question">${exo.enonce}</div>
                    <button class="btn-corrige" onclick="toggleCorrection(${index})">Voir la correction 👀</button>
                    <div class="correction" id="corr-${index}">${exo.correction}</div>
                `;
                contentArea.appendChild(exoDiv);
            });
        } else {
             contentArea.innerHTML = "<p>Pas encore d'exercices pour ce chapitre. Courage, ça arrive ! 💪</p>";
        }
    }
    
    // Rendu des formules mathématiques KaTeX
    renderMathInElement(contentArea, {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
        ]
    });
}

// Afficher/Masquer la correction
function toggleCorrection(index) {
    const corrDiv = document.getElementById(`corr-${index}`);
    corrDiv.classList.toggle('show');
}