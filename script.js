// Content Calendar Planner JavaScript

let currentDate = new Date();
let selectedPlatforms = [];
let contentData = {};
let currentView = 'month';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadContentData();
    generateCalendar();
    updateStats();
    initializePlatformSelectors();
    initializeViewSelectors();
    setDefaultDate();
});

// Content data management
function loadContentData() {
    const saved = localStorage.getItem('contentCalendarData');
    if (saved) {
        contentData = JSON.parse(saved);
    }
}

function saveContentData() {
    localStorage.setItem('contentCalendarData', JSON.stringify(contentData));
}

// Calendar generation
function generateCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day of current month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Add classes for styling
        if (date.getMonth() !== currentDate.getMonth()) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday(date)) {
            dayElement.classList.add('today');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Add content items for this date
        const dateKey = formatDateKey(date);
        if (contentData[dateKey]) {
            contentData[dateKey].forEach(content => {
                const contentItem = createContentItem(content);
                dayElement.appendChild(contentItem);
            });
        }
        
        // Add click handler
        dayElement.addEventListener('click', () => openAddContentForDate(date));
        
        grid.appendChild(dayElement);
    }
    
    // Update month display
    document.getElementById('currentMonth').textContent = 
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function createContentItem(content) {
    const item = document.createElement('div');
    item.className = `content-item ${content.platforms[0] || 'default'}`;
    item.textContent = content.title.substring(0, 20) + (content.title.length > 20 ? '...' : '');
    item.title = `${content.title}\nTime: ${content.time}\nPlatforms: ${content.platforms.join(', ')}`;
    
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        editContent(content);
    });
    
    return item;
}

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// Navigation functions
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
    updateStats();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
    updateStats();
}

function goToToday() {
    currentDate = new Date();
    generateCalendar();
    updateStats();
}

// Modal management
function openAddContent() {
    document.getElementById('addContentModal').style.display = 'block';
    setDefaultDate();
}

function openAddContentForDate(date) {
    document.getElementById('addContentModal').style.display = 'block';
    document.getElementById('contentDate').value = formatDateKey(date);
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    resetForm();
}

function resetForm() {
    document.getElementById('contentTitle').value = '';
    document.getElementById('contentDescription').value = '';
    document.getElementById('contentTime').value = '09:00';
    document.getElementById('contentType').value = 'post';
    selectedPlatforms = [];
    updatePlatformSelectors();
}

function setDefaultDate() {
    const today = new Date();
    document.getElementById('contentDate').value = formatDateKey(today);
}

// Platform selection
function initializePlatformSelectors() {
    const platforms = document.querySelectorAll('.platform-option');
    platforms.forEach(platform => {
        platform.addEventListener('click', function() {
            const platformId = this.dataset.platform;
            togglePlatform(platformId);
            updatePlatformSelectors();
        });
    });
}

function togglePlatform(platformId) {
    const index = selectedPlatforms.indexOf(platformId);
    if (index > -1) {
        selectedPlatforms.splice(index, 1);
    } else {
        selectedPlatforms.push(platformId);
    }
}

function updatePlatformSelectors() {
    const platforms = document.querySelectorAll('.platform-option');
    platforms.forEach(platform => {
        const platformId = platform.dataset.platform;
        if (selectedPlatforms.includes(platformId)) {
            platform.classList.add('selected');
        } else {
            platform.classList.remove('selected');
        }
    });
}

// Content management
function saveContent() {
    const title = document.getElementById('contentTitle').value.trim();
    const description = document.getElementById('contentDescription').value.trim();
    const date = document.getElementById('contentDate').value;
    const time = document.getElementById('contentTime').value;
    const type = document.getElementById('contentType').value;
    
    // Validation
    if (!title) {
        alert('Please enter a content title!');
        return;
    }
    
    if (!date) {
        alert('Please select a date!');
        return;
    }
    
    if (selectedPlatforms.length === 0) {
        alert('Please select at least one platform!');
        return;
    }
    
    // Create content object
    const content = {
        id: Date.now(),
        title: title,
        description: description,
        date: date,
        time: time,
        type: type,
        platforms: [...selectedPlatforms],
        created: new Date().toISOString()
    };
    
    // Add to content data
    if (!contentData[date]) {
        contentData[date] = [];
    }
    
    contentData[date].push(content);
    
    // Save and refresh
    saveContentData();
    generateCalendar();
    updateStats();
    closeModal();
    
    showNotification('Content added successfully! 🎉');
}

function editContent(content) {
    // Populate form with content data
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentDescription').value = content.description;
    document.getElementById('contentDate').value = content.date;
    document.getElementById('contentTime').value = content.time;
    document.getElementById('contentType').value = content.type;
    
    selectedPlatforms = [...content.platforms];
    updatePlatformSelectors();
    
    // Show modal
    document.getElementById('addContentModal').style.display = 'block';
    
    // Add delete button
    addDeleteButton(content);
}

function addDeleteButton(content) {
    const existingDeleteBtn = document.querySelector('.delete-content-btn');
    if (existingDeleteBtn) {
        existingDeleteBtn.remove();
    }
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-secondary delete-content-btn';
    deleteBtn.style.background = '#dc3545';
    deleteBtn.style.color = 'white';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.onclick = () => deleteContent(content);
    
    const modalActions = document.querySelector('.modal-actions');
    modalActions.insertBefore(deleteBtn, modalActions.firstChild);
}

function deleteContent(content) {
    if (confirm('Are you sure you want to delete this content?')) {
        const dateKey = content.date;
        if (contentData[dateKey]) {
            contentData[dateKey] = contentData[dateKey].filter(item => item.id !== content.id);
            if (contentData[dateKey].length === 0) {
                delete contentData[dateKey];
            }
        }
        
        saveContentData();
        generateCalendar();
        updateStats();
        closeModal();
        
        showNotification('Content deleted successfully! 🗑️');
    }
}

// Statistics
function updateStats() {
    const totalContent = Object.values(contentData).flat().length;
    const thisWeek = getThisWeekContent().length;
    const platforms = getActivePlatforms().size;
    const consistency = calculateConsistency();
    
    document.getElementById('totalContent').textContent = totalContent;
    document.getElementById('thisWeek').textContent = thisWeek;
    document.getElementById('platforms').textContent = platforms;
    document.getElementById('consistency').textContent = consistency + '%';
}

function getThisWeekContent() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const thisWeekContent = [];
    
    for (let date = new Date(startOfWeek); date <= endOfWeek; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateKey(date);
        if (contentData[dateKey]) {
            thisWeekContent.push(...contentData[dateKey]);
        }
    }
    
    return thisWeekContent;
}

function getActivePlatforms() {
    const platforms = new Set();
    Object.values(contentData).flat().forEach(content => {
        content.platforms.forEach(platform => platforms.add(platform));
    });
    return platforms;
}

function calculateConsistency() {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = formatDateKey(date);
        last30Days.push(contentData[dateKey] ? contentData[dateKey].length : 0);
    }
    
    const daysWithContent = last30Days.filter(count => count > 0).length;
    return Math.round((daysWithContent / 30) * 100);
}

// View selectors
function initializeViewSelectors() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            // View switching functionality can be added here
        });
    });
}

// Best times modal
function openBestTimes() {
    document.getElementById('bestTimesModal').style.display = 'block';
}

// Content ideas generation
function generateIdeas() {
    const ideas = [
        "Behind-the-scenes content",
        "Tips and tricks post",
        "User-generated content feature",
        "Industry news commentary",
        "Tutorial or how-to guide",
        "Poll or question for engagement",
        "Motivational quote with personal story",
        "Product showcase or review",
        "Team member spotlight",
        "Before and after comparison",
        "FAQ addressing common questions",
        "Trending topic discussion",
        "Personal achievement or milestone",
        "Educational infographic",
        "Customer success story"
    ];
    
    const randomIdeas = ideas.sort(() => 0.5 - Math.random()).slice(0, 5);
    const ideaText = randomIdeas.map((idea, index) => `${index + 1}. ${idea}`).join('\n');
    
    showNotification(`💡 Content Ideas:\n\n${ideaText}`, 8000);
}

// Export/Import functionality
function exportCalendar() {
    const dataStr = JSON.stringify(contentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-calendar-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Calendar exported successfully! 📤');
}

function importCalendar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (confirm('This will replace your current calendar data. Continue?')) {
                        contentData = importedData;
                        saveContentData();
                        generateCalendar();
                        updateStats();
                        showNotification('Calendar imported successfully! 📥');
                    }
                } catch (error) {
                    alert('Invalid file format. Please select a valid calendar export file.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Notification system
function showNotification(message, duration = 3000) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 3000;
        max-width: 300px;
        white-space: pre-line;
        font-size: 14px;
        line-height: 1.4;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + N opens new content modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddContent();
    }
    
    // Ctrl/Cmd + E exports calendar
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportCalendar();
    }
    
    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && !isModalOpen()) {
        previousMonth();
    }
    if (e.key === 'ArrowRight' && !isModalOpen()) {
        nextMonth();
    }
});

function isModalOpen() {
    return document.querySelector('.modal[style*="display: block"]') !== null;
}

// Click outside modal to close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Auto-save draft functionality
let draftTimeout;
function saveDraft() {
    clearTimeout(draftTimeout);
    draftTimeout = setTimeout(() => {
        const draft = {
            title: document.getElementById('contentTitle').value,
            description: document.getElementById('contentDescription').value,
            date: document.getElementById('contentDate').value,
            time: document.getElementById('contentTime').value,
            type: document.getElementById('contentType').value,
            platforms: selectedPlatforms
        };
        localStorage.setItem('contentDraft', JSON.stringify(draft));
    }, 1000);
}

// Load draft on modal open
function loadDraft() {
    const draft = localStorage.getItem('contentDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        if (draftData.title) {
            if (confirm('Load saved draft?')) {
                document.getElementById('contentTitle').value = draftData.title;
                document.getElementById('contentDescription').value = draftData.description;
                document.getElementById('contentDate').value = draftData.date;
                document.getElementById('contentTime').value = draftData.time;
                document.getElementById('contentType').value = draftData.type;
                selectedPlatforms = draftData.platforms || [];
                updatePlatformSelectors();
            }
        }
    }
}

// Add draft saving to form inputs
document.getElementById('contentTitle').addEventListener('input', saveDraft);
document.getElementById('contentDescription').addEventListener('input', saveDraft);

// Clear draft when content is saved
const originalSaveContent = saveContent;
saveContent = function() {
    localStorage.removeItem('contentDraft');
    originalSaveContent();
};

// Initialize tooltips for better UX
function initializeTooltips() {
    const elements = document.querySelectorAll('[title]');
    elements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.title;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 4000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    
    e.target.tooltipElement = tooltip;
}

function hideTooltip(e) {
    if (e.target.tooltipElement) {
        e.target.tooltipElement.remove();
        delete e.target.tooltipElement;
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    
    // Add helpful keyboard shortcut info
    setTimeout(() => {
        showNotification('💡 Tip: Use Ctrl+N to add content, arrow keys to navigate, Esc to close modals', 5000);
    }, 2000);
});