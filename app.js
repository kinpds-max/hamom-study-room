const defaultData = [
    { id: "m1", section: "movie", title: "영화 1강", description: "영화 제작의 기초와 AI 활용", videoId: "RGlDce_W1lI", thumbnail: "https://img.youtube.com/vi/RGlDce_W1lI/maxresdefault.jpg" },
    { id: "m2", section: "movie", title: "영화 2강", description: "시나리오 구성과 캐릭터 분석", videoId: "I4HvW8l_J9g", thumbnail: "https://img.youtube.com/vi/I4HvW8l_J9g/maxresdefault.jpg" },
    { id: "m3", section: "movie", title: "영화 3강", description: "영상미 연출과 카메라 워킹", videoId: "3A3dlw8kTSo", thumbnail: "https://img.youtube.com/vi/3A3dlw8kTSo/maxresdefault.jpg" },
    { id: "m4", section: "movie", title: "영화 4강", description: "디지털 편집과 포스트 프로덕션", videoId: "9GkWw3fsLHA", thumbnail: "https://img.youtube.com/vi/9GkWw3fsLHA/maxresdefault.jpg" },
    { id: "m5", section: "movie", title: "영화 5강", description: "최종 마스터피스 완성하기", videoId: "u8T0Thh5WNo", thumbnail: "https://img.youtube.com/vi/u8T0Thh5WNo/maxresdefault.jpg" },
    { id: "d1", section: "design", title: "Midjourney 활용 실전 디자인 기법", description: "프롬프트 마스터가 들려주는 로고 및 웹 디자인 노하우", videoId: "q_m_vY7Q2X8", thumbnail: "https://img.youtube.com/vi/q_m_vY7Q2X8/maxresdefault.jpg" },
    { id: "v1", section: "video", title: "Sora로 시작하는 AI 영상 혁명", description: "OpenAI의 새로운 모델 Sora의 기능분석과 활용 전망", videoId: "HK6y8D_Kq3k", thumbnail: "https://img.youtube.com/vi/HK6y8D_Kq3k/maxresdefault.jpg" },
    { id: "a1", section: "automation", title: "No-code AI 워크플로우 자동화", description: "Zapier와 ChatGPT를 활용한 업무 효율 극대화 전략", videoId: "R_qA9p_Iu50", thumbnail: "https://img.youtube.com/vi/R_qA9p_Iu50/maxresdefault.jpg" },
    { id: "y1", section: "youtube", title: "AI를 활용한 유튜브 채널 성장 비결", description: "조회수 떡상을 위한 AI 제목 및 썸네일 최적화 가이드", videoId: "V-9nS6L2W3w", thumbnail: "https://img.youtube.com/vi/V-9nS6L2W3w/maxresdefault.jpg" }
];

let appData = [...defaultData];
let dynamicSections = {}; // To store listId -> listName mapping

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
            const listsUrl = `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`;
            const listsResp = await fetch(listsUrl);
            const lists = await listsResp.json();

            const cardsUrl = `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`;
            const cardsResp = await fetch(cardsUrl);
            const cards = await cardsResp.json();

            // Store list names dynamically
            dynamicSections = {};
            lists.forEach(l => dynamicSections[l.id] = l.name);

            return this.transformData(cards, lists);
        } catch (error) {
            console.error("Trello Fetch Error:", error);
            return null;
        }
    },

    transformData(cards, lists) {
        return cards
            .map(card => {
                const listName = dynamicSections[card.idList] || "기타";
                const videoId = this.extractYoutubeId(card.desc);
                return {
                    id: card.id,
                    section: listName, // Use the actual list name as the section key
                    title: card.name,
                    description: card.desc.split('\n')[0] || "강의 설명이 없습니다.",
                    videoId: videoId,
                    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/640x360?text=No+Video',
                    pos: card.pos // Keep track of the order set in Trello
                };
            })
            .filter(item => item.videoId)
            .sort((a, b) => a.pos - b.pos); // Sort by Trello position
    },

    extractYoutubeId(text) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = (text || '').match(regex);
        return match ? match[1] : null;
    }
};

// Main Functions
function renderSections(filter = 'all') {
    dom.gridWrapper.innerHTML = '';
    
    // Get unique sections from current data
    const sections = [...new Set(appData.map(v => v.section))];
    
    // Filter sections based on selection
    const activeSections = filter === 'all' ? sections : [filter];

    // Re-render Navigation dynamically if it's the first Trello sync
    updateNavigation(sections);

    activeSections.forEach(sectionName => {
        const sectionVideos = appData.filter(v => v.section === sectionName);
        if (sectionVideos.length === 0) return;
        
        const sectionElement = document.createElement('section');
        sectionElement.className = 'video-section fade-in';
        sectionElement.innerHTML = `
            <div class="section-header">
                <h2>${sectionName}</h2>
                <div class="section-line"></div>
            </div>
            <div class="video-grid" id="grid-${sectionName.replace(/\s+/g, '-')}"></div>
        `;
        
        dom.gridWrapper.appendChild(sectionElement);
        const grid = document.getElementById(`grid-${sectionName.replace(/\s+/g, '-')}`);
        
        sectionVideos.forEach(video => {
            const card = createVideoCard(video);
            grid.appendChild(card);
        });
    });
}

function updateNavigation(sections) {
    // Basic labels for localized names or icons could be added here if needed
    // For now we just use the names from Trello as labels
    const currentActive = document.querySelector('#category-nav li.active')?.dataset.section || 'all';
    
    let navHtml = `<li class="${currentActive === 'all' ? 'active' : ''}" data-section="all">전체보기</li>`;
    sections.forEach(s => {
        navHtml += `<li class="${currentActive === s ? 'active' : ''}" data-section="${s}">${s}</li>`;
    });
    dom.nav.innerHTML = navHtml;
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // Add lock icon if it's a movie section
    const isLocked = video.section.includes('영화') || video.section.toLowerCase().includes('movie');
    const lockHtml = isLocked ? '<div class="lock-overlay"><i class="fas fa-lock"></i></div>' : '';

    card.innerHTML = `
        <div class="thumbnail-wrapper">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            ${lockHtml}
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
        if (isLocked) {
            const password = prompt("이 강의는 잠겨 있습니다. 비밀번호를 입력하세요:");
            if (password !== "1191004") {
                alert("비밀번호가 틀렸습니다.");
                return;
            }
        }
        
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
    
    if (newCards && newCards.length > 0) {
        appData = newCards;
        localStorage.setItem('trelloConfig', JSON.stringify({ key, token, boardId }));
        dom.sourceBadge.textContent = "Trello Connected";
        dom.sourceBadge.style.color = "#00f5d4"; // Bright green for success
        renderSections();
        alert(`성공적으로 트렐로와 연동되었습니다!\n총 ${newCards.length}개의 강의를 가져왔습니다.`);
        dom.settingsModal.style.display = 'none';
    } else {
        alert("데이터를 가져오지 못했습니다. 다음을 확인해 주세요:\n1. API 키와 토큰이 정확한지\n2. 보드 ID가 맞는지\n3. kinpds@gmail.com 계정이 보드에 초대되었는지");
    }

    dom.saveSettings.textContent = "설정 저장 및 동기화";
    dom.saveSettings.disabled = false;
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
document.addEventListener('DOMContentLoaded', async () => {
    const config = JSON.parse(localStorage.getItem('trelloConfig'));
    if (config && config.key && config.token && config.boardId) {
        // Pre-fill inputs
        dom.trelloKey.value = config.key;
        dom.trelloToken.value = config.token;
        dom.trelloBoard.value = config.boardId;
        
        // Auto-sync silently
        console.log("Auto-syncing with Trello...");
        const newCards = await TrelloService.fetchCards(config.key, config.token, config.boardId);
        if (newCards) {
            appData = newCards;
            dom.sourceBadge.textContent = "Trello Auto-Synced";
            dom.sourceBadge.style.color = "#4cc9f0";
            renderSections();
        }
    } else {
        renderSections();
    }
});
