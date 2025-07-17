// =================================================================
// 전역 변수 (Global Variables)
// =================================================================
let currentFilter = 'all';
let expressions = [];
let currentUser = null;
let authToken = null;

const API_BASE_URL = ''; // We are serving from the same origin

// =================================================================
// 인증 관련 함수 (Authentication Functions)
// =================================================================
function handleCredentialResponse(response) {
    console.log('Google 인증 응답 받음');
    
    // Send token to server for verification
    fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForAuthenticatedUser();
        } else {
            showErrorMessage('인증에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('인증 오류:', error);
        showErrorMessage('인증 중 오류가 발생했습니다.');
    });
}

function logout() {
    fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        }
    })
    .then(() => {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        updateUIForUnauthenticatedUser();
    })
    .catch(error => {
        console.error('로그아웃 오류:', error);
    });
}

function checkAuthStatus() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        // Verify token with server
        fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                authToken = savedToken;
                currentUser = JSON.parse(savedUser);
                updateUIForAuthenticatedUser();
            } else {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                updateUIForUnauthenticatedUser();
            }
        })
        .catch(error => {
            console.error('인증 확인 오류:', error);
            updateUIForUnauthenticatedUser();
        });
    } else {
        updateUIForUnauthenticatedUser();
    }
}

function updateUIForAuthenticatedUser() {
    document.getElementById('auth-loading').style.display = 'none';
    document.getElementById('login-required').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    
    // Update user info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-avatar').src = currentUser.picture || '';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('login-section').style.display = 'none';
    
    // Initialize Google Sign-In for the client ID
    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: '760844845972-enrkoirveojmiemk294h3god1h3l2686.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
            document.querySelector('.login-prompt .g_id_signin'),
            { theme: 'filled_blue', size: 'large' }
        );
    }
}

function updateUIForUnauthenticatedUser() {
    document.getElementById('auth-loading').style.display = 'none';
    document.getElementById('login-required').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    
    // Initialize Google Sign-In
    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: '760844845972-enrkoirveojmiemk294h3god1h3l2686.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
            document.querySelector('.login-prompt .g_id_signin'),
            { theme: 'filled_blue', size: 'large' }
        );
    }
}

function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

// =================================================================
// 초기화 (Initialization)
// =================================================================
window.addEventListener('load', function() {
    console.log('페이지 로드 완료');
    
    // Add logout button event listener
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Check authentication status
    checkAuthStatus();
    
    // Wait for Google Sign-In to load
    window.addEventListener('load', function() {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: '760844845972-enrkoirveojmiemk294h3god1h3l2686.apps.googleusercontent.com',
                callback: handleCredentialResponse
            });
        }
    });
});

// =================================================================
// UI 제어 함수 (UI Control Functions)
// =================================================================
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #e74c3c; color: white; padding: 15px 25px;
        border-radius: 10px; z-index: 1000; font-weight: 500;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => { document.body.removeChild(errorDiv); }, 5000);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    if (tabName === 'study') {
        loadStudyData();
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        searchExpressions();
    }
}

// =================================================================
// 서버 통신 함수 (Server Communication)
// =================================================================
async function searchExpressions() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) {
        alert('표현을 입력해주세요! 🌺');
        return;
    }
    
    if (!authToken) {
        showErrorMessage('로그인이 필요합니다.');
        return;
    }
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('suggestions').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.querySelector('.submit-btn').disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userInput })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error');
        }
        const suggestions = await response.json();
        handleSuggestions(suggestions);
    } catch (error) {
        handleError(error);
    }
}

async function saveExpression(draft, english) {
    if (!authToken) {
        showErrorMessage('로그인이 필요합니다.');
        return;
    }
    
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = '저장 중...';
    successMessage.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/api/expressions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ draft, english })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to save');
        }
        successMessage.textContent = result.message;
        setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
    } catch (error) {
        handleError(error);
    }
}

async function loadStudyData() {
    console.log('복습 데이터 로드 시작');
    
    if (!authToken) {
        showErrorMessage('로그인이 필요합니다.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/expressions`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error');
        }
        const data = await response.json();
        handleStudyData(data);
    } catch (error) {
        handleError(error);
    }
}

function handleError(error) {
    console.error('Error:', error);
    const loadingEl = document.getElementById('loading');
    if(loadingEl) loadingEl.style.display = 'none';
    
    const submitBtn = document.querySelector('.submit-btn:not([style*="auto"])');
    if(submitBtn) submitBtn.disabled = false;
    
    showErrorMessage('오류가 발생했습니다: ' + error.message);
}

// =================================================================
// 데이터 처리 및 UI 업데이트 (Data Handling & UI Update)
// =================================================================
function handleSuggestions(suggestions) {
    document.getElementById('loading').style.display = 'none';
    document.querySelector('.submit-btn').disabled = false;
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    if (suggestions && suggestions.length > 0) {
        suggestions.forEach((suggestion) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="suggestion-text">${suggestion}</div>
                <button class="save-btn" onclick="saveExpression('${document.getElementById('userInput').value.replace(/'/g, "\\'")}', '${suggestion.replace(/'/g, "\\'")}')">
                    💾 저장하기
                </button>
            `;
            suggestionsDiv.appendChild(item);
        });
    } else {
        suggestionsDiv.innerHTML = '<div class="empty-state"><h3>죄송해요! 🙏</h3><p>표현을 찾을 수 없어요. 다른 방식으로 입력해보세요.</p></div>';
    }
    suggestionsDiv.style.display = 'block';
}

function handleStudyData(data) {
    console.log('받은 복습 데이터:', data);
    expressions = data;
    updateStudyUI();
}

function updateStudyUI() {
    const flashcardsDiv = document.getElementById('flashcards');
    const emptyStateDiv = document.getElementById('emptyState');
    const statsDiv = document.getElementById('stats');

    flashcardsDiv.innerHTML = '';

    if (!expressions || expressions.length === 0) {
        emptyStateDiv.style.display = 'block';
        statsDiv.style.display = 'none';
        return;
    }

    emptyStateDiv.style.display = 'none';
    statsDiv.style.display = 'flex';
    updateStats();

    const filteredData = expressions.filter(item => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'memorized') return item.isMemory;
        if (currentFilter === 'not-memorized') return !item.isMemory;
    });

    filteredData.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'flashcard';
        card.innerHTML = `
            <div class="flashcard-content">
                <div class="flashcard-question">${exp.draft}</div>
                <div class="flashcard-answer">${exp.english}</div>
            </div>
            <div class="memory-controls">
                <label class="memory-checkbox">
                    <input type="checkbox" class="memory-checkbox-input" data-id="${exp._id}" ${exp.isMemory ? 'checked' : ''}>
                    <span>암기 완료</span>
                </label>
                <button class="delete-btn" data-id="${exp._id}">삭제</button>
            </div>
        `;
        flashcardsDiv.appendChild(card);
    });
}

function updateStats() {
    if (!expressions) return;
    const total = expressions.length;
    const memorized = expressions.filter(d => d.isMemory).length;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('memorizedCount').textContent = memorized;
    document.getElementById('remainingCount').textContent = total - memorized;
}

function filterCards(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[onclick="filterCards('${filter}')"]`).classList.add('active');
    updateStudyUI();
}

function shuffleCards() {
    for (let i = expressions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [expressions[i], expressions[j]] = [expressions[j], expressions[i]];
    }
    updateStudyUI();
}

// =================================================================
// 이벤트 리스너 (Event Listeners)
// =================================================================
document.getElementById('flashcards').addEventListener('click', async function(event) {
    const target = event.target;

    if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        if (confirm('정말로 이 표현을 삭제하시겠습니까?')) {
            if (!authToken) {
                showErrorMessage('로그인이 필요합니다.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/expressions/${id}`, { 
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to delete');
                }
                target.closest('.flashcard').remove();
                expressions = expressions.filter(e => e._id != id);
                updateStats();
            } catch (error) {
                handleError(error);
            }
        }
    }

    if (target.closest('.flashcard-content')) {
        target.closest('.flashcard').classList.toggle('revealed');
    }
});

document.getElementById('flashcards').addEventListener('change', async function(event) {
    const target = event.target;

    if (target.classList.contains('memory-checkbox-input')) {
        const id = target.dataset.id;
        const isMemory = target.checked;

        if (!authToken) {
            showErrorMessage('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/expressions/${id}/memory`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ isMemory })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update');
            }
            const index = expressions.findIndex(e => e._id == id);
            if (index !== -1) {
                expressions[index].isMemory = isMemory;
                updateStats();
            }
        } catch (error) {
            handleError(error);
            target.checked = !isMemory; // Revert checkbox on error
        }
    }
}); 