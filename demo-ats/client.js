const extractBtn = document.getElementById('extractBtn');
const cvFileInput = document.getElementById('cvFile');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');
const avatarInitials = document.getElementById('avatarInitials');
const dropzone = document.getElementById('dropzone');

const formFields = {
    fullName: document.getElementById('form-fullName'),
    email: document.getElementById('form-email'),
    phone: document.getElementById('form-phone'),
    location: document.getElementById('form-location'),
    currentTitle: document.getElementById('form-currentTitle'),
    totalExperienceMonths: document.getElementById('form-totalExperienceMonths'),
    linkLinkedin: document.getElementById('form-link-linkedin'),
    linkGithub: document.getElementById('form-link-github'),
    linkPortfolio: document.getElementById('form-link-portfolio'),
    professionalSummary: document.getElementById('form-professionalSummary'),
    skills: document.getElementById('form-skills'),
    languages: document.getElementById('form-languages'),
    workExperience: document.getElementById('form-experience'),
    projects: document.getElementById('form-projects'),
    education: document.getElementById('form-education'),
    certifications: document.getElementById('form-certifications')
};

let currentCandidateRecord = null;
let candidatePool = window.SAMPLE_CANDIDATES || [];

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function apiUrl(path) {
    if (window.location.protocol === 'file:') {
        return `http://localhost:3000${path}`; // Chạy bằng file local
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (window.location.port !== '3000') {
            return `http://localhost:3000${path}`; // Chạy Live Server Frontend
        }
    }
    return path; // Đã deploy Vercel hoặc chạy npm start
}

async function readJsonResponse(response, fallbackMessage) {
    const text = await response.text();
    if (!text.trim()) {
        throw new Error(`${fallbackMessage} Server trả về phản hồi rỗng (HTTP ${response.status}).`);
    }

    try {
        const data = JSON.parse(text);
        if (!response.ok) {
            throw new Error(data.error || `${fallbackMessage} HTTP ${response.status}.`);
        }
        return data;
    } catch (error) {
        if (error.message && !error.message.startsWith('Unexpected')) {
            throw error;
        }
        const preview = text.slice(0, 180).replace(/\s+/g, ' ').trim();
        throw new Error(`${fallbackMessage} Server không trả JSON hợp lệ (HTTP ${response.status}). Phản hồi: ${preview || 'rỗng'}`);
    }
}

function setFileName(file) {
    if (file) {
        fileNameDisplay.textContent = `Đã chọn: ${file.name}`;
        fileNameDisplay.style.color = 'var(--color-accent)';
        fileNameDisplay.style.fontWeight = '800';
    } else {
        fileNameDisplay.textContent = 'PDF tối đa 10MB';
        fileNameDisplay.removeAttribute('style');
    }
}

cvFileInput.addEventListener('change', (event) => {
    setFileName(event.target.files[0]);
});

if (dropzone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.classList.remove('drag-over');
        });
    });

    dropzone.addEventListener('drop', (event) => {
        const file = event.dataTransfer.files[0];
        if (!file) return;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        cvFileInput.files = transfer.files;
        setFileName(file);
    });
}

extractBtn.addEventListener('click', async () => {
    const files = cvFileInput.files;

    if (files.length === 0) {
        alert('Vui lòng chọn file CV.');
        return;
    }

    const tClientStart = Date.now();
    showCandidateDetail();
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('cvFile', files[0]);

        const response = await fetch(apiUrl('/api/parse-cv'), {
            method: 'POST',
            body: formData
        });

        const candidateRecord = await readJsonResponse(response, 'Không thể trích xuất CV.');
        const totalClientMs = Date.now() - tClientStart;

        currentCandidateRecord = candidateRecord;
        candidatePool.unshift(candidateRecord);
        fillForm(candidateRecord);
        renderCandidateGrid(candidatePool);

        displayTimings(candidateRecord._timings, totalClientMs);
    } catch (error) {
        alert('Đã xảy ra lỗi: ' + error.message);
    } finally {
        setLoading(false);
    }
});

// Hiển thị thống kê thời gian thực hiện từng bước
function displayTimings(timings, totalClientMs) {
    const banner = document.getElementById('timingBanner');
    if (!banner) return;

    const pdfMs = timings?.pdfParseMs || 0;
    const aiMs = timings?.aiInferenceMs || 0;
    const serverMs = timings?.totalServerMs || (pdfMs + aiMs);
    const clientNetworkMs = Math.max(0, totalClientMs - serverMs);

    const totalEl = document.getElementById('timeTotalVal');
    const pdfEl = document.getElementById('timePdfVal');
    const aiEl = document.getElementById('timeAiVal');
    const clientEl = document.getElementById('timeClientVal');

    if (totalEl) totalEl.textContent = `${(totalClientMs / 1000).toFixed(2)}s`;
    if (pdfEl) pdfEl.textContent = `${pdfMs}ms`;
    if (aiEl) aiEl.textContent = `${(aiMs / 1000).toFixed(2)}s`;
    if (clientEl) clientEl.textContent = `${(clientNetworkMs / 1000).toFixed(2)}s`;
    banner.classList.remove('hidden');
}

let parseLoadingTimer = null;

// Cập nhật trạng thái loading kèm đồng hồ bấm giờ
function setLoading(isLoading) {
    const formPane = document.getElementById('formPane');
    const overlay = document.getElementById('loadingOverlay');
    const loadingTimeEl = document.getElementById('loadingTime');
    const btnTextEl = document.getElementById('btnText');
    extractBtn.disabled = isLoading;

    if (isLoading) {
        if (formPane) {
            formPane.scrollTop = 0;
            formPane.style.pointerEvents = 'none';
        }
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        const startTime = Date.now();
        if (loadingTimeEl) loadingTimeEl.textContent = 'Đang xử lý: 0.0s';
        if (btnTextEl) btnTextEl.textContent = 'Đang xử lý... (0.0s)';

        clearInterval(parseLoadingTimer);
        parseLoadingTimer = setInterval(() => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (loadingTimeEl) loadingTimeEl.textContent = `Đang xử lý: ${elapsed}s`;
            if (btnTextEl) btnTextEl.textContent = `Đang xử lý... (${elapsed}s)`;
        }, 100);
    } else {
        clearInterval(parseLoadingTimer);
        if (formPane) formPane.style.pointerEvents = '';
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
        if (btnTextEl) btnTextEl.textContent = 'Trích xuất CV';
    }
}

function triggerHighlight(element, isSuccess) {
    if (!element) return;
    element.classList.remove('highlight-success', 'highlight-error');
    void element.offsetWidth;
    element.classList.add(isSuccess ? 'highlight-success' : 'highlight-error');
    setTimeout(() => {
        element.classList.remove('highlight-success', 'highlight-error');
    }, 900);
}

function getInitials(name) {
    if (!name) return 'YD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fillForm(record) {
    const candidate = record.candidate || {};
    const links = candidate.links || {};
    const missing = record.missingFields || [];

    avatarInitials.textContent = getInitials(candidate.fullName);

    const textMappings = [
        'fullName',
        'email',
        'phone',
        'location',
        'currentTitle',
        'totalExperienceMonths',
        'professionalSummary'
    ];

    textMappings.forEach((key) => {
        const element = formFields[key];
        const value = candidate[key] !== null && candidate[key] !== undefined ? candidate[key] : '';
        element.value = value;
        const requiredMissing = missing.includes(key) || (!value && ['fullName', 'email', 'phone'].includes(key));
        triggerHighlight(element, !requiredMissing);
    });

    [
        { key: 'linkedin', element: formFields.linkLinkedin },
        { key: 'github', element: formFields.linkGithub },
        { key: 'portfolio', element: formFields.linkPortfolio }
    ].forEach((item) => {
        const value = links[item.key] || '';
        item.element.value = value;
        triggerHighlight(item.element, Boolean(value));
    });

    fillPills(candidate.skills, formFields.skills, 'Chưa có dữ liệu kỹ năng');
    fillPills(candidate.languages, formFields.languages, 'Chưa có dữ liệu ngoại ngữ');
    fillExperience(record.workExperience || []);
    fillCards(record.projects, formFields.projects, 'Chưa có dữ liệu dự án', renderProject);
    fillCards(record.education, formFields.education, 'Chưa có dữ liệu học vấn', renderEducation);
    fillCards(record.certifications, formFields.certifications, 'Chưa có dữ liệu chứng chỉ', renderCertification);
}

function fillPills(list, container, emptyMsg) {
    container.innerHTML = '';
    if (Array.isArray(list) && list.length > 0) {
        triggerHighlight(container, true);
        list.forEach((item) => {
            const span = document.createElement('span');
            span.className = 'tag-yody';
            span.textContent = item;
            container.appendChild(span);
        });
        return;
    }

    triggerHighlight(container, false);
    container.innerHTML = `<span style="color:var(--color-ink-3); font-weight:700;">${escapeHtml(emptyMsg)}</span>`;
}

function fillExperience(list) {
    const container = formFields.workExperience;
    container.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
        triggerHighlight(container, false);
        container.innerHTML = '<div style="color:var(--color-ink-3); font-weight:700;">Chưa có dữ liệu kinh nghiệm</div>';
        return;
    }

    triggerHighlight(container, true);
    list.forEach((exp) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="card-yody">
                <div class="font-display" style="font-weight:800;">${escapeHtml(exp.title || 'Chưa rõ chức danh')}</div>
                <div style="margin-top:0.25rem; color:var(--color-accent); font-weight:700;">
                    ${escapeHtml(exp.company || 'Công ty?')}
                    <span style="color:var(--color-ink-3); font-weight:600;"> · ${escapeHtml(exp.startDate || '?')} - ${escapeHtml(exp.endDate || 'Hiện tại')}</span>
                </div>
                ${exp.description ? `<p style="margin:0.5rem 0 0; color:var(--color-ink-2); line-height:1.65;">${escapeHtml(exp.description)}</p>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

function fillCards(list, container, emptyMsg, renderHtml) {
    container.innerHTML = '';
    if (Array.isArray(list) && list.length > 0) {
        triggerHighlight(container, true);
        list.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'card-yody';
            div.innerHTML = renderHtml(item);
            container.appendChild(div);
        });
        return;
    }

    triggerHighlight(container, false);
    container.innerHTML = `<div style="color:var(--color-ink-3); font-weight:700;">${escapeHtml(emptyMsg)}</div>`;
}

function renderProject(project) {
    return `
        <div class="font-display" style="font-weight:800;">
            ${escapeHtml(project.name || 'Tên dự án?')}
            <span style="font-family:var(--font-body); color:var(--color-accent); font-size:var(--text-xs);">(${escapeHtml(project.role || 'Vai trò?')})</span>
        </div>
        <div class="font-mono" style="margin-top:0.35rem; color:var(--color-ink-3); font-size:var(--text-xs);">${escapeHtml((project.technologies || []).join(', '))}</div>
        ${project.description ? `<p style="margin:0.5rem 0 0; color:var(--color-ink-2); line-height:1.65;">${escapeHtml(project.description)}</p>` : ''}
    `;
}

function renderEducation(education) {
    return `
        <div class="font-display" style="font-weight:800;">${escapeHtml(education.institution || 'Trường?')}</div>
        <div style="margin-top:0.25rem; color:var(--color-accent); font-weight:700;">${escapeHtml(education.degree ? education.degree + ' - ' : '')}${escapeHtml(education.fieldOfStudy || 'Chuyên ngành?')}</div>
        <div class="font-mono" style="margin-top:0.35rem; color:var(--color-ink-3); font-size:var(--text-xs);">${escapeHtml(education.startDate || '?')} - ${escapeHtml(education.endDate || '?')}</div>
    `;
}

function renderCertification(certification) {
    return `
        <div class="font-display" style="font-weight:800;">${escapeHtml(certification.name || 'Tên chứng chỉ?')}</div>
        <div style="margin-top:0.25rem; color:var(--color-accent); font-weight:700;">${escapeHtml(certification.issuer || 'Đơn vị cấp?')} · ${escapeHtml(certification.issueDate || '?')}</div>
    `;
}

const JDTemplates = {
    pass: `Vị trí: JUNIOR / ASSOCIATE FRONTEND ENGINEER (REACT / TYPESCRIPT / FIREBASE)

1. TỔNG QUAN VỊ TRÍ:
Tham gia thiết kế, phát triển các ứng dụng Web/PWA, hệ thống thời gian thực, tích hợp dịch vụ AI APIs và hạ tầng serverless.

2. TRÁCH NHIỆM & YÊU CẦU CÔNG VIỆC:
- Tốt nghiệp Đại học chuyên ngành Công nghệ Phần mềm / CNTT. Ưu tiên GPA >= 3.0/4.0.
- Lập trình Web/PWA responsive với React và TypeScript.
- Kết nối Firebase, RESTful APIs và AI API.
- Xây dựng dashboard quản lý nhân sự, thanh toán QR, hệ thống giao tiếp real-time.
- Quản lý mã nguồn qua Git/GitHub.
- Ngoại ngữ: Tiếng Anh đọc hiểu tài liệu kỹ thuật tốt.
- Điểm cộng: Có kinh nghiệm triển khai thực tế trên Vercel.`,
    fail: `Vị trí: SENIOR JAVA & DEVOPS ENGINEER (KUBERNETES / AWS / SPRING BOOT)

1. TỔNG QUAN VỊ TRÍ:
Quản trị hạ tầng điện toán đám mây quy mô lớn và phát triển hệ thống Core Banking Microservices.

2. TRÁCH NHIỆM & YÊU CẦU CÔNG VIỆC:
- Tối thiểu 6 năm kinh nghiệm Java Spring Boot, Microservices Architecture.
- Quản trị Cloud AWS, Kubernetes, Docker Cluster, Terraform, Ansible.
- Tối ưu hóa CSDL phân tán PostgreSQL, Oracle và Distributed Caching.
- Bắt buộc có chứng chỉ AWS Certified Solutions Architect Professional hoặc CKA.
- Ngoại ngữ: Tiếng Trung thành thạo HSK 5 trở lên.
- Tối thiểu 3 năm kinh nghiệm ở vị trí Tech Lead / Manager quản lý từ 10 nhân sự.`
};

document.querySelectorAll('.jd-template-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
        const type = event.currentTarget.dataset.type;
        if (JDTemplates[type]) {
            document.getElementById('jdInput').value = JDTemplates[type];
        }
    });
});

const toggleJdExpandBtn = document.getElementById('toggleJdExpand');
const jdModal = document.getElementById('jdModal');
const closeJdModalBtn = document.getElementById('closeJdModal');
const saveJdModalBtn = document.getElementById('saveJdModal');
const modalJdInput = document.getElementById('modalJdInput');

toggleJdExpandBtn.addEventListener('click', () => {
    modalJdInput.value = document.getElementById('jdInput').value;
    jdModal.classList.remove('hidden');
});

closeJdModalBtn.addEventListener('click', () => {
    jdModal.classList.add('hidden');
});

saveJdModalBtn.addEventListener('click', () => {
    document.getElementById('jdInput').value = modalJdInput.value;
    jdModal.classList.add('hidden');
});

document.getElementById('matchBtn').addEventListener('click', async () => {
    const jdText = document.getElementById('jdInput').value.trim();
    if (!jdText) {
        alert('Vui lòng nhập yêu cầu công việc.');
        return;
    }
    if (!currentCandidateRecord) {
        alert('Vui lòng trích xuất CV trước khi chấm điểm.');
        return;
    }

    const button = document.getElementById('matchBtn');
    button.disabled = true;
    const startMatchTime = Date.now();
    button.innerHTML = '<span>Đang phân tích... (0.0s)</span>';

    const matchTimer = setInterval(() => {
        const elapsed = ((Date.now() - startMatchTime) / 1000).toFixed(1);
        button.innerHTML = `<span>Đang phân tích... (${elapsed}s)</span>`;
    }, 100);

    try {
        const response = await fetch(apiUrl('/api/match-jd'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateRecord: currentCandidateRecord,
                jobDescription: jdText
            })
        });

        const matchResult = await readJsonResponse(response, 'Không thể chấm điểm JD.');
        renderMatchResult(matchResult);
    } catch (error) {
        alert('Đã xảy ra lỗi: ' + error.message);
    } finally {
        clearInterval(matchTimer);
        button.disabled = false;
        button.innerHTML = '<span>Chấm điểm độ phù hợp</span>';
    }
});

function renderMatchResult(matchResult) {
    const matchResultEl = document.getElementById('matchResult');
    matchResultEl.classList.remove('hidden');
    setTimeout(() => {
        matchResultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);

    const score = Number(matchResult.score || 0);
    document.getElementById('scoreText').textContent = score + '%';
    document.getElementById('scorePath').setAttribute('stroke-dasharray', `${score}, 100`);

    const badge = document.getElementById('recommendationBadge');
    const reasonBox = document.getElementById('reasonBox');
    const reasonTitle = document.getElementById('reasonTitle');
    const reasonIcon = document.getElementById('reasonIcon');
    const reasonText = document.getElementById('reasonText');

    badge.textContent = matchResult.recommendation || 'Chưa có khuyến nghị';
    reasonText.textContent = matchResult.reason || 'Chưa có thông tin đánh giá.';

    badge.className = 'conf-badge';
    reasonBox.className = 'reason-box';
    reasonTitle.style.color = '';
    reasonIcon.textContent = '';

    if (score >= 80) {
        badge.classList.add('conf-high');
        reasonBox.style.background = 'var(--color-success-soft)';
        reasonBox.style.borderColor = 'var(--color-success)';
        reasonTitle.style.color = 'var(--color-success)';
        reasonIcon.textContent = '✓';
    } else if (score >= 50) {
        badge.classList.add('conf-med');
        reasonBox.style.background = 'var(--color-warning-soft)';
        reasonBox.style.borderColor = 'var(--color-warning)';
        reasonTitle.style.color = 'color-mix(in oklch, var(--color-warning) 70%, var(--color-ink))';
        reasonIcon.textContent = '!';
    } else {
        badge.classList.add('conf-low');
        reasonBox.style.background = 'var(--color-danger-soft)';
        reasonBox.style.borderColor = 'var(--color-danger)';
        reasonTitle.style.color = 'var(--color-danger)';
        reasonIcon.textContent = '×';
    }
}

// --- CANDIDATE LIST & ADVANCED SEARCH LOGIC ---

const candidateListPane = document.getElementById('candidateListPane');
const formPane = document.getElementById('formPane');
const candidateGrid = document.getElementById('candidateGrid');
const tabListBtn = document.getElementById('tabListBtn');
const tabDetailBtn = document.getElementById('tabDetailBtn');
const searchKeyword = document.getElementById('searchKeyword');
const searchRole = document.getElementById('searchRole');
const searchSkills = document.getElementById('searchSkills');
const searchExp = document.getElementById('searchExp');
const searchLocation = document.getElementById('searchLocation');
const searchDegree = document.getElementById('searchDegree');

function showCandidateList() {
    if (candidateListPane) candidateListPane.classList.remove('hidden');
    if (formPane) formPane.classList.add('hidden');
    if (tabListBtn) tabListBtn.classList.add('active');
    if (tabDetailBtn) tabDetailBtn.classList.remove('active');
}

function showCandidateDetail() {
    if (candidateListPane) candidateListPane.classList.add('hidden');
    if (formPane) formPane.classList.remove('hidden');
    if (tabListBtn) tabListBtn.classList.remove('active');
    if (tabDetailBtn) tabDetailBtn.classList.add('active');
}

if (tabListBtn) tabListBtn.addEventListener('click', showCandidateList);
if (tabDetailBtn) tabDetailBtn.addEventListener('click', showCandidateDetail);

function formatExperience(months) {
    if (!months || months <= 0) return '0 tháng';
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y > 0 && m > 0) return `${y} năm ${m} tháng`;
    if (y > 0) return `${y} năm`;
    return `${m} tháng`;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function evaluateBooleanQuery(query, text) {
    if (!query.trim()) return { isMatch: true };
    
    const phrases = [];
    let processedQuery = query.replace(/"([^"]+)"/g, (match, phrase) => {
        phrases.push(phrase.toLowerCase());
        return ` __PHRASE_${phrases.length - 1}__ `;
    });

    processedQuery = processedQuery
        .replace(/\bAND\b/ig, '&&')
        .replace(/\bOR\b/ig, '||');

    const textLower = text.toLowerCase();

    processedQuery = processedQuery.replace(/([^\s\(\)\|&]+)/g, (match) => {
        if (match === '&&' || match === '||') return match;
        if (match.startsWith('__PHRASE_')) {
            const idx = parseInt(match.replace('__PHRASE_', '').replace('__', ''));
            const phrase = phrases[idx];
            return textLower.includes(phrase) ? 'true' : 'false';
        } else {
            const word = match.toLowerCase();
            return textLower.includes(word) ? 'true' : 'false';
        }
    });

    try {
        const isMatch = new Function(`return !!(${processedQuery});`)();
        return { isMatch };
    } catch (e) {
        // Fallback for syntax error
        const words = query.toLowerCase().replace(/[\(\)"]/g, ' ').split(/\s+/).filter(w => w !== 'and' && w !== 'or' && w);
        const matched = words.filter(w => textLower.includes(w));
        return { isMatch: matched.length > 0 };
    }
}

function getHighlightedSnippet(text, keywords) {
    if (!text) return '';
    if (!keywords || keywords.length === 0) {
        return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }
    
    let snippet = text;
    let firstIdx = -1;
    let sortedKw = [...keywords].sort((a,b) => b.length - a.length);

    for (const kw of sortedKw) {
        const idx = text.toLowerCase().indexOf(kw);
        if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
            firstIdx = idx;
        }
    }

    if (firstIdx !== -1) {
        const start = Math.max(0, firstIdx - 60);
        const end = Math.min(text.length, firstIdx + 200);
        snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    } else {
        snippet = text.length > 200 ? text.substring(0, 200) + '...' : text;
    }

    sortedKw.forEach(kw => {
        if(kw.length < 2) return;
        const regex = new RegExp(`(${escapeRegExp(kw)})`, 'gi');
        snippet = snippet.replace(regex, '<mark class="highlight-match">$1</mark>');
    });

    return snippet;
}

function renderCandidateGrid(candidates, highlightKeywords = []) {
    if (!candidateGrid) return;
    candidateGrid.innerHTML = '';
    
    if (candidates.length === 0) {
        candidateGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--color-ink-3); padding: var(--space-xl);">Không tìm thấy ứng viên phù hợp.</div>';
        return;
    }

    candidates.forEach((record, index) => {
        const cand = record.candidate || {};
        const card = document.createElement('div');
        card.className = 'card-yody candidate-card';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform var(--dur-fast), box-shadow var(--dur-fast)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = 'var(--shadow-md)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
            card.style.boxShadow = 'var(--shadow-sm)';
        });

        card.addEventListener('click', () => {
            currentCandidateRecord = record;
            fillForm(record);
            showCandidateDetail();
        });

        const expStr = formatExperience(cand.totalExperienceMonths);
        const skillsHtml = (cand.skills || []).slice(0, 7).map(s => `<span class="tag-yody" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">${escapeHtml(s)}</span>`).join('');
        
        let bestText = cand.professionalSummary || '';
        let snippetHtml = getHighlightedSnippet(bestText, highlightKeywords);
        
        if (highlightKeywords.length > 0 && !highlightKeywords.some(kw => bestText.toLowerCase().includes(kw))) {
            const expWithMatch = (record.workExperience || []).find(w => 
                highlightKeywords.some(kw => (w.description||'').toLowerCase().includes(kw) || (w.title||'').toLowerCase().includes(kw))
            );
            if (expWithMatch) {
                bestText = `${expWithMatch.title} tại ${expWithMatch.company}: ${expWithMatch.description}`;
                snippetHtml = getHighlightedSnippet(bestText, highlightKeywords);
            }
        }

        card.innerHTML = `
            <div style="display: flex; gap: var(--space-md);">
                <div class="avatar-yody" style="width: 50px; height: 50px; font-size: 1.2rem; flex-shrink: 0;">${getInitials(cand.fullName)}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.2rem;">
                        <div class="font-display" style="font-weight: 800; font-size: 1.2rem; color: var(--color-ink);">${escapeHtml(cand.fullName || 'Chưa rõ tên')}</div>
                        <div style="font-size: 0.85rem; color: var(--color-ink-2); display: flex; align-items: center; gap: 0.3rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${escapeHtml(cand.location || 'Chưa rõ')}
                        </div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-ink-2); margin-bottom: 0.5rem;">
                        ${escapeHtml(cand.currentTitle || 'Chưa có chức danh')} • ${expStr}
                    </div>
                    <div class="pill-wrap" style="gap: 0.4rem; margin-bottom: 0.8rem;">
                        ${skillsHtml}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--color-ink-2); line-height: 1.5; background: var(--color-surface-2); padding: 0.6rem; border-radius: 6px; border-left: 3px solid var(--color-rule);">
                        ${snippetHtml || '<span style="font-style: italic;">Chưa có tóm tắt</span>'}
                    </div>
                </div>
            </div>
        `;
        candidateGrid.appendChild(card);
    });
}

function filterCandidates() {
    const rawQuery = (searchKeyword.value || '');
    const role = (searchRole ? searchRole.value : '').toLowerCase();
    const sk = (searchSkills ? searchSkills.value : '').toLowerCase();
    const exp = parseInt(searchExp ? searchExp.value : '0', 10);
    const loc = (searchLocation ? searchLocation.value : '').toLowerCase();
    const deg = (searchDegree ? searchDegree.value : '').toLowerCase();

    const allSearchTokens = rawQuery.toLowerCase().replace(/[\(\)"]/g, ' ').split(/\s+/).filter(w => w !== 'and' && w !== 'or' && w);
    const phrases = [];
    rawQuery.replace(/"([^"]+)"/g, (match, phrase) => {
        phrases.push(phrase.toLowerCase());
    });
    const allKeywordsToHighlight = [...phrases, ...allSearchTokens];

    const filtered = candidatePool.filter(record => {
        const cand = record.candidate || {};
        
        // 1. Boolean Search Match
        let fullText = `${cand.fullName || ''} ${cand.currentTitle || ''} ${cand.professionalSummary || ''} ${(cand.skills||[]).join(' ')} `;
        (record.workExperience || []).forEach(w => { fullText += `${w.title || ''} ${w.description || ''} `; });
        const boolResult = evaluateBooleanQuery(rawQuery, fullText);
        const keywordMatch = boolResult.isMatch;

        // 2. Role match
        const roleMatch = role === '' || (cand.currentTitle || '').toLowerCase().includes(role);

        // 3. Skills match
        const candSkills = (cand.skills || []).map(s => s.toLowerCase());
        const skillsMatch = sk === '' || candSkills.some(cs => cs.includes(sk));

        // 4. Experience match
        const candExp = cand.totalExperienceMonths || 0;
        const expMatch = candExp >= exp;

        // 5. Location match
        const candLoc = (cand.location || '').toLowerCase();
        let locMatch = true;
        if (loc !== '') {
            if (loc === 'khác') {
                locMatch = !['hà nội', 'hồ chí minh', 'đà nẵng'].some(city => candLoc.includes(city));
            } else {
                locMatch = candLoc.includes(loc);
            }
        }

        // 6. Degree match
        let degreeMatch = true;
        if (deg !== '') {
            const edus = record.education || [];
            const candDegrees = edus.map(e => (e.degree || '').toLowerCase());
            if (deg === 'cử nhân') {
                degreeMatch = candDegrees.some(d => d.includes('cử nhân') || d.includes('đại học'));
            } else if (deg === 'cao đẳng') {
                degreeMatch = candDegrees.some(d => d.includes('cao đẳng'));
            }
        }

        return keywordMatch && roleMatch && skillsMatch && expMatch && locMatch && degreeMatch;
    });

    renderCandidateGrid(filtered, allKeywordsToHighlight);
}

if (searchKeyword) searchKeyword.addEventListener('input', filterCandidates);
if (searchRole) searchRole.addEventListener('change', filterCandidates);
if (searchSkills) searchSkills.addEventListener('change', filterCandidates);
if (searchExp) searchExp.addEventListener('change', filterCandidates);
if (searchLocation) searchLocation.addEventListener('change', filterCandidates);
if (searchDegree) searchDegree.addEventListener('change', filterCandidates);

// Initialize grid on load
document.addEventListener('DOMContentLoaded', () => {
    renderCandidateGrid(candidatePool);
});
