// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000/api';

// DOM 요소 가져오기
const todoTitleInput = document.getElementById('todoTitle');
const todoDescriptionInput = document.getElementById('todoDescription');
const todoCategorySelect = document.getElementById('todoCategory');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryFilterSelect = document.getElementById('categoryFilter');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const loadingSpinner = document.getElementById('loadingSpinner');
const notification = document.getElementById('notification');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// 모달 관련 요소
const categoryModal = document.getElementById('categoryModal');
const closeModal = document.getElementById('closeModal');
const cancelCategory = document.getElementById('cancelCategory');
const saveCategory = document.getElementById('saveCategory');
const newCategoryName = document.getElementById('newCategoryName');
const newCategoryColor = document.getElementById('newCategoryColor');

// 통계 모달 관련 요소
const statsModal = document.getElementById('statsModal');
const showStatsBtn = document.getElementById('showStatsBtn');
const closeStatsModal = document.getElementById('closeStatsModal');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const statsTabs = document.querySelectorAll('.stats-tab');
const statsTabContents = document.querySelectorAll('.stats-tab-content');

// 통계 요소
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// 필터 버튼
const filterButtons = document.querySelectorAll('.filter-btn');

// 전역 상태
let todos = [];
let categories = [];
let currentFilter = 'all';
let currentCategoryFilter = 'all';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('TodoList 앱 초기화...');
    loadCategories();
    loadTodos();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 할 일 추가
    addBtn.addEventListener('click', handleAddTodo);
    todoTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });
    todoDescriptionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });

    // 완료된 항목 삭제
    clearCompletedBtn.addEventListener('click', handleClearCompleted);

    // 전체 삭제
    clearAllBtn.addEventListener('click', handleClearAll);

    // 필터 버튼
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // 카테고리 필터
    categoryFilterSelect.addEventListener('change', () => {
        currentCategoryFilter = categoryFilterSelect.value;
        renderTodos();
    });

    // 카테고리 추가 버튼
    addCategoryBtn.addEventListener('click', () => {
        showCategoryModal();
    });

    // 모달 이벤트
    closeModal.addEventListener('click', hideCategoryModal);
    cancelCategory.addEventListener('click', hideCategoryModal);
    saveCategory.addEventListener('click', handleSaveCategory);

    // 모달 외부 클릭시 닫기
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            hideCategoryModal();
        }
    });

    // 통계 모달 이벤트
    showStatsBtn.addEventListener('click', showStatsModal);
    closeStatsModal.addEventListener('click', hideStatsModal);
    closeStatsBtn.addEventListener('click', hideStatsModal);

    // 통계 탭 이벤트
    statsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchStatsTab(tabName);
        });
    });

    // 통계 모달 외부 클릭시 닫기
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) {
            hideStatsModal();
        }
    });
}

// API 호출 함수들
async function apiCall(endpoint, method = 'GET', data = null) {
    showLoading();
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API 호출 오류:', error);
        showNotification('오류가 발생했습니다: ' + error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// 모든 카테고리 불러오기
async function loadCategories() {
    try {
        categories = await apiCall('/categories');
        updateCategorySelects();
    } catch (error) {
        console.error('카테고리 목록 불러오기 실패:', error);
    }
}

// 모든 할 일 불러오기
async function loadTodos() {
    try {
        todos = await apiCall('/todos');
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('할 일 목록 불러오기 실패:', error);
    }
}

// 할 일 추가
async function handleAddTodo() {
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    const category = todoCategorySelect.value;

    if (!title) {
        showNotification('할 일 제목을 입력해주세요!', 'error');
        todoTitleInput.focus();
        return;
    }

    try {
        const newTodo = await apiCall('/todos', 'POST', {
            title,
            description,
            category,
            completed: false
        });

        todos.push(newTodo);
        renderTodos();
        updateStats();

        // 입력 필드 초기화
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
        todoTitleInput.focus();

        showNotification('할 일이 추가되었습니다! ✅');
    } catch (error) {
        console.error('할 일 추가 실패:', error);
    }
}

// 할 일 토글 (완료/미완료)
async function handleToggleTodo(id) {
    try {
        const updatedTodo = await apiCall(`/todos/${id}/toggle`, 'PATCH');
        
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();
            updateStats();
        }
    } catch (error) {
        console.error('할 일 토글 실패:', error);
    }
}

// 할 일 삭제
async function handleDeleteTodo(id) {
    if (!confirm('정말 이 할 일을 삭제하시겠습니까?')) {
        return;
    }

    try {
        await apiCall(`/todos/${id}`, 'DELETE');
        
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateStats();

        showNotification('할 일이 삭제되었습니다! 🗑️');
    } catch (error) {
        console.error('할 일 삭제 실패:', error);
    }
}

// 할 일 수정
async function handleEditTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newTitle = prompt('새로운 제목을 입력하세요:', todo.title);
    if (newTitle === null || newTitle.trim() === '') return;

    const newDescription = prompt('새로운 설명을 입력하세요:', todo.description || '');

    try {
        const updatedTodo = await apiCall(`/todos/${id}`, 'PUT', {
            title: newTitle.trim(),
            description: newDescription ? newDescription.trim() : '',
            completed: todo.completed
        });

        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();
        }

        showNotification('할 일이 수정되었습니다! ✏️');
    } catch (error) {
        console.error('할 일 수정 실패:', error);
    }
}

// 완료된 항목 삭제
async function handleClearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
        showNotification('완료된 항목이 없습니다.', 'error');
        return;
    }

    if (!confirm(`완료된 ${completedTodos.length}개의 항목을 삭제하시겠습니까?`)) {
        return;
    }

    try {
        // 각 완료된 항목 삭제
        for (const todo of completedTodos) {
            await apiCall(`/todos/${todo.id}`, 'DELETE');
        }

        todos = todos.filter(t => !t.completed);
        renderTodos();
        updateStats();

        showNotification(`${completedTodos.length}개의 완료된 항목이 삭제되었습니다! 🧹`);
    } catch (error) {
        console.error('완료된 항목 삭제 실패:', error);
    }
}

// 전체 삭제
async function handleClearAll() {
    if (todos.length === 0) {
        showNotification('삭제할 항목이 없습니다.', 'error');
        return;
    }

    if (!confirm(`모든 ${todos.length}개의 할 일을 삭제하시겠습니까?`)) {
        return;
    }

    try {
        await apiCall('/todos', 'DELETE');
        
        todos = [];
        renderTodos();
        updateStats();

        showNotification('모든 할 일이 삭제되었습니다! 🧹');
    } catch (error) {
        console.error('전체 삭제 실패:', error);
    }
}

// 할 일 목록 렌더링
function renderTodos() {
    // 필터링
    let filteredTodos = todos;
    
    // 상태 필터링
    if (currentFilter === 'active') {
        filteredTodos = filteredTodos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(t => t.completed);
    }
    
    // 카테고리 필터링
    if (currentCategoryFilter !== 'all') {
        filteredTodos = filteredTodos.filter(t => t.category === currentCategoryFilter);
    }

    // 빈 상태 처리
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // 할 일 목록 렌더링
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="handleToggleTodo(${todo.id})"
            >
            <div class="todo-content" onclick="handleToggleTodo(${todo.id})">
                <div class="todo-title">
                    ${escapeHtml(todo.title)}
                    <span class="category-badge ${todo.category || '기본'}">${todo.category || '기본'}</span>
                </div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                ${todo.created_at ? `<div class="todo-meta">생성: ${formatDate(todo.created_at)}</div>` : ''}
            </div>
            <div class="todo-actions">
                <button class="action-btn edit-btn" onclick="handleEditTodo(${todo.id})" title="수정">
                    ✏️
                </button>
                <button class="action-btn delete-btn" onclick="handleDeleteTodo(${todo.id})" title="삭제">
                    🗑️
                </button>
            </div>
        </li>
    `).join('');
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// 유틸리티 함수들
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 1분 미만
    if (diff < 60000) {
        return '방금 전';
    }
    // 1시간 미만
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}분 전`;
    }
    // 24시간 미만
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}시간 전`;
    }
    
    // 그 외에는 날짜 표시
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 카테고리 관련 함수들
function updateCategorySelects() {
    // 할 일 추가용 카테고리 선택
    todoCategorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        option.style.color = category.color;
        todoCategorySelect.appendChild(option);
    });

    // 필터용 카테고리 선택
    categoryFilterSelect.innerHTML = '<option value="all">모든 카테고리</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        option.style.color = category.color;
        categoryFilterSelect.appendChild(option);
    });
}

function showCategoryModal() {
    categoryModal.style.display = 'block';
    newCategoryName.value = '';
    newCategoryColor.value = '#3B82F6';
    newCategoryName.focus();
}

function hideCategoryModal() {
    categoryModal.style.display = 'none';
}

async function handleSaveCategory() {
    const name = newCategoryName.value.trim();
    const color = newCategoryColor.value;

    if (!name) {
        showNotification('카테고리 이름을 입력해주세요!', 'error');
        newCategoryName.focus();
        return;
    }

    // 중복 체크
    if (categories.some(cat => cat.name === name)) {
        showNotification('이미 존재하는 카테고리입니다!', 'error');
        newCategoryName.focus();
        return;
    }

    try {
        const newCategory = await apiCall('/categories', 'POST', {
            name,
            color
        });

        categories.push(newCategory);
        updateCategorySelects();
        hideCategoryModal();

        showNotification('새 카테고리가 추가되었습니다! 🏷️');
    } catch (error) {
        console.error('카테고리 추가 실패:', error);
    }
}

// 통계 관련 함수들
function showStatsModal() {
    statsModal.style.display = 'block';
    loadOverviewStats();
}

function hideStatsModal() {
    statsModal.style.display = 'none';
}

function switchStatsTab(tabName) {
    // 모든 탭 비활성화
    statsTabs.forEach(tab => tab.classList.remove('active'));
    statsTabContents.forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 해당 탭 데이터 로드
    switch(tabName) {
        case 'overview':
            loadOverviewStats();
            break;
        case 'daily':
            loadDailyStats();
            break;
        case 'weekly':
            loadWeeklyStats();
            break;
        case 'productivity':
            loadProductivityStats();
            break;
        case 'completion':
            loadCompletionStats();
            break;
    }
}

async function loadOverviewStats() {
    try {
        const stats = await apiCall('/stats/overview');
        
        document.getElementById('totalTodos').textContent = stats.total_todos;
        document.getElementById('completedTodos').textContent = stats.completed_todos;
        document.getElementById('activeTodos').textContent = stats.active_todos;
        document.getElementById('completionRate').textContent = `${stats.overall_completion_rate}%`;
        
        // 카테고리별 통계
        const categoryStatsList = document.getElementById('categoryStatsList');
        categoryStatsList.innerHTML = '';
        
        for (const [categoryName, categoryStats] of Object.entries(stats.category_stats)) {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-stat-item';
            categoryItem.innerHTML = `
                <div class="category-name">${categoryName}</div>
                <div class="category-numbers">
                    <span>전체: ${categoryStats.total}</span>
                    <span>완료: ${categoryStats.completed}</span>
                    <span>완료율: ${categoryStats.completion_rate}%</span>
                </div>
            `;
            categoryStatsList.appendChild(categoryItem);
        }
    } catch (error) {
        console.error('개요 통계 로드 실패:', error);
    }
}

async function loadDailyStats() {
    try {
        const dailyStats = await apiCall('/stats/daily?days=7');
        
        // 차트 생성
        const ctx = document.getElementById('dailyChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailyStats.map(stat => stat.date),
                datasets: [{
                    label: '완료된 할 일',
                    data: dailyStats.map(stat => stat.completed),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: '생성된 할 일',
                    data: dailyStats.map(stat => stat.created),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '일별 할 일 현황'
                    }
                }
            }
        });
        
        // 상세 통계 표시
        const dailyStatsList = document.getElementById('dailyStatsList');
        dailyStatsList.innerHTML = '';
        
        dailyStats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'daily-stats-item';
            statItem.innerHTML = `
                <div class="date">${stat.date}</div>
                <div class="numbers">
                    <span>생성: ${stat.created}</span>
                    <span>완료: ${stat.completed}</span>
                    <span>완료율: ${stat.completion_rate}%</span>
                </div>
            `;
            dailyStatsList.appendChild(statItem);
        });
    } catch (error) {
        console.error('일별 통계 로드 실패:', error);
    }
}

async function loadWeeklyStats() {
    try {
        const weeklyStats = await apiCall('/stats/weekly?weeks=4');
        
        // 차트 생성
        const ctx = document.getElementById('weeklyChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weeklyStats.map(stat => stat.week),
                datasets: [{
                    label: '완료된 할 일',
                    data: weeklyStats.map(stat => stat.completed),
                    backgroundColor: '#3B82F6'
                }, {
                    label: '생성된 할 일',
                    data: weeklyStats.map(stat => stat.created),
                    backgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '주별 할 일 현황'
                    }
                }
            }
        });
        
        // 상세 통계 표시
        const weeklyStatsList = document.getElementById('weeklyStatsList');
        weeklyStatsList.innerHTML = '';
        
        weeklyStats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'weekly-stats-item';
            statItem.innerHTML = `
                <div class="week">${stat.week}</div>
                <div class="numbers">
                    <span>생성: ${stat.created}</span>
                    <span>완료: ${stat.completed}</span>
                    <span>완료율: ${stat.completion_rate}%</span>
                </div>
            `;
            weeklyStatsList.appendChild(statItem);
        });
    } catch (error) {
        console.error('주별 통계 로드 실패:', error);
    }
}

async function loadProductivityStats() {
    try {
        const productivityStats = await apiCall('/stats/productivity');
        
        document.getElementById('productivityRate').textContent = `${productivityStats.productivity_rate}%`;
        document.getElementById('totalCreated').textContent = productivityStats.total_created;
        document.getElementById('totalCompleted').textContent = productivityStats.total_completed;
        
        // 생산성 차트 생성
        const ctx = document.getElementById('productivityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: productivityStats.daily_productivity.map(day => day.date),
                datasets: [{
                    label: '생성된 할 일',
                    data: productivityStats.daily_productivity.map(day => day.created),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }, {
                    label: '완료된 할 일',
                    data: productivityStats.daily_productivity.map(day => day.completed),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }, {
                    label: '순 생산성',
                    data: productivityStats.daily_productivity.map(day => day.net_productivity),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '일별 생산성 추이'
                    }
                }
            }
        });
    } catch (error) {
        console.error('생산성 통계 로드 실패:', error);
    }
}

async function loadCompletionStats() {
    try {
        const completionStats = await apiCall('/stats/completion-time');
        
        if (completionStats.message) {
            document.getElementById('avgCompletionTime').textContent = '데이터 없음';
            document.getElementById('totalCompletedForTime').textContent = '0';
            document.getElementById('completionTimeDetails').innerHTML = '<p>완료된 할 일이 없습니다.</p>';
            return;
        }
        
        document.getElementById('avgCompletionTime').textContent = `${completionStats.avg_completion_hours}시간`;
        document.getElementById('totalCompletedForTime').textContent = completionStats.total_completed;
        
        // 완료 시간 상세 정보
        const completionDetails = document.getElementById('completionTimeDetails');
        completionDetails.innerHTML = '';
        
        completionStats.completion_details.forEach(detail => {
            const completionItem = document.createElement('div');
            completionItem.className = 'completion-item';
            completionItem.innerHTML = `
                <div class="todo-info">
                    <div class="todo-title">${detail.title}</div>
                    <div class="todo-category">${detail.category}</div>
                </div>
                <div class="completion-time">${detail.completion_hours}시간</div>
            `;
            completionDetails.appendChild(completionItem);
        });
    } catch (error) {
        console.error('완료 시간 통계 로드 실패:', error);
    }
}

