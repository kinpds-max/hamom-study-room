// Default Project Data (used if Trello is not connected)
const defaultData = [
    { id: "1", section: "movie", title: "AI로 영화 예고편 만들기", description: "Runway Gen-2와 Midjourney를 활용한 고퀄리티 예고편 제작 과정", videoId: "6D2L_9lZk0k", thumbnail: "https://img.youtube.com/vi/6D2L_9lZk0k/maxresdefault.jpg" },
    { id: "2", section: "design", title: "Midjourney 활용 실전 디자인 기법", description: "프롬프트 마스터가 들려주는 로고 및 웹 디자인 노하우", videoId: "q_m_vY7Q2X8", thumbnail: "https://img.youtube.com/vi/q_m_vY7Q2X8/maxresdefault.jpg" },
    { id: "3", section: "video", title: "Sora로 시작하는 AI 영상 혁명", description: "OpenAI의 새로운 모델 Sora의 기능분석과 활용 전망", videoId: "HK6y8D_Kq3k", thumbnail: "https://img.youtube.com/vi/HK6y8D_Kq3k/maxresdefault.jpg" },
    { id: "4", section: "automation", title: "No-code AI 워크플로우 자동화", description: "Zapier와 ChatGPT를 활용한 업무 효율 극대화 전략", videoId: "R_qA9p_Iu50", thumbnail: "https://img.youtube.com/vi/R_qA9p_Iu50/maxresdefault.jpg" },
    { id: "5", section: "youtube", title: "AI를 활용한 유튜브 채널 성장 비결", description: "조회수 떡상을 위한 AI 제목 및 썸네일 최적화 가이드", videoId: "V-9nS6L2W3w", thumbnail: "https://img.youtube.com/vi/V-9nS6L2W3w/maxresdefault.jpg" }
];

let appData = [...defaultData];

const sectionLabels = {
    "movie": "영화수업",
    "design": "AI디자인수업",
    "video": "AI영상수업",
    "automation": "AI자동화수업",
    "youtube": "AI유튜브 수업"
};

// UI Elements
const dom = {
    nav: document.getElementById('category-nav'),
    gridWrapper: document.getElementById('video-grid-wrapper'),
    videoModal: document.getElementById('video-modal'),
    settingsModal: document.getElementById('settings-modal'),
    modalIframe: document.getElementById('youtube-player'),
    modalTitle: document.getElementById('modal-video-title'),
    modalDesc: document.getElementById('modal-video-desc'),
    closeVideo: document.querySelector('.close-modal'),
    closeSettings: document.querySelector('.close-settings'),
    openSettings: document.getElementById('open-settings'),
    saveSettings: document.getElementById('save-settings'),
    sourceBadge: document.getElementById('source-name'),
    
    // Inputs
    trelloKey: document.getElementById('trello-key'),
    trelloToken: document.getElementById('trello-token'),
    trelloBoard: document.getElementById('trello-board')
};

// Trello API Service
const TrelloService = {
    async fetchCards(key, token, boardId) {
        try {
            // Get all lists on the board first to match section names
            const listsUrl = `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`;
            const listsResp = await fetch(listsUrl);
            const lists = await listsResp.json();

            // Get all cards on the board
            const cardsUrl = `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`;
            const cardsResp = await fetch(cardsUrl);
            const cards = await cardsResp.json();

            return this.transformData(cards, lists);
        } catch (error) {
            console.error("Trello Fetch Error:", error);
            alert("트렐로 데이터를 가져오는데 실패했습니다. 설정을 확인해주세요.");
            return null;
        }
    },

    transformData(cards, lists) {
        return cards.map(card => {
            const list = lists.find(l => l.id === card.idList);
            const section = this.mapSection(list ? list.name : '');
            const videoId = this.extractYoutubeId(card.desc);
            
            return {
                id: card.id,
                section: section,
                title: card.name,
                description: card.desc.split('\n')[0], // Use first line as description
                videoId: videoId,
                thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/640x360?text=No+Video'
            };
        }).filter(item => item.videoId); // Only show items with video
    },

    mapSection(listName) {
        if (listName.includes('영화')) return 'movie';
        if (listName.includes('디자인')) return 'design';
        if (listName.includes('영상')) return 'video';
        if (listName.includes('자동화')) return 'automation';
        if (listName.includes('유튜브')) return 'youtube';
        return 'movie'; // Default
    },

    extractYoutubeId(text) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = text.match(regex);
        return match ? match[1] : null;
    }
};

// Main Functions
function renderSections(filter = 'all') {
    dom.gridWrapper.innerHTML = '';
    
    const activeSections = filter === 'all' ? Object.keys(sectionLabels) : [filter];

    activeSections.forEach(sectionId => {
        const sectionVideos = appData.filter(v => v.section === sectionId);
        if (sectionVideos.length === 0 && filter !== 'all') return;
        
        const sectionElement = document.createElement('section');
        sectionElement.className = 'video-section fade-in';
        sectionElement.innerHTML = `
            <div class="section-header">
                <h2>${sectionLabels[sectionId]}</h2>
                <div class="section-line"></div>
            </div>
            <div class="video-grid" id="grid-${sectionId}"></div>
        `;
        
        dom.gridWrapper.appendChild(sectionElement);
        const grid = document.getElementById(`grid-${sectionId}`);
        
        sectionVideos.forEach(video => {
            const card = createVideoCard(video);
            grid.appendChild(card);
        });
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
        <div class="thumbnail-wrapper">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            <div class="play-button-overlay">
                <i class="fas fa-play" style="color: white; font-size: 1.5rem;"></i>
            </div>
        </div>
        <div class="video-info-content">
            <h3>${video.title}</h3>
            <p>${video.description}</p>
        </div>
    `;
    card.addEventListener('click', () => {
        dom.modalTitle.textContent = video.title;
        dom.modalDesc.textContent = video.description;
        dom.modalIframe.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
        dom.videoModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    return card;
}

// Settings and Sync Logic
async function syncWithTrello() {
    const key = dom.trelloKey.value;
    const token = dom.trelloToken.value;
    const boardId = dom.trelloBoard.value;

    if (!key || !token || !boardId) {
        alert("모든 설정 정보를 입력해주세요.");
        return;
    }

    dom.saveSettings.textContent = "동기화 중...";
    dom.saveSettings.disabled = true;

    const newCards = await TrelloService.fetchCards(key, token, boardId);
    
    if (newCards) {
        appData = newCards;
        localStorage.setItem('trelloConfig', JSON.stringify({ key, token, boardId }));
        dom.sourceBadge.textContent = "Trello Synced";
        dom.sourceBadge.style.color = "#4cc9f0";
        renderSections();
        dom.settingsModal.style.display = 'none';
    }

    dom.saveSettings.textContent = "설정 저장 및 동기화";
    dom.saveSettings.disabled = false;
}

function loadConfig() {
    const config = JSON.parse(localStorage.getItem('trelloConfig'));
    if (config) {
        dom.trelloKey.value = config.key;
        dom.trelloToken.value = config.token;
        dom.trelloBoard.value = config.boardId;
        // Optionally auto-sync here if needed
    }
}

// Event Listeners
dom.nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        document.querySelectorAll('#category-nav li').forEach(li => li.classList.remove('active'));
        e.target.classList.add('active');
        renderSections(e.target.dataset.section);
    }
});

dom.openSettings.addEventListener('click', () => dom.settingsModal.style.display = 'block');
dom.closeSettings.addEventListener('click', () => dom.settingsModal.style.display = 'none');
dom.closeVideo.addEventListener('click', () => {
    dom.videoModal.style.display = 'none';
    dom.modalIframe.src = '';
    document.body.style.overflow = 'auto';
});

dom.saveSettings.addEventListener('click', syncWithTrello);

window.addEventListener('click', (e) => {
    if (e.target === dom.videoModal) dom.closeVideo.click();
    if (e.target === dom.settingsModal) dom.settingsModal.style.display = 'none';
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    renderSections();
});
