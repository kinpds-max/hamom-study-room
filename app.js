const defaultData = [
    { id: "m1", section: "movie", title: "Movie 1", description: "Movie production base", videoId: "RGlDce_W1lI", thumbnail: "https://img.youtube.com/vi/RGlDce_W1lI/maxresdefault.jpg" },
    { id: "m2", section: "movie", title: "Movie 2", description: "Scenario and characters", videoId: "I4HvW8l_J9g", thumbnail: "https://img.youtube.com/vi/I4HvW8l_J9g/maxresdefault.jpg" },
    { id: "m3", section: "movie", title: "Movie 3", description: "Directing and camera", videoId: "3A3dlw8kTSo", thumbnail: "https://img.youtube.com/vi/3A3dlw8kTSo/maxresdefault.jpg" },
    { id: "m4", section: "movie", title: "Movie 4", description: "Editing and post-production", videoId: "9GkWw3fsLHA", thumbnail: "https://img.youtube.com/vi/9GkWw3fsLHA/maxresdefault.jpg" },
    { id: "m5", section: "movie", title: "Movie 5", description: "Masterpiece completion", videoId: "u8T0Thh5WNo", thumbnail: "https://img.youtube.com/vi/u8T0Thh5WNo/maxresdefault.jpg" },
    { id: "d1", section: "design", title: "Design Study", description: "Logo and web design with AI", videoId: "q_m_vY7Q2X8", thumbnail: "https://img.youtube.com/vi/q_m_vY7Q2X8/maxresdefault.jpg" },
    { id: "v1", section: "video", title: "Video Study", description: "OpenAI Sora analysis", videoId: "HK6y8D_Kq3k", thumbnail: "https://img.youtube.com/vi/HK6y8D_Kq3k/maxresdefault.jpg" },
    { id: "a1", section: "automation", title: "Automation Study", description: "Workflow automation", videoId: "R_qA9p_Iu50", thumbnail: "https://img.youtube.com/vi/R_qA9p_Iu50/maxresdefault.jpg" },
    { id: "y1", section: "youtube", title: "YouTube Study", description: "Channel growth with AI", videoId: "V-9nS6L2W3w", thumbnail: "https://img.youtube.com/vi/V-9nS6L2W3w/maxresdefault.jpg" }
    ];

let appData = [...defaultData];
let dynamicSections = {};

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
        trelloKey: document.getElementById('trello-key'),
        trelloToken: document.getElementById('trello-token'),
        trelloBoard: document.getElementById('trello-board')
};

const TrelloService = {
        async fetchCards(key, token, boardId) {
                    try {
                                    const listsUrl = `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`;
                                    const listsResp = await fetch(listsUrl);
                                    const lists = await listsResp.json();

                        const cardsUrl = `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`;
                                    const cardsResp = await fetch(cardsUrl);
                                    const cards = await cardsResp.json();

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
                        .filter(card => {
                                            const listName = dynamicSections[card.idList] || "";
                                            return card.name.includes('*') || listName.includes('*') || card.name === '\uc601\ud6545\uac15';
                        })
                        .map(card => {
                                            const rawListName = dynamicSections[card.idList] || "Other";
                                            const videoId = this.extractYoutubeId(card.desc);
                                            const listName = rawListName.replace(/\*/g, '').trim();

                                             let displayTitle = card.name;
                                            if (displayTitle === '\uc601\ud6545\uac15') {
                                                                    displayTitle = '\uc601\ud654\uac15\uc758*';
                                            }

                                             return {
                                                                     id: card.id,
                                                                     section: listName,
                                                                     title: displayTitle,
                                                                     description: card.desc.split('\n')[0] || "No description.",
                                                                     videoId: videoId,
                                                                     thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/640x360?text=No+Video',
                                                                     pos: card.pos
                                             };
                        })
                        .filter(item => item.videoId)
                        .sort((a, b) => a.pos - b.pos);
        },

        extractYoutubeId(text) {
                    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                    const match = (text || '').match(regex);
                    return match ? match[1] : null;
        }
};

function renderSections(filter = 'all') {
        dom.gridWrapper.innerHTML = '';
        const sections = [...new Set(appData.map(v => v.section))];
        const activeSections = filter === 'all' ? sections : [filter];
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
        const currentActive = document.querySelector('#category-nav li.active')?.dataset.section || 'all';
        let navHtml = `<li class="${currentActive === 'all' ? 'active' : ''}" data-section="all">View All</li>`;
        sections.forEach(s => {
                    navHtml += `<li class="${currentActive === s ? 'active' : ''}" data-section="${s}">${s}</li>`;
        });
        dom.nav.innerHTML = navHtml;
}

function createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';

    const isLocked = video.section.toLowerCase().includes('movie');
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
                                const password = prompt("Locked. Enter password:");
                                if (password !== "1191004") {
                                                    alert("Wrong password.");
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

async function syncWithTrello() {
        const key = dom.trelloKey.value;
        const token = dom.trelloToken.value;
        const boardId = dom.trelloBoard.value;

    if (!key || !token || !boardId) {
                alert("Enter all settings.");
                return;
    }

    dom.saveSettings.textContent = "Syncing...";
        dom.saveSettings.disabled = true;

    const newCards = await TrelloService.fetchCards(key, token, boardId);

    if (newCards && newCards.length > 0) {
                appData = newCards;
                localStorage.setItem('trelloConfig', JSON.stringify({ key, token, boardId }));
                dom.sourceBadge.textContent = "Trello Connected";
                dom.sourceBadge.style.color = "#00f5d4";
                renderSections();
                alert("Sync successful!");
                dom.settingsModal.style.display = 'none';
    } else {
                alert("Fetch failed.");
    }

    dom.saveSettings.textContent = "Save and Sync";
        dom.saveSettings.disabled = false;
}

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

document.addEventListener('DOMContentLoaded', async () => {
        const config = JSON.parse(localStorage.getItem('trelloConfig')) || {};
        const key = config.key || '383bd25f2d7712826136085195055acd';
        const token = config.token || 'ATTA187121140b4d0501ea6af7183fd4b127d0b77cc563673def06eb429acc4f2fee5F28E728';
        const boardId = config.boardId || 'SzwyFW3E';

                              dom.trelloKey.value = key;
        dom.trelloToken.value = token;
        dom.trelloBoard.value = boardId;

                              if (key && token && boardId) {
                                          dom.sourceBadge.textContent = "Connecting...";
                                          try {
                                                          const newCards = await TrelloService.fetchCards(key, token, boardId);
                                                          if (newCards && newCards.length > 0) {
                                                                              appData = newCards;
                                                                              dom.sourceBadge.textContent = "Trello Connected";
                                                                              dom.sourceBadge.style.color = "#00f5d4";
                                                                              renderSections();
                                                          } else {
                                                                              dom.sourceBadge.textContent = "Trello Link Error";
                                                                              dom.sourceBadge.style.color = "#ff6b6b";
                                                                              renderSections();
                                                          }
                                          } catch (err) {
                                                          dom.sourceBadge.textContent = "Sync Failed";
                                                          dom.sourceBadge.style.color = "#ff6b6b";
                                                          renderSections();
                                          }
                              } else {
                                          renderSections();
                              }
});
