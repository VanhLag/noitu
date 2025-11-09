// ==UserScript==
// @name         NoiTu.Pro - Bot cực bá
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Bot nối từ thông minh, biết diễn và lì đòn
// @author       Hoanglong291 + Vanh
// @match        *://*.noitu.pro/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Bot Launcher v3.3 - "Sạch Sẽ"] Đang khởi động...');

    const SCRIPT_ID = 'vipProBot_v3.3.2_CLEAN';

    let isPaused = false;
    let typingSpeed = 500;
    let startTime = 0;
    let totalTime = 0;
    let wins = 0;
    let losses = 0;
    let wordCache = new Map();

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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

            const winWords = Array.from(wordCache.entries()).filter(([key, value]) => {
                return value === 'WIN_CONDITION';
            });

            winWords.sort((a, b) => a[0].localeCompare(b[0]));

            title.textContent = `Trí Nhớ (Chỉ "Từ Thắng") - ${winWords.length} từ`;

            if (winWords.length === 0) {
                const emptyLi = document.createElement('li');
                emptyLi.textContent = 'Trí nhớ "Từ Thắng" đang "trống trơn".';
                emptyLi.style.textAlign = 'center';
                listContainer.appendChild(emptyLi);
            } else {
                winWords.forEach(([key, value]) => {
                    const li = document.createElement('li');
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    li.style.borderBottom = '1px solid #eee';
                    li.style.padding = '8px 5px';

                    const textSpan = document.createElement('span');
                    textSpan.innerHTML = `<b>"${key}"</b> → <i>"TỪ THẮNG"</i>`;
                    li.appendChild(textSpan);

                    li.style.backgroundColor = '#d4edda';
                    li.style.color = '#155724';

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

    function exportCacheToTxt() {
        console.log('[Bot] Đang xuất cache "Từ Thắng" ra file .txt...');
        let winWordCount = 0;
        let content = '';

        const sortedCache = Array.from(wordCache.entries()).sort((a, b) => {
            const aIsWin = (a[1] === 'WIN_CONDITION');
            const bIsWin = (b[1] === 'WIN_CONDITION');
            if (aIsWin && !bIsWin) return -1;
            if (!aIsWin && bIsWin) return 1;
            return a[0].localeCompare(b[0]);
        });

        sortedCache.forEach(([key, value]) => {
            if (value === 'WIN_CONDITION') {
                winWordCount++;
                const head = key.split(' ')[0];
                content += `"${key}" → "${head}"\n`;
            }
        });

        if (winWordCount === 0) {
            alert('Bot chưa "học" được "Từ Thắng" nào, không có gì để tải.');
            return;
        }

        const fullContent = `[Bot Nối Từ - Danh Sách "Từ Thắng"]\n` +
                          `Ngày xuất: ${new Date().toLocaleString('vi-VN')}\n` +
                          `Tổng cộng: ${winWordCount} từ\n` +
                          `----------------------------------------\n\n` +
                          content;

        const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `noitu_pro_win_cache_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
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
        dashboard.style.userSelect = 'none';

        const title = document.createElement('h3');
        title.textContent = 'Bot Nối Từ';
        title.style.textAlign = 'center';
        title.style.margin = '0 0 10px 0';
        title.style.cursor = 'move';
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
        viewCacheButton.textContent = 'Xem/Xóa "Từ Thắng"';
        viewCacheButton.style.width = '100%';
        viewCacheButton.style.padding = '5px';
        viewCacheButton.style.marginTop = '5px';
        viewCacheButton.style.backgroundColor = '#007bff';
        viewCacheButton.style.color = 'white';
        viewCacheButton.style.border = 'none';
        viewCacheButton.style.borderRadius = '5px';
        viewCacheButton.style.cursor = 'pointer';
        dashboard.appendChild(viewCacheButton);

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

        const exportCacheButton = document.createElement('button');
        exportCacheButton.textContent = 'Tải (Export) Từ Thắng (.txt)';
        exportCacheButton.style.width = '100%';
        exportCacheButton.style.padding = '5px';
        exportCacheButton.style.marginTop = '5px';
        exportCacheButton.style.backgroundColor = '#28a745';
        exportCacheButton.style.color = 'white';
        exportCacheButton.style.border = 'none';
        exportCacheButton.style.borderRadius = '5px';
        exportCacheButton.style.cursor = 'pointer';
        dashboard.appendChild(exportCacheButton);

        const resetStatsButton = document.createElement('button');
        resetStatsButton.textContent = 'Reset Stats (W/L, Giờ)';
        resetStatsButton.style.width = '100%';
        resetStatsButton.style.padding = '5px';
        resetStatsButton.style.marginTop = '5px';
        resetStatsButton.style.backgroundColor = '#6c757d'; // Màu Xám
        resetStatsButton.style.color = 'white';
        resetStatsButton.style.border = 'none';
        resetStatsButton.style.borderRadius = '5px';
        resetStatsButton.style.cursor = 'pointer';
        dashboard.appendChild(resetStatsButton);
        // ======== [HẾT NÚT MỚI] ========

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

        title.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const rect = dashboard.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            dashboard.style.right = 'auto';
            dashboard.style.left = rect.left + 'px';
            dashboard.style.top = rect.top + 'px';
            function dragElement(e) {
                e.preventDefault();
                dashboard.style.top = (e.clientY - offsetY) + 'px';
                dashboard.style.left = (e.clientX - offsetX) + 'px';
            }
            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
            document.onmousemove = dragElement;
            document.onmouseup = closeDragElement;
        });

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

        exportCacheButton.addEventListener('click', exportCacheToTxt);

        resetStatsButton.addEventListener('click', () => {
            if (confirm('Bạn chắc chắn muốn RESET toàn bộ stats (Thắng/Thua/Giờ) về 0?\n(Cache "Từ Thắng" sẽ được giữ nguyên)')) {
                wins = 0;
                losses = 0;
                totalTime = 0;
                startTime = Date.now();
                saveState();
                console.log('[Bot] Đã reset Stats (W/L, Giờ)!');
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

        async function typeLikeHuman(word, speedMode = 'normal') {
            textInput.value = '';
            let currentTypingSpeed = parseInt(typingSpeed, 10);

            switch (speedMode) {
                case 'thinking':
                    await wait(800 + Math.random() * 400);
                    currentTypingSpeed = typingSpeed;
                    break;
                case 'fast':
                    currentTypingSpeed = Math.max(100, typingSpeed / 2);
                    break;
                case 'slow':
                    currentTypingSpeed = (typingSpeed * 2) + 500;
                    break;
                default:
                    currentTypingSpeed = typingSpeed;
            }

            const baseDelay = currentTypingSpeed / (word.length + 1);
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

        async function fetchWithRetry(url, retries = 3, delay = 1000) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.warn(`[Bot Fetch] Lỗi: ${error.message}. Thử lại... (còn ${retries - 1} lần)`);
                if (retries > 0) {
                    await wait(delay);
                    return fetchWithRetry(url, retries - 1, delay);
                } else {
                    console.error('[Bot Fetch] Hết lượt thử lại, "bó tay" ván này!');
                    return null;
                }
            }
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
                            typeLikeHuman(head, 'slow');
                        } else {
                            typeLikeHuman(cachedAnswer, 'fast');
                        }
                        return;
                    }

                    console.log(`[Cache MISS]: Fetch từ mới: ${currentWord}`);

                    fetchWithRetry(`https://noitu.pro/answer?word=${encodeURIComponent(currentWord)}`)
                        .then(data => {
                            if (isPaused) return;

                            if (!data) {
                                displayTempMessage('Lỗi API! Bot "bó tay"!', "red");
                                return;
                            }

                            if (data.success && data.nextWord) {
                                if (data.win) {
                                    console.log(`[Bot] API báo ${currentWord} là TỪ LỖI (WIN_CONDITION)`);
                                    wordCache.set(currentWord, "WIN_CONDITION");
                                    saveState();
                                    const head = currentWord.split(' ')[0];
                                    typeLikeHuman(head, 'thinking');
                                } else {
                                    console.log(`[Bot] API trả lời cho ${currentWord} là ${data.nextWord.tail}`);
                                    const tail = data.nextWord.tail;
                                    wordCache.set(currentWord, tail);
                                    saveState();
                                    typeLikeHuman(tail, 'thinking');
                                }
                            } else if (data.success === false) {
                                console.log(`[Bot] API báo ${currentWord} KHÔNG CÓ TỪ NỐI! => Lưu WIN_CONDITION`);
                                wordCache.set(currentWord, "WIN_CONDITION");
                                saveState();

                                const head = currentWord.split(' ')[0];
                                typeLikeHuman(head, 'thinking');
                            } else {
                                console.warn(`[Bot] API trả về data lạ cho "${currentWord}":`, data);
                                displayTempMessage('Lỗi API (lạ)! Bot "bó tay"!', "orange");
                            }
                        });
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
            console.log('[Bot Launcher] Đã nhận diện trang MENU. Bot đang chạy (chờ vào game)...');
            clearInterval(launcherInterval);

        } else {
            console.log(`[Bot Launcher] Đang ở trang lạ (${path}). Sẽ không làm gì.`);
            clearInterval(launcherInterval);
        }
    }, 500);

})();
