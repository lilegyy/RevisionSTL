let appData = {};
let currentChapterId = null;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
    setupEventListeners();
});

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

async function loadData() {
    try {
        const response = await fetch('data.json');
        appData = await response.json();
        renderChapterLists();
    } catch (error) {
        document.getElementById('content-area').innerHTML = "<p>Erreur lors du chargement des données. Vérifiez data.json.</p>";
    }
}

function renderChapterLists() {
    ['cdd', 'ondes', 'sp'].forEach(spe => {
        const grid = document.getElementById(`grid-${spe}`);
        grid.innerHTML = '';
        if (appData[spe]) {
            appData[spe].forEach(chapter => {
                const card = document.createElement('div');
                card.className = 'chapter-card';
                card.innerHTML = `<h3>${chapter.titre}</h3><p>${chapter.description}</p>`;
                card.addEventListener('click', () => openChapter(chapter));
                grid.appendChild(card);
            });
        }
    });
}

function setupEventListeners() {
    // CORRECTION DU BUG : Quitter le chapitre lors d'un changement de matière
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 1. Forcer le retour à la vue liste
            document.getElementById('chapter-detail-view').classList.remove('active');
            document.getElementById('chapter-list-view').classList.add('active');
            currentChapterId = null;

            // 2. Mettre à jour les onglets
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            e.target.classList.add('active');
            document.getElementById(e.target.dataset.target).classList.add('active');
        });
    });

    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('chapter-detail-view').classList.remove('active');
        document.getElementById('chapter-list-view').classList.add('active');
        currentChapterId = null;
    });

    document.getElementById('btn-cours').addEventListener('click', (e) => setMode('cours', e.target));
    document.getElementById('btn-exos').addEventListener('click', (e) => setMode('exercices', e.target));
}

function openChapter(chapter) {
    currentChapterId = chapter.id;
    document.getElementById('chapter-title').textContent = chapter.titre;
    document.getElementById('chapter-list-view').classList.remove('active');
    document.getElementById('chapter-detail-view').classList.add('active');
    setMode('cours', document.getElementById('btn-cours'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setMode(mode, btnElement) {
    document.querySelectorAll('.mode-switch button').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    const contentArea = document.getElementById('content-area');

    let chapterData = null;
    for (const spe in appData) {
        const found = appData[spe].find(c => c.id === currentChapterId);
        if (found) { chapterData = found; break; }
    }

    if (mode === 'cours') {
        contentArea.innerHTML = chapterData.cours;
    } else if (mode === 'exercices') {
        contentArea.innerHTML = '';
        if (chapterData.exercices && chapterData.exercices.length > 0) {
            chapterData.exercices.forEach((exo, index) => {
                const exoDiv = document.createElement('div');
                exoDiv.className = 'exo-card';
                exoDiv.innerHTML = `
                    <div class="exo-question">${exo.enonce}</div>
                    <button class="btn-corrige" onclick="toggleCorrection(${index})">Afficher la rédaction type Bac 👀</button>
                    <div class="correction" id="corr-${index}">
                        ${exo.correction}
                        <button class="btn-outline" style="margin-top:1.5rem; width:100%; border-color:var(--primary); font-weight:bold;" onclick="window.goToCours()">📖 Un doute ? Retourner au cours</button>
                    </div>
                `;
                contentArea.appendChild(exoDiv);
            });
        } else {
            contentArea.innerHTML = "<p>Exercices en cours de rédaction pour ce chapitre. 🚀</p>";
        }
    }

    // Rendu LaTeX (Les backslashes sont gérés nativement)
    renderMathInElement(contentArea, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }]
    });
}

function toggleCorrection(index) {
    document.getElementById(`corr-${index}`).classList.toggle('show');
}

window.goToCours = function() {
    document.getElementById('btn-cours').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
