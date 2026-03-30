const defaultData = [
    { id: "m1", section: "movie", title: "\uc601\ud654 1\uac15", description: "\uc601\ud654 \uc81c\uc791\uc758 \uae30\ucd08\uc640 AI \ud65c\uc6a9", videoId: "RGlDce_W1lI", thumbnail: "https://img.youtube.com/vi/RGlDce_W1lI/maxresdefault.jpg" },
    { id: "m2", section: "movie", title: "\uc601\ud654 2\uac15", description: "\uc2dc\ub098\ub9ac\uc624 \uac70\uc131\uacfc \uce90\ub9ad\ud130 \ubd04\uc11d", videoId: "I4HvW8l_J9g", thumbnail: "https://img.youtube.com/vi/I4HvW8l_J9g/maxresdefault.jpg" },
    { id: "m3", section: "movie", title: "\uc601\ud654 3\uac15", description: "\uc601\uc0c1\ubbf8 \uc5f0\ucd9c\uacfc \uce74\uba54\ub77c \uc6cc\ud0b9", videoId: "3A3dlw8kTSo", thumbnail: "https://img.youtube.com/vi/3A3dlw8kTSo/maxresdefault.jpg" },
    { id: "m4", section: "movie", title: "\uc601\ud654 4\uac15", description: "\ub514\uc9c0\ud138 \ud3b8\uc9d1\uacfc \ud3ec\uc2a4\ud2b8 \ud504\ub85c\ub355\uc158", videoId: "9GkWw3fsLHA", thumbnail: "https://img.youtube.com/vi/9GkWw3fsLHA/maxresdefault.jpg" },
    { id: "m5", section: "movie", title: "\uc601\ud654 5\uac15", description: "\ucc28\uc88c \ub9c8\uc2a4\ud130\ud53c\uc2a4 \uc644\uc131\ud558\uae30", videoId: "u8T0Thh5WNo", thumbnail: "https://img.youtube.com/vi/u8T0Thh5WNo/maxresdefault.jpg" },
    { id: "d1", section: "design", title: "Midjourney \ud65c\uc6a9 \uc2e4\uc804 \ub514\uc9c0\uc778 \uae30\ubc95", description: "\ud504\ub86c\ud504\ud2b8 \ub9c8\uc2a4\ud130\uac00 \ub4e4\ub824\uc8fc\ub294 \ub85c\uace0 \ubc0f \uc6f9 \ub514\uc9c0\uc778 \ub178\ud558\uc6b0", videoId: "q_m_vY7Q2X8", thumbnail: "https://img.youtube.com/vi/q_m_vY7Q2X8/maxresdefault.jpg" },
    { id: "v1", section: "video", title: "Sora\ub85c \uc2dc\uc791\ud558\ub294 AI \uc601\uc0c1 \ud601\uba85", description: "OpenAI\uc758 \uc0c8\ub85c\uc6b4 \ubaa8\ub378 Sora\uc758 \uae30\ub2a5\ubd84\uc11d\uacfc \ud65c\uc6a9 \uc804\ub9dd", videoId: "HK6y8D_Kq3k", thumbnail: "https://img.youtube.com/vi/HK6y8D_Kq3k/maxresdefault.jpg" },
    { id: "a1", section: "automation", title: "No-code AI \uc6cc\ud06c\ud50c\ub85c\uc6b0 \uc790\ub3d9\ud654", description: "Zapier\uc640 ChatGPT\ub97c \ud65c\uc6a9\ud55c \uc5c5\ubb34 \ud6a8\uc728 \uac1d\ub300\ud654 \uc804\ub7b5", videoId: "R_qA9p_Iu50", thumbnail: "https://img.youtube.com/vi/R_qA9p_Iu50/maxresdefault.jpg" },
    { id: "y1", section: "youtube", title: "AI\ub97c \ud65c\uc6a9\ud55c \uc720\ud22c\ube0c \ucc44\ub110 \uc131\uc7a5 \ube44\uacb0", description: "\uc870\ud68c\uc218 \ub5a1\uc0c1\uc744 \uc704\ud55c AI \uc81c\ubaa9 \ubc0f \uc378\ub124\uc77c \ucd5c\uc801\ud654 \uac00\uc774\ub4dc", videoId: "V-9nS6L2W3w", thumbnail: "https://img.youtube.com/vi/V-9nS6L2W3w/maxresdefault.jpg" }
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
                                            const rawListName = dynamicSections[card.idList] || "                const rawListName = dynamicSections[card.idList] || "Other";
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
                alert("Fetch failed. Check YouTube links in description.");
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
                                          dom.sourceBadg
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
