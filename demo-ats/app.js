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

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function apiUrl(path) {
    const isBackendOrigin = window.location.hostname === 'localhost' && window.location.port === '3000';
    if (window.location.protocol === 'file:' || !isBackendOrigin) {
        return `http://localhost:3000${path}`;
    }
    return path;
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

    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('cvFile', files[0]);

        const response = await fetch(apiUrl('/api/parse-cv'), {
            method: 'POST',
            body: formData
        });

        const candidateRecord = await readJsonResponse(response, 'Không thể trích xuất CV.');
        currentCandidateRecord = candidateRecord;
        fillForm(candidateRecord);
    } catch (error) {
        alert('Đã xảy ra lỗi: ' + error.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    const formPane = document.getElementById('formPane');
    extractBtn.disabled = isLoading;
    document.getElementById('btnText').textContent = isLoading ? 'Đang xử lý...' : 'Trích xuất CV';

    if (isLoading) {
        formPane.scrollTop = 0;
        formPane.style.pointerEvents = 'none';
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    } else {
        formPane.style.pointerEvents = '';
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
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
    button.innerHTML = '<span>Đang phân tích...</span>';

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
