// ==UserScript==
// @name         NoiTu.Pro - Bot cực bá
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Bot nối từ thông minh
// @author       Hoanglong291 + Vanh
// @match        *://*.noitu.pro/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Bot Launcher v2.0 - Pro Stats] Đang khởi động...');

    const SCRIPT_ID = 'vipProBot_v3.3';
    let isPaused = false;
    let typingSpeed = 500;
    let startTime = 0;
    let totalTime = 0;
    let wins = 0;
    let losses = 0;
    let wordCache = new Map();

    function saveState() {
        const state = {
            totalTime,
            wins,
            losses,
            cache: Array.from(wordCache.entries())
        };
        localStorage.setItem(SCRIPT_ID + '_state', JSON.stringify(state));
    }

    function loadState() {
        const savedState = localStorage.getItem(SCRIPT_ID + '_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            totalTime = state.totalTime || 0;
            wins = state.wins || 0;
            losses = state.losses || 0;
            if (state.cache) {
                wordCache = new Map(state.cache);
            }
            console.log('[Bot Vip Pro] Đã tải lại "trí nhớ" (stats và cache)!');
        }
        startTime = Date.now();
    }
    function showCacheModal() {
        const modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'bot_cache_modal_backdrop';
        modalBackdrop.style.position = 'fixed';
        modalBackdrop.style.top = '0';
        modalBackdrop.style.left = '0';
        modalBackdrop.style.width = '100%';
        modalBackdrop.style.height = '100%';
        modalBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modalBackdrop.style.zIndex = '20000';
        modalBackdrop.style.display = 'flex';
        modalBackdrop.style.justifyContent = 'center';
        modalBackdrop.style.alignItems = 'center';

        const modalPanel = document.createElement('div');
        modalPanel.style.backgroundColor = 'white';
        modalPanel.style.color = 'black';
        modalPanel.style.padding = '20px';
        modalPanel.style.borderRadius = '10px';
        modalPanel.style.width = '90%';
        modalPanel.style.maxWidth = '500px';
        modalPanel.style.maxHeight = '80vh';
        modalPanel.style.overflowY = 'auto';
        modalPanel.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h3');
        title.style.textAlign = 'center';
        title.style.margin = '0 0 15px 0';
        modalPanel.appendChild(title);

        const listContainer = document.createElement('ul');
        listContainer.style.listStyleType = 'none';
        listContainer.style.padding = '0';
        listContainer.style.margin = '0';

        function refreshCacheList() {
            listContainer.innerHTML = '';
            title.textContent = `Trí Nhớ (Cache) - ${wordCache.size} từ`;

            if (wordCache.size === 0) {
                const emptyLi = document.createElement('li');
                emptyLi.textContent = 'Trí nhớ đang "trống trơn".';
                emptyLi.style.textAlign = 'center';
                listContainer.appendChild(emptyLi);
            } else {
                const sortedCache = Array.from(wordCache.entries()).sort((a, b) => {
                    const aIsWin = (a[1] === 'WIN_CONDITION');
                    const bIsWin = (b[1] === 'WIN_CONDITION');
                    if (aIsWin && !bIsWin) return -1;
                    if (!aIsWin && bIsWin) return 1;
                    return 0;
                });

                sortedCache.forEach(([key, value]) => {
                    const li = document.createElement('li');
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    li.style.borderBottom = '1px solid #eee';
                    li.style.padding = '8px 5px';

                    const textSpan = document.createElement('span');
                    textSpan.innerHTML = `<b>"${key}"</b> → <i>"${value === 'WIN_CONDITION' ? 'TỪ THẮNG' : value}"</i>`;
                    li.appendChild(textSpan);

                    if (value === 'WIN_CONDITION') {
                        li.style.backgroundColor = '#d4edda';
                        li.style.color = '#155724';
                    }

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Xóa';
                    deleteButton.dataset.key = key;
                    deleteButton.style.backgroundColor = '#dc3545';
                    deleteButton.style.color = 'white';
                    deleteButton.style.border = 'none';
                    deleteButton.style.padding = '3px 6px';
                    deleteButton.style.borderRadius = '4px';
                    deleteButton.style.cursor = 'pointer';
                    deleteButton.style.marginLeft = '10px';

                    deleteButton.onclick = () => {
                        const keyToDelete = deleteButton.dataset.key;
                        wordCache.delete(keyToDelete);
                        saveState();
                        refreshCacheList();
                    };

                    li.appendChild(deleteButton);
                    listContainer.appendChild(li);
                });
            }
        }

        refreshCacheList();
        modalPanel.appendChild(listContainer);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Đóng Lại';
        closeButton.style.width = '100%';
        closeButton.style.padding = '10px';
        closeButton.style.marginTop = '20px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';

        closeButton.onclick = () => modalBackdrop.remove();
        modalBackdrop.onclick = (e) => {
            if (e.target === modalBackdrop) {
                modalBackdrop.remove();
            }
        };

        modalPanel.appendChild(closeButton);
        modalBackdrop.appendChild(modalPanel);
        document.body.appendChild(modalBackdrop);
    }

    function createProDashboard() {
        if (document.getElementById('bot_dashboard')) return;

        const dashboard = document.createElement('div');
        dashboard.id = 'bot_dashboard';
        dashboard.style.position = 'fixed';
        dashboard.style.top = '10px';
        dashboard.style.right = '10px';
        dashboard.style.backgroundColor = 'rgba(0,0,0,0.85)';
        dashboard.style.color = 'white';
        dashboard.style.padding = '15px';
        dashboard.style.borderRadius = '10px';
        dashboard.style.fontSize = '14px';
        dashboard.style.zIndex = '10000';
        dashboard.style.maxWidth = '300px';
        dashboard.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h3');
        title.textContent = 'Bot Nối Từ';
        title.style.textAlign = 'center';
        title.style.margin = '0 0 10px 0';
        dashboard.appendChild(title);

        const timeStampDisplay = document.createElement('div');
        timeStampDisplay.id = 'bot_time';
        const winsDisplay = document.createElement('div');
        winsDisplay.id = 'bot_wins';
        const lossesDisplay = document.createElement('div');
        lossesDisplay.id = 'bot_losses';

        const wlRatioDisplay = document.createElement('div');
        wlRatioDisplay.id = 'bot_wl_ratio';
        const winWordCountDisplay = document.createElement('div');
        winWordCountDisplay.id = 'bot_win_word_count';

        dashboard.appendChild(timeStampDisplay);
        dashboard.appendChild(winsDisplay);
        dashboard.appendChild(lossesDisplay);
        dashboard.appendChild(wlRatioDisplay);
        dashboard.appendChild(winWordCountDisplay);
        dashboard.appendChild(document.createElement('hr'));

        const pauseButton = document.createElement('button');
        pauseButton.id = 'bot_pauseBtn';
        pauseButton.textContent = 'Tạm Dừng (Pause)';
        pauseButton.style.width = '100%';
        pauseButton.style.padding = '5px';
        pauseButton.style.backgroundColor = '#f44336';
        pauseButton.style.color = 'white';
        pauseButton.style.border = 'none';
        pauseButton.style.borderRadius = '5px';
        pauseButton.style.cursor = 'pointer';
        dashboard.appendChild(pauseButton);

        const viewCacheButton = document.createElement('button');
        viewCacheButton.textContent = 'Xem/Xóa Từ Đã Lưu (Cache)';
        viewCacheButton.style.width = '100%';
        viewCacheButton.style.padding = '5px';
        viewCacheButton.style.marginTop = '5px';
        viewCacheButton.style.backgroundColor = '#007bff';
        viewCacheButton.style.color = 'white';
        viewCacheButton.style.border = 'none';
        viewCacheButton.style.borderRadius = '5px';
        viewCacheButton.style.cursor = 'pointer';
        dashboard.appendChild(viewCacheButton);

        // Nút Xóa Cache (Toàn bộ)
        const clearCacheButton = document.createElement('button');
        clearCacheButton.textContent = 'Xóa Sạch Cache (Xóa hết)';
        clearCacheButton.style.width = '100%';
        clearCacheButton.style.padding = '5px';
        clearCacheButton.style.marginTop = '5px';
        clearCacheButton.style.backgroundColor = '#ff9800';
        clearCacheButton.style.color = 'white';
        clearCacheButton.style.border = 'none';
        clearCacheButton.style.borderRadius = '5px';
        clearCacheButton.style.cursor = 'pointer';
        dashboard.appendChild(clearCacheButton);

        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Tốc độ Gõ: 500ms';
        speedLabel.id = 'bot_speedLabel';
        speedLabel.style.display = 'block';
        speedLabel.style.marginTop = '10px';
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '100';
        speedSlider.max = '2000';
        speedSlider.value = typingSpeed;
        speedSlider.style.width = '100%';
        dashboard.appendChild(speedLabel);
        dashboard.appendChild(speedSlider);

        document.body.appendChild(dashboard);

        pauseButton.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseButton.textContent = isPaused ? 'Tiếp Tục (Resume)' : 'Tạm Dừng (Pause)';
            pauseButton.style.backgroundColor = isPaused ? '#4CAF50' : '#f44336';
            console.log(isPaused ? '[Bot] Đã Tạm Dừng.' : '[Bot Vip Pro] Đã Tiếp Tục.');
        });

        viewCacheButton.addEventListener('click', showCacheModal);

        clearCacheButton.addEventListener('click', () => {
            if (confirm('Bạn chắc chắn muốn XÓA SẠCH toàn bộ trí nhớ (cache) của bot?')) {
                wordCache.clear();
                saveState();
                console.log('[Bot] Đã xóa sạch cache!');
            }
        });

        speedSlider.addEventListener('input', (e) => {
            typingSpeed = parseInt(e.target.value, 10);
            speedLabel.textContent = `Tốc độ Gõ: ${typingSpeed}ms`;
        });

        setInterval(() => {
            const now = Date.now();
            let totalSeconds = totalTime;
            if (window.location.pathname.includes('/solo')) {
                 const currentSessionTime = Math.floor((now - startTime) / 1000);
                 totalSeconds = totalTime + currentSessionTime;
            }
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const secs = String(totalSeconds % 60).padStart(2, '0');

            timeStampDisplay.textContent = `Tổng giờ Treo: ${hours}:${minutes}:${secs}`;
            winsDisplay.textContent = `Wins (Tổng): ${wins}`;
            lossesDisplay.textContent = `Losses (Tổng): ${losses}`;

            const totalGames = wins + losses;
            const winRate = (totalGames > 0) ? (wins / totalGames * 100).toFixed(1) : 0;
            wlRatioDisplay.textContent = `Tỷ lệ Thắng (W/L): ${winRate}%`;
            wlRatioDisplay.style.color = (winRate >= 50) ? 'lime' : 'orange';

            let winWordCount = 0;
            wordCache.forEach((value) => {
                if (value === 'WIN_CONDITION') {
                    winWordCount++;
                }
            });
            winWordCountDisplay.textContent = `Số 'Từ Thắng' (Cache): ${winWordCount} từ`;
            winWordCountDisplay.style.color = 'cyan';

        }, 1000);
    }

    function runGameBot(textInput, currentWordSpan) {
        console.log("[Bot] Đã kích hoạt logic CHƠI GAME.");

        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function typeLikeHuman(word) {
            textInput.value = '';
            const baseDelay = typingSpeed / (word.length + 1);
            for (const char of word) {
                const randomDelay = baseDelay + (Math.random() * 50 - 25);
                await wait(Math.max(30, randomDelay));
                textInput.value += char;
                textInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            await wait(100 + Math.random() * 100);
            const event = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                keyCode: 13
            });
            textInput.dispatchEvent(event);
        }

        function displayTempMessage(text, color) {
            const dashboard = document.getElementById('bot_dashboard');
            if (!dashboard) return;
            const msg = document.createElement('div');
            msg.textContent = text;
            msg.style.color = color;
            msg.style.fontWeight = 'bold';
            msg.style.textAlign = 'center';
            msg.style.marginTop = '5px';
            dashboard.appendChild(msg);
            setTimeout(() => msg.remove(), 3000);
        }

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (isPaused) return;
                if (mutation.type === 'childList') {
                    if (textInput.disabled) return;
                    const currentWord = currentWordSpan.innerText.trim();
                    if (currentWord === "") return;

                    if (wordCache.has(currentWord)) {
                        console.log(`[Cache HIT]: Dùng từ trong cache cho: ${currentWord}`);
                        const cachedAnswer = wordCache.get(currentWord);
                        if (cachedAnswer === "WIN_CONDITION") {
                            const head = currentWord.split(' ')[0];
                            typeLikeHuman(head);
                        } else {
                            typeLikeHuman(cachedAnswer);
                        }
                        return;
                    }

                    console.log(`[Cache MISS]: Fetch từ mới: ${currentWord}`);
                    fetch(`https://noitu.pro/answer?word=${encodeURIComponent(currentWord)}`)
                        .then(response => response.json())
                        .then(data => {
                            if (isPaused) return;
                            if (data.success && data.nextWord) {
                                if (data.win) {
                                    wordCache.set(currentWord, "WIN_CONDITION");
                                    const head = currentWord.split(' ')[0];
                                    typeLikeHuman(head);
                                } else {
                                    const tail = data.nextWord.tail;
                                    wordCache.set(currentWord, tail);
                                    typeLikeHuman(tail);
                                }
                                saveState();
                            }
                        })
                        .catch(error => console.error('Error:', error));
                }
            });
        });

        const modalObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                const modal = document.querySelector('.swal-modal');
                const overlay = document.querySelector('.swal-overlay');

                if (modal) {
                    const title = modal.querySelector('.swal-title').textContent.trim();
                    const text = modal.querySelector('.swal-text').textContent.trim();

                    if (title.includes('Trò chơi kết thúc')) {
                        const playAgainButton = modal.querySelector('.swal-button.swal-button--confirm');
                        if (playAgainButton) {
                            playAgainButton.click();

                            if (text.includes('Bạn đã dành chiến thắng')) {
                                wins++;
                                displayTempMessage("You win!", "lime");
                            } else if (text.includes('Bạn đã thua')) {
                                losses++;
                                displayTempMessage("You lose!", "red");
                            }

                            totalTime += Math.floor((Date.now() - startTime) / 1000);
                            startTime = Date.now();
                            saveState();

                            if (overlay) overlay.remove();
                            modal.remove();
                        }
                    }
                }
            });
        });

        observer.observe(currentWordSpan, { childList: true });
        modalObserver.observe(document.body, { childList: true, subtree: true });
        console.log('[Bot] Lõi game đã kích hoạt (Nghe + Nhìn).');
    }

    function runMenuBot() {
        console.log("[Bot] Đã kích hoạt logic MENU (Auto-Join).");

        const autoJoinInterval = setInterval(() => {
            if (isPaused) {
                console.log('[Bot Menu] Đang Tạm Dừng, sẽ không tự vào game.');
                return;
            }

            const soloButton = Array.from(document.querySelectorAll('a')).find(
                a => a.textContent.trim().toLowerCase() === '1vs1' && a.getAttribute('href') === '/solo'
            );

            if (soloButton) {
                console.log("[Bot Menu] Đã tìm thấy nút 1vs1. Đang click...");
                clearInterval(autoJoinInterval);
                soloButton.click();
            } else {
                 console.log("[Bot Menu] Đang tìm nút 1vs1...");
            }
        }, 1500);
    }


    loadState();

    setTimeout(() => {
         createProDashboard();
         console.log('[Bot Launcher] Đã vẽ Dashboard.');
    }, 1000);

    const launcherInterval = setInterval(() => {
        const path = window.location.pathname;

        if (path.includes('/solo')) {
            const textInput = document.getElementById('text');
            const currentWordSpan = document.getElementById('currentWord');
            if (textInput && currentWordSpan) {
                console.log('[Bot Launcher] Đã nhận diện trang GAME. Kích hoạt bot game...');
                clearInterval(launcherInterval);
                runGameBot(textInput, currentWordSpan);
            }

        } else if (path === '/') {
            const soloButton = Array.from(document.querySelectorAll('a')).find(
                a => a.textContent.trim().toLowerCase() === '1vs1' && a.getAttribute('href') === '/solo'
            );
            if (soloButton) {
                console.log('[Bot Launcher] Đã nhận diện trang MENU. Kích hoạt bot auto-join...');
                clearInterval(launcherInterval);
                runMenuBot();
            }

        } else {
            console.log(`[Bot Launcher] Đang ở trang lạ (${path}). Sẽ không làm gì.`);
            clearInterval(launcherInterval);
        }
    }, 500);

})();
