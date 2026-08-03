// Khởi tạo các phần tử giao diện chính
const extractBtn = document.getElementById('extractBtn');
const cvFileInput = document.getElementById('cvFile');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingTime = document.getElementById('loadingTime');
const dropzone = document.getElementById('dropzone');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');

// Các phần tử hiển thị hiệu năng
const timingBanner = document.getElementById('timingBanner');
const timeTotal = document.getElementById('timeTotal');
const timePdf = document.getElementById('timePdf');
const timeGemini = document.getElementById('timeGemini');
const timeNetwork = document.getElementById('timeNetwork');

// Các phần tử của JD Matcher
const matchBtn = document.getElementById('matchBtn');
const jdInput = document.getElementById('jdInput');
const matchResult = document.getElementById('matchResult');
const scorePath = document.getElementById('scorePath');
const scoreText = document.getElementById('scoreText');
const recommendationBadge = document.getElementById('recommendationBadge');
const reasonBox = document.getElementById('reasonBox');
const reasonTitle = document.getElementById('reasonTitle');
const reasonIcon = document.getElementById('reasonIcon');
const reasonText = document.getElementById('reasonText');
const toggleJdExpand = document.getElementById('toggleJdExpand');
const jdModal = document.getElementById('jdModal');
const closeJdModal = document.getElementById('closeJdModal');
const saveJdModal = document.getElementById('saveJdModal');
const modalJdInput = document.getElementById('modalJdInput');

// Các phần tử form hồ sơ ứng viên
const formName = document.getElementById('form-name');
const formTitle = document.getElementById('form-title');
const formAvatarInitials = document.getElementById('formAvatarInitials');
const formEmail = document.getElementById('form-email');
const formPhone = document.getElementById('form-phone');
const formLocation = document.getElementById('form-location');
const formYob = document.getElementById('form-yob');
const formGender = document.getElementById('form-gender');
const formSummary = document.getElementById('form-summary');
const formSkillsTech = document.getElementById('form-skills-technical');
const formSkillsSoft = document.getElementById('form-skills-soft');
const formSkillsLang = document.getElementById('form-skills-languages');
const formSocialLinks = document.getElementById('form-social-links');
const formExperience = document.getElementById('form-experience');
const formProjects = document.getElementById('form-projects');
const formEducation = document.getElementById('form-education');
const formCertificates = document.getElementById('form-certificates');
const formAwards = document.getElementById('form-awards');
const formActivities = document.getElementById('form-activities');
const formReferences = document.getElementById('form-references');
const btnSaveCandidate = document.getElementById('btnSaveCandidate');
const btnResetForm = document.getElementById('btnResetForm');

// Dữ liệu ứng viên đang mở trong form
let currentCandidateRecord = null;

// Khử ký tự đặc biệt tránh XSS
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// Hiển thị thông báo toast nổi
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${escapeHtml(message)}</span>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Cập nhật chữ viết tắt avatar đại diện
function updateAvatarInitials(name) {
    if (!formAvatarInitials) return;
    if (!name || !name.trim()) {
        formAvatarInitials.textContent = 'YD';
        return;
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        formAvatarInitials.textContent = parts[0].substring(0, 2).toUpperCase();
    } else {
        const first = parts[0][0] || '';
        const last = parts[parts.length - 1][0] || '';
        formAvatarInitials.textContent = (first + last).toUpperCase();
    }
}

// Điền toàn bộ thông tin ứng viên vào form
function fillForm(record) {
    currentCandidateRecord = record;
    if (!record) return;

    const c = record.candidate || {};
    if (formName) formName.value = c.fullName || '';
    if (formTitle) formTitle.value = c.currentTitle || '';
    updateAvatarInitials(c.fullName);

    if (formEmail) formEmail.value = c.email || '';
    if (formPhone) formPhone.value = c.phone || '';
    if (formLocation) formLocation.value = c.location || '';
    if (formYob) formYob.value = c.yearOfBirth || '';
    if (formGender) formGender.value = c.gender || '';
    if (formSummary) formSummary.value = c.professionalSummary || '';

    // Kỹ năng & Ngoại ngữ
    if (formSkillsTech) {
        const techSkills = Array.isArray(c.technicalSkills) ? c.technicalSkills : (Array.isArray(c.skills) ? c.skills : []);
        formSkillsTech.value = techSkills.join(', ');
    }
    if (formSkillsSoft) {
        const softSkills = Array.isArray(c.softSkills) ? c.softSkills : [];
        formSkillsSoft.value = softSkills.join(', ');
    }
    if (formSkillsLang) {
        const langs = Array.isArray(c.languages) ? c.languages : [];
        formSkillsLang.value = langs.join(', ');
    }

    // Liên kết mạng xã hội
    renderSocialLinks(c.socialLinks || []);

    // Kinh nghiệm làm việc
    renderExperienceTimeline(record.workExperience || []);

    // Dự án tiêu biểu
    renderProjects(record.projects || []);

    // Học vấn & Bằng cấp
    renderEducation(record.education || []);

    // Chứng chỉ & Giấy phép
    renderCertificates(record.certifications || []);

    // Giải thưởng
    renderAwards(record.awards || []);

    // Hoạt động ngoại khóa
    renderActivities(record.volunteerActivities || []);

    // Người tham chiếu
    renderReferences(record.references || []);
}

// Vẽ danh sách liên kết mạng xã hội
function renderSocialLinks(links) {
    if (!formSocialLinks) return;
    formSocialLinks.innerHTML = '';

    const list = Array.isArray(links) && links.length > 0 ? links : [{ platform: '', url: '' }];
    list.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'social-link-row';
        row.style.cssText = 'display: flex; gap: var(--space-xs); margin-bottom: var(--space-xs); align-items: center;';
        row.innerHTML = `
            <input type="text" class="form-input font-mono social-platform" style="width: 140px;" placeholder="Nền tảng (VD: LinkedIn)" value="${escapeHtml(item.platform || '')}">
            <input type="url" class="form-input font-mono social-url" style="flex: 1;" placeholder="Đường dẫn URL" value="${escapeHtml(item.url || '')}">
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-social" title="Xóa">✕</button>
        `;
        row.querySelector('.btn-remove-social').addEventListener('click', () => row.remove());
        formSocialLinks.appendChild(row);
    });
}

// Thêm hàng liên kết mới
function addSocialLinkRow(platform = '', url = '') {
    if (!formSocialLinks) return;
    const row = document.createElement('div');
    row.className = 'social-link-row';
    row.style.cssText = 'display: flex; gap: var(--space-xs); margin-bottom: var(--space-xs); align-items: center;';
    row.innerHTML = `
        <input type="text" class="form-input font-mono social-platform" style="width: 140px;" placeholder="Nền tảng (VD: GitHub)" value="${escapeHtml(platform)}">
        <input type="url" class="form-input font-mono social-url" style="flex: 1;" placeholder="Đường dẫn URL" value="${escapeHtml(url)}">
        <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-social" title="Xóa">✕</button>
    `;
    row.querySelector('.btn-remove-social').addEventListener('click', () => row.remove());
    formSocialLinks.appendChild(row);
}

// Vẽ dòng thời gian kinh nghiệm làm việc
function renderExperienceTimeline(experiences) {
    if (!formExperience) return;
    formExperience.innerHTML = '';

    const list = Array.isArray(experiences) ? experiences : [];
    list.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="font-size: 13px; color: var(--brand);">Kinh nghiệm #${index + 1}</strong>
                    <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-exp" title="Xóa kinh nghiệm này">✕</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-xs); margin-bottom: 8px;">
                    <div class="form-group">
                        <label class="form-label required">Vị trí / Chức danh</label>
                        <input type="text" class="form-input exp-title" value="${escapeHtml(exp.title || '')}" placeholder="Chức danh công việc">
                    </div>
                    <div class="form-group">
                        <label class="form-label required">Công ty / Tổ chức</label>
                        <input type="text" class="form-input exp-company" value="${escapeHtml(exp.company || '')}" placeholder="Tên công ty">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Thời gian bắt đầu</label>
                        <input type="text" class="form-input exp-start" value="${escapeHtml(exp.startDate || '')}" placeholder="MM/YYYY">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Thời gian kết thúc</label>
                        <input type="text" class="form-input exp-end" value="${escapeHtml(exp.endDate || '')}" placeholder="MM/YYYY hoặc Hiện tại">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Mô tả trách nhiệm & thành tích</label>
                    <textarea class="form-textarea exp-desc" rows="3" placeholder="Chi tiết công việc và kết quả đạt được...">${escapeHtml(exp.description || '')}</textarea>
                </div>
            </div>
        `;
        item.querySelector('.btn-remove-exp').addEventListener('click', () => item.remove());
        formExperience.appendChild(item);
    });
}

// Thêm thẻ kinh nghiệm làm việc mới
function addExperienceItem() {
    if (!formExperience) return;
    const count = formExperience.querySelectorAll('.timeline-item').length + 1;
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
            <div class="timeline-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 13px; color: var(--brand);">Kinh nghiệm #${count}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-exp" title="Xóa">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-xs); margin-bottom: 8px;">
                <div class="form-group">
                    <label class="form-label required">Vị trí / Chức danh</label>
                    <input type="text" class="form-input exp-title" placeholder="Chức danh công việc">
                </div>
                <div class="form-group">
                    <label class="form-label required">Công ty / Tổ chức</label>
                    <input type="text" class="form-input exp-company" placeholder="Tên công ty">
                </div>
                <div class="form-group">
                    <label class="form-label">Thời gian bắt đầu</label>
                    <input type="text" class="form-input exp-start" placeholder="MM/YYYY">
                </div>
                <div class="form-group">
                    <label class="form-label">Thời gian kết thúc</label>
                    <input type="text" class="form-input exp-end" placeholder="Hiện tại">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Mô tả trách nhiệm & thành tích</label>
                <textarea class="form-textarea exp-desc" rows="3" placeholder="Chi tiết công việc..."></textarea>
            </div>
        </div>
    `;
    item.querySelector('.btn-remove-exp').addEventListener('click', () => item.remove());
    formExperience.appendChild(item);
}

// Vẽ danh sách dự án tiêu biểu
function renderProjects(projects) {
    if (!formProjects) return;
    formProjects.innerHTML = '';

    const list = Array.isArray(projects) ? projects : [];
    list.forEach((proj, idx) => {
        const item = document.createElement('div');
        item.className = 'project-entry-card';
        item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
        const techs = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 12.5px; color: var(--brand);">Dự án #${idx + 1}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-proj">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-xs); margin-bottom: 6px;">
                <div class="form-group">
                    <label class="form-label required">Tên dự án</label>
                    <input type="text" class="form-input proj-name" value="${escapeHtml(proj.name || '')}" placeholder="Tên dự án">
                </div>
                <div class="form-group">
                    <label class="form-label">Vai trò</label>
                    <input type="text" class="form-input proj-role" value="${escapeHtml(proj.role || '')}" placeholder="Vai trò trong dự án">
                </div>
                <div class="form-group">
                    <label class="form-label">Công nghệ / Kỹ năng</label>
                    <input type="text" class="form-input proj-tech" value="${escapeHtml(techs)}" placeholder="Công nghệ sử dụng">
                </div>
                <div class="form-group">
                    <label class="form-label">Liên kết URL</label>
                    <input type="url" class="form-input proj-url" value="${escapeHtml(proj.url || '')}" placeholder="https://...">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Mô tả dự án</label>
                <textarea class="form-textarea proj-desc" rows="2" placeholder="Chi tiết dự án...">${escapeHtml(proj.description || '')}</textarea>
            </div>
        `;
        item.querySelector('.btn-remove-proj').addEventListener('click', () => item.remove());
        formProjects.appendChild(item);
    });
}

// Thêm thẻ dự án mới
function addProjectItem() {
    if (!formProjects) return;
    const count = formProjects.querySelectorAll('.project-entry-card').length + 1;
    const item = document.createElement('div');
    item.className = 'project-entry-card';
    item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 12.5px; color: var(--brand);">Dự án #${count}</strong>
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-proj">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-xs); margin-bottom: 6px;">
            <div class="form-group">
                <label class="form-label required">Tên dự án</label>
                <input type="text" class="form-input proj-name" placeholder="Tên dự án">
            </div>
            <div class="form-group">
                <label class="form-label">Vai trò</label>
                <input type="text" class="form-input proj-role" placeholder="Vai trò">
            </div>
            <div class="form-group">
                <label class="form-label">Công nghệ / Kỹ năng</label>
                <input type="text" class="form-input proj-tech" placeholder="Công nghệ sử dụng">
            </div>
            <div class="form-group">
                <label class="form-label">Liên kết URL</label>
                <input type="url" class="form-input proj-url" placeholder="https://...">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Mô tả dự án</label>
            <textarea class="form-textarea proj-desc" rows="2" placeholder="Chi tiết dự án..."></textarea>
        </div>
    `;
    item.querySelector('.btn-remove-proj').addEventListener('click', () => item.remove());
    formProjects.appendChild(item);
}

// Vẽ danh sách học vấn & bằng cấp
function renderEducation(educations) {
    if (!formEducation) return;
    formEducation.innerHTML = '';

    const list = Array.isArray(educations) ? educations : [];
    list.forEach((edu, idx) => {
        const item = document.createElement('div');
        item.className = 'edu-entry-card';
        item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 12.5px; color: var(--brand);">Học vấn #${idx + 1}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-edu">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs);">
                <div class="form-group">
                    <label class="form-label required">Trường / Cơ sở đào tạo</label>
                    <input type="text" class="form-input edu-inst" value="${escapeHtml(edu.institution || '')}" placeholder="Tên trường học">
                </div>
                <div class="form-group">
                    <label class="form-label">Bằng cấp / Trình độ</label>
                    <input type="text" class="form-input edu-degree" value="${escapeHtml(edu.degree || '')}" placeholder="VD: Cử nhân, Kỹ sư...">
                </div>
                <div class="form-group">
                    <label class="form-label">Chuyên ngành</label>
                    <input type="text" class="form-input edu-field" value="${escapeHtml(edu.fieldOfStudy || '')}" placeholder="VD: Quản trị Kinh doanh">
                </div>
                <div class="form-group">
                    <label class="form-label">Thời gian</label>
                    <input type="text" class="form-input edu-time" value="${escapeHtml((edu.startDate || '') + (edu.endDate ? ' - ' + edu.endDate : ''))}" placeholder="2018 - 2022">
                </div>
            </div>
        `;
        item.querySelector('.btn-remove-edu').addEventListener('click', () => item.remove());
        formEducation.appendChild(item);
    });
}

// Thêm thẻ học vấn mới
function addEducationItem() {
    if (!formEducation) return;
    const count = formEducation.querySelectorAll('.edu-entry-card').length + 1;
    const item = document.createElement('div');
    item.className = 'edu-entry-card';
    item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 12.5px; color: var(--brand);">Học vấn #${count}</strong>
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-edu">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs);">
            <div class="form-group">
                <label class="form-label required">Trường / Cơ sở đào tạo</label>
                <input type="text" class="form-input edu-inst" placeholder="Tên trường học">
            </div>
            <div class="form-group">
                <label class="form-label">Bằng cấp</label>
                <input type="text" class="form-input edu-degree" placeholder="Cử nhân / Kỹ sư">
            </div>
            <div class="form-group">
                <label class="form-label">Chuyên ngành</label>
                <input type="text" class="form-input edu-field" placeholder="Chuyên ngành">
            </div>
            <div class="form-group">
                <label class="form-label">Thời gian</label>
                <input type="text" class="form-input edu-time" placeholder="YYYY - YYYY">
            </div>
        </div>
    `;
    item.querySelector('.btn-remove-edu').addEventListener('click', () => item.remove());
    formEducation.appendChild(item);
}

// Vẽ danh sách chứng chỉ
function renderCertificates(certs) {
    if (!formCertificates) return;
    formCertificates.innerHTML = '';

    const list = Array.isArray(certs) ? certs : [];
    list.forEach((cert, idx) => {
        const item = document.createElement('div');
        item.className = 'cert-entry-card';
        item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 12.5px; color: var(--brand);">Chứng chỉ #${idx + 1}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-cert">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs);">
                <div class="form-group">
                    <label class="form-label required">Tên chứng chỉ</label>
                    <input type="text" class="form-input cert-name" value="${escapeHtml(cert.name || '')}" placeholder="Tên chứng chỉ">
                </div>
                <div class="form-group">
                    <label class="form-label">Tổ chức cấp</label>
                    <input type="text" class="form-input cert-issuer" value="${escapeHtml(cert.issuer || '')}" placeholder="Đơn vị cấp">
                </div>
                <div class="form-group">
                    <label class="form-label">Ngày cấp</label>
                    <input type="text" class="form-input cert-date" value="${escapeHtml(cert.issueDate || '')}" placeholder="MM/YYYY">
                </div>
                <div class="form-group">
                    <label class="form-label">Đường dẫn xác thực</label>
                    <input type="url" class="form-input cert-url" value="${escapeHtml(cert.credentialUrl || '')}" placeholder="https://...">
                </div>
            </div>
        `;
        item.querySelector('.btn-remove-cert').addEventListener('click', () => item.remove());
        formCertificates.appendChild(item);
    });
}

// Thêm thẻ chứng chỉ mới
function addCertificateItem() {
    if (!formCertificates) return;
    const count = formCertificates.querySelectorAll('.cert-entry-card').length + 1;
    const item = document.createElement('div');
    item.className = 'cert-entry-card';
    item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 12.5px; color: var(--brand);">Chứng chỉ #${count}</strong>
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-cert">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs);">
            <div class="form-group">
                <label class="form-label required">Tên chứng chỉ</label>
                <input type="text" class="form-input cert-name" placeholder="Tên chứng chỉ">
            </div>
            <div class="form-group">
                <label class="form-label">Tổ chức cấp</label>
                <input type="text" class="form-input cert-issuer" placeholder="Đơn vị cấp">
            </div>
            <div class="form-group">
                <label class="form-label">Ngày cấp</label>
                <input type="text" class="form-input cert-date" placeholder="MM/YYYY">
            </div>
            <div class="form-group">
                <label class="form-label">Đường dẫn xác thực</label>
                <input type="url" class="form-input cert-url" placeholder="https://...">
            </div>
        </div>
    `;
    item.querySelector('.btn-remove-cert').addEventListener('click', () => item.remove());
    formCertificates.appendChild(item);
}

// Vẽ danh sách giải thưởng
function renderAwards(awards) {
    if (!formAwards) return;
    formAwards.innerHTML = '';

    const list = Array.isArray(awards) ? awards : [];
    list.forEach((awd, idx) => {
        const item = document.createElement('div');
        item.className = 'award-entry-card';
        item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 12.5px; color: var(--brand);">Giải thưởng #${idx + 1}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-award">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs); margin-bottom: 6px;">
                <div class="form-group">
                    <label class="form-label required">Tên giải thưởng</label>
                    <input type="text" class="form-input awd-title" value="${escapeHtml(awd.title || '')}" placeholder="Tên giải thưởng">
                </div>
                <div class="form-group">
                    <label class="form-label">Đơn vị trao giải</label>
                    <input type="text" class="form-input awd-issuer" value="${escapeHtml(awd.issuer || '')}" placeholder="Tổ chức / Doanh nghiệp">
                </div>
                <div class="form-group">
                    <label class="form-label">Thời gian</label>
                    <input type="text" class="form-input awd-date" value="${escapeHtml(awd.issueDate || '')}" placeholder="YYYY">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Mô tả giải thưởng</label>
                <input type="text" class="form-input awd-desc" value="${escapeHtml(awd.description || '')}" placeholder="Chi tiết giải thưởng...">
            </div>
        `;
        item.querySelector('.btn-remove-award').addEventListener('click', () => item.remove());
        formAwards.appendChild(item);
    });
}

// Thêm thẻ giải thưởng mới
function addAwardItem() {
    if (!formAwards) return;
    const count = formAwards.querySelectorAll('.award-entry-card').length + 1;
    const item = document.createElement('div');
    item.className = 'award-entry-card';
    item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 12.5px; color: var(--brand);">Giải thưởng #${count}</strong>
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-award">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs); margin-bottom: 6px;">
            <div class="form-group">
                <label class="form-label required">Tên giải thưởng</label>
                <input type="text" class="form-input awd-title" placeholder="Tên giải thưởng">
            </div>
            <div class="form-group">
                <label class="form-label">Đơn vị trao giải</label>
                <input type="text" class="form-input awd-issuer" placeholder="Tổ chức trao giải">
            </div>
            <div class="form-group">
                <label class="form-label">Thời gian</label>
                <input type="text" class="form-input awd-date" placeholder="YYYY">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Mô tả giải thưởng</label>
            <input type="text" class="form-input awd-desc" placeholder="Chi tiết...">
        </div>
    `;
    item.querySelector('.btn-remove-award').addEventListener('click', () => item.remove());
    formAwards.appendChild(item);
}

// Vẽ danh sách hoạt động ngoại khóa
function renderActivities(activities) {
    if (!formActivities) return;
    formActivities.innerHTML = '';

    const list = Array.isArray(activities) ? activities : [];
    list.forEach((act, idx) => {
        const item = document.createElement('div');
        item.className = 'act-entry-card';
        item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 12.5px; color: var(--brand);">Hoạt động #${idx + 1}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-act">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs); margin-bottom: 6px;">
                <div class="form-group">
                    <label class="form-label required">Tổ chức / CLB</label>
                    <input type="text" class="form-input act-org" value="${escapeHtml(act.organization || '')}" placeholder="Tên tổ chức">
                </div>
                <div class="form-group">
                    <label class="form-label">Vai trò</label>
                    <input type="text" class="form-input act-role" value="${escapeHtml(act.role || '')}" placeholder="Vai trò">
                </div>
                <div class="form-group">
                    <label class="form-label">Thời gian</label>
                    <input type="text" class="form-input act-time" value="${escapeHtml((act.startDate || '') + (act.endDate ? ' - ' + act.endDate : ''))}" placeholder="MM/YYYY - MM/YYYY">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Mô tả hoạt động</label>
                <textarea class="form-textarea act-desc" rows="2" placeholder="Chi tiết hoạt động...">${escapeHtml(act.description || '')}</textarea>
            </div>
        `;
        item.querySelector('.btn-remove-act').addEventListener('click', () => item.remove());
        formActivities.appendChild(item);
    });
}

// Thêm thẻ hoạt động mới
function addActivityItem() {
    if (!formActivities) return;
    const count = formActivities.querySelectorAll('.act-entry-card').length + 1;
    const item = document.createElement('div');
    item.className = 'act-entry-card';
    item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 12.5px; color: var(--brand);">Hoạt động #${count}</strong>
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-act">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs); margin-bottom: 6px;">
            <div class="form-group">
                <label class="form-label required">Tổ chức / CLB</label>
                <input type="text" class="form-input act-org" placeholder="Tên tổ chức">
            </div>
            <div class="form-group">
                <label class="form-label">Vai trò</label>
                <input type="text" class="form-input act-role" placeholder="Vai trò">
            </div>
            <div class="form-group">
                <label class="form-label">Thời gian</label>
                <input type="text" class="form-input act-time" placeholder="MM/YYYY - MM/YYYY">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Mô tả hoạt động</label>
            <textarea class="form-textarea act-desc" rows="2" placeholder="Chi tiết hoạt động..."></textarea>
        </div>
    `;
    item.querySelector('.btn-remove-act').addEventListener('click', () => item.remove());
    formActivities.appendChild(item);
}

// Vẽ danh sách người tham chiếu
function renderReferences(refs) {
    if (!formReferences) return;
    formReferences.innerHTML = '';

    const list = Array.isArray(refs) ? refs : [];
    list.forEach((ref, idx) => {
        const item = document.createElement('div');
        item.className = 'ref-entry-card';
        item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 12.5px; color: var(--brand);">Người tham chiếu #${idx + 1}</strong>
                <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-ref">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs);">
                <div class="form-group">
                    <label class="form-label required">Họ và tên</label>
                    <input type="text" class="form-input ref-name" value="${escapeHtml(ref.name || '')}" placeholder="Họ và tên">
                </div>
                <div class="form-group">
                    <label class="form-label">Chức vụ & Công ty</label>
                    <input type="text" class="form-input ref-title" value="${escapeHtml((ref.title || '') + (ref.company ? ' - ' + ref.company : ''))}" placeholder="Chức vụ, Công ty">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input ref-email" value="${escapeHtml(ref.email || '')}" placeholder="email@...">
                </div>
                <div class="form-group">
                    <label class="form-label">Số điện thoại</label>
                    <input type="tel" class="form-input ref-phone" value="${escapeHtml(ref.phone || '')}" placeholder="+84 ...">
                </div>
            </div>
        `;
        item.querySelector('.btn-remove-ref').addEventListener('click', () => item.remove());
        formReferences.appendChild(item);
    });
}

// Thêm thẻ người tham chiếu mới
function addReferenceItem() {
    if (!formReferences) return;
    const count = formReferences.querySelectorAll('.ref-entry-card').length + 1;
    const item = document.createElement('div');
    item.className = 'ref-entry-card';
    item.style.cssText = 'border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--bg-2);';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 12.5px; color: var(--brand);">Người tham chiếu #${count}</strong>
            <button type="button" class="btn-ghost btn-sm btn-icon-only text-danger btn-remove-ref">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-xs);">
            <div class="form-group">
                <label class="form-label required">Họ và tên</label>
                <input type="text" class="form-input ref-name" placeholder="Họ và tên">
            </div>
            <div class="form-group">
                <label class="form-label">Chức vụ & Công ty</label>
                <input type="text" class="form-input ref-title" placeholder="Chức vụ, Công ty">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input ref-email" placeholder="email@...">
            </div>
            <div class="form-group">
                <label class="form-label">Số điện thoại</label>
                <input type="tel" class="form-input ref-phone" placeholder="+84 ...">
            </div>
        </div>
    `;
    item.querySelector('.btn-remove-ref').addEventListener('click', () => item.remove());
    formReferences.appendChild(item);
}

// Thu thập toàn bộ dữ liệu từ form hiện tại
function collectFormData() {
    const record = currentCandidateRecord ? JSON.parse(JSON.stringify(currentCandidateRecord)) : {};
    if (!record.candidate) record.candidate = {};

    record.candidate.fullName = formName ? formName.value.trim() : '';
    record.candidate.currentTitle = formTitle ? formTitle.value.trim() : '';
    record.candidate.email = formEmail ? formEmail.value.trim() : '';
    record.candidate.phone = formPhone ? formPhone.value.trim() : '';
    record.candidate.location = formLocation ? formLocation.value.trim() : '';
    record.candidate.yearOfBirth = formYob && formYob.value ? parseInt(formYob.value, 10) : null;
    record.candidate.gender = formGender ? formGender.value : '';
    record.candidate.professionalSummary = formSummary ? formSummary.value.trim() : '';

    // Thu thập kỹ năng
    const parseList = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (formSkillsTech) record.candidate.technicalSkills = parseList(formSkillsTech.value);
    if (formSkillsSoft) record.candidate.softSkills = parseList(formSkillsSoft.value);
    if (formSkillsLang) record.candidate.languages = parseList(formSkillsLang.value);
    record.candidate.skills = record.candidate.technicalSkills;

    // Thu thập liên kết mạng xã hội
    if (formSocialLinks) {
        const rows = formSocialLinks.querySelectorAll('.social-link-row');
        record.candidate.socialLinks = Array.from(rows).map(row => ({
            platform: row.querySelector('.social-platform')?.value.trim() || '',
            url: row.querySelector('.social-url')?.value.trim() || ''
        })).filter(item => item.platform || item.url);
    }

    // Thu thập kinh nghiệm
    if (formExperience) {
        const items = formExperience.querySelectorAll('.timeline-item');
        record.workExperience = Array.from(items).map(item => ({
            title: item.querySelector('.exp-title')?.value.trim() || '',
            company: item.querySelector('.exp-company')?.value.trim() || '',
            startDate: item.querySelector('.exp-start')?.value.trim() || '',
            endDate: item.querySelector('.exp-end')?.value.trim() || '',
            description: item.querySelector('.exp-desc')?.value.trim() || ''
        })).filter(exp => exp.title || exp.company);
    }

    // Thu thập dự án
    if (formProjects) {
        const items = formProjects.querySelectorAll('.project-entry-card');
        record.projects = Array.from(items).map(item => ({
            name: item.querySelector('.proj-name')?.value.trim() || '',
            role: item.querySelector('.proj-role')?.value.trim() || '',
            technologies: parseList(item.querySelector('.proj-tech')?.value || ''),
            url: item.querySelector('.proj-url')?.value.trim() || '',
            description: item.querySelector('.proj-desc')?.value.trim() || ''
        })).filter(p => p.name);
    }

    // Thu thập học vấn
    if (formEducation) {
        const items = formEducation.querySelectorAll('.edu-entry-card');
        record.education = Array.from(items).map(item => ({
            institution: item.querySelector('.edu-inst')?.value.trim() || '',
            degree: item.querySelector('.edu-degree')?.value.trim() || '',
            fieldOfStudy: item.querySelector('.edu-field')?.value.trim() || '',
            startDate: item.querySelector('.edu-time')?.value.trim() || '',
            endDate: ''
        })).filter(e => e.institution);
    }

    // Thu thập chứng chỉ
    if (formCertificates) {
        const items = formCertificates.querySelectorAll('.cert-entry-card');
        record.certifications = Array.from(items).map(item => ({
            name: item.querySelector('.cert-name')?.value.trim() || '',
            issuer: item.querySelector('.cert-issuer')?.value.trim() || '',
            issueDate: item.querySelector('.cert-date')?.value.trim() || '',
            credentialUrl: item.querySelector('.cert-url')?.value.trim() || ''
        })).filter(c => c.name);
    }

    // Thu thập giải thưởng
    if (formAwards) {
        const items = formAwards.querySelectorAll('.award-entry-card');
        record.awards = Array.from(items).map(item => ({
            title: item.querySelector('.awd-title')?.value.trim() || '',
            issuer: item.querySelector('.awd-issuer')?.value.trim() || '',
            issueDate: item.querySelector('.awd-date')?.value.trim() || '',
            description: item.querySelector('.awd-desc')?.value.trim() || ''
        })).filter(a => a.title);
    }

    // Thu thập hoạt động ngoại khóa
    if (formActivities) {
        const items = formActivities.querySelectorAll('.act-entry-card');
        record.volunteerActivities = Array.from(items).map(item => ({
            organization: item.querySelector('.act-org')?.value.trim() || '',
            role: item.querySelector('.act-role')?.value.trim() || '',
            startDate: item.querySelector('.act-time')?.value.trim() || '',
            endDate: '',
            description: item.querySelector('.act-desc')?.value.trim() || ''
        })).filter(act => act.organization);
    }

    // Thu thập người tham chiếu
    if (formReferences) {
        const items = formReferences.querySelectorAll('.ref-entry-card');
        record.references = Array.from(items).map(item => ({
            name: item.querySelector('.ref-name')?.value.trim() || '',
            title: item.querySelector('.ref-title')?.value.trim() || '',
            company: '',
            email: item.querySelector('.ref-email')?.value.trim() || '',
            phone: item.querySelector('.ref-phone')?.value.trim() || '',
            relationship: ''
        })).filter(r => r.name);
    }

    return record;
}

// Xử lý kéo thả file PDF CV
if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files[0]) {
            cvFileInput.files = files;
            fileNameDisplay.textContent = files[0].name;
            showToast(`Đã chọn file: ${files[0].name}`, 'info');
        }
    });
}

// Cập nhật tên file khi chọn từ hộp thoại
if (cvFileInput) {
    cvFileInput.addEventListener('change', () => {
        if (cvFileInput.files && cvFileInput.files[0]) {
            fileNameDisplay.textContent = cvFileInput.files[0].name;
            showToast(`Đã chọn file: ${cvFileInput.files[0].name}`, 'info');
        }
    });
}

// Bắt đầu bóc tách CV qua AI
if (extractBtn) {
    extractBtn.addEventListener('click', async () => {
        if (!cvFileInput || !cvFileInput.files[0]) {
            showToast('Vui lòng chọn hoặc kéo thả 1 file PDF CV trước!', 'warning');
            return;
        }

        const file = cvFileInput.files[0];
        const formData = new FormData();
        formData.append('cvFile', file);

        // Hiển thị trạng thái đang xử lý
        loadingOverlay.classList.remove('hidden');
        extractBtn.disabled = true;
        btnText.textContent = 'Đang trích xuất...';

        const startTime = Date.now();
        const timerInterval = setInterval(() => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (loadingTime) loadingTime.textContent = `Đang xử lý: ${elapsed}s`;
        }, 100);

        try {
            const response = await fetch('/api/parse-cv', {
                method: 'POST',
                body: formData
            });

            clearInterval(timerInterval);
            const totalElapsedMs = Date.now() - startTime;

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${response.status}`);
            }

            const candidateRecord = await response.json();
            currentCandidateRecord = candidateRecord;

            // Cập nhật thông số hiệu năng
            if (timingBanner) {
                timingBanner.classList.remove('hidden');
                const timings = candidateRecord._timings || {};
                if (timeTotal) timeTotal.textContent = `${(totalElapsedMs / 1000).toFixed(2)}s`;
                if (timePdf) timePdf.textContent = timings.pdfParseMs ? `${timings.pdfParseMs}ms` : '-';
                if (timeGemini) timeGemini.textContent = timings.aiInferenceMs ? `${(timings.aiInferenceMs / 1000).toFixed(2)}s` : '-';
                if (timeNetwork) {
                    const serverMs = timings.totalServerMs || 0;
                    const netMs = Math.max(0, totalElapsedMs - serverMs);
                    timeNetwork.textContent = `${netMs}ms`;
                }
            }

            // Điền toàn bộ thông tin bóc tách vào form
            fillForm(candidateRecord);

            showToast('Trích xuất hồ sơ CV thành công!', 'success');

        } catch (error) {
            clearInterval(timerInterval);
            showToast(`Lỗi bóc tách CV: ${error.message}`, 'danger');
        } finally {
            loadingOverlay.classList.add('hidden');
            extractBtn.disabled = false;
            btnText.textContent = 'Trích xuất CV';
        }
    });
}

// Lưu thay đổi hồ sơ
if (btnSaveCandidate) {
    btnSaveCandidate.addEventListener('click', async () => {
        const updatedRecord = collectFormData();
        currentCandidateRecord = updatedRecord;

        try {
            const res = await fetch('/api/candidates/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRecord)
            });

            if (res.ok) {
                showToast('Hồ sơ ứng viên đã được lưu thành công!', 'success');
            } else {
                showToast('Đã lưu dữ liệu vào bộ nhớ phiên làm việc.', 'info');
            }
        } catch (e) {
            showToast('Đã cập nhật hồ sơ trong bộ nhớ phiên.', 'info');
        }
    });
}

// Làm mới toàn bộ form hồ sơ
if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn làm mới toàn bộ nội dung form không?')) {
            currentCandidateRecord = null;
            if (document.getElementById('candidateForm')) {
                document.getElementById('candidateForm').reset();
            }
            if (formSocialLinks) formSocialLinks.innerHTML = '';
            if (formExperience) formExperience.innerHTML = '';
            if (formProjects) formProjects.innerHTML = '';
            if (formEducation) formEducation.innerHTML = '';
            if (formCertificates) formCertificates.innerHTML = '';
            if (formAwards) formAwards.innerHTML = '';
            if (formActivities) formActivities.innerHTML = '';
            if (formReferences) formReferences.innerHTML = '';
            updateAvatarInitials('');
            if (timingBanner) timingBanner.classList.add('hidden');
            if (fileNameDisplay) fileNameDisplay.textContent = 'hoặc bấm để chọn file (tối đa 10MB)';
            if (cvFileInput) cvFileInput.value = '';
            showToast('Đã làm mới form hồ sơ.', 'info');
        }
    });
}

// Đăng ký sự kiện các nút thêm dòng động
document.getElementById('btnAddSocial')?.addEventListener('click', () => addSocialLinkRow());
document.getElementById('btnAddExperience')?.addEventListener('click', () => addExperienceItem());
document.getElementById('btnAddProject')?.addEventListener('click', () => addProjectItem());
document.getElementById('btnAddEducation')?.addEventListener('click', () => addEducationItem());
document.getElementById('btnAddCert')?.addEventListener('click', () => addCertificateItem());
document.getElementById('btnAddAward')?.addEventListener('click', () => addAwardItem());
document.getElementById('btnAddActivity')?.addEventListener('click', () => addActivityItem());
document.getElementById('btnAddReference')?.addEventListener('click', () => addReferenceItem());

// Cập nhật tên avatar khi người dùng gõ họ tên
formName?.addEventListener('input', (e) => updateAvatarInitials(e.target.value));

// Mẫu JD thử nghiệm
const JD_TEMPLATES = {
    pass: `Vị trí: Senior Procurement Specialist (Chuyên viên Mua sắm Cấp cao)
Địa điểm: Hà Nội / Bắc Ninh
Mức lương: 25.000.000 - 35.000.000 VNĐ

Mô tả công việc:
- Quản lý mua sắm thiết bị CAPEX, vật tư và dịch vụ phụ trợ cho nhà máy may mặc / công nghệ cao.
- Tìm kiếm, đánh giá và quản lý mạng lưới nhà cung cấp trong và ngoài nước (Trung Quốc, Đài Loan, Việt Nam).
- Đàm phán điều khoản hợp đồng, giá cả và thời hạn thanh toán để tối ưu chi phí (Cost optimization).
- Phối hợp với phòng Kế toán và Kho vận trên hệ thống SAP ERP.

Yêu cầu ứng viên:
- Tối thiểu 5 năm kinh nghiệm trong lĩnh vực Mua sắm (Procurement / Purchasing / Sourcing).
- Thành thạo phần mềm SAP ERP (phân hệ MM) và Excel phân tích dữ liệu.
- Kỹ năng đàm phán, thương lượng hợp đồng xuất sắc.
- Tiếng Anh giao tiếp tốt trong công việc.
- Tốt nghiệp Đại học khối ngành Kinh tế, Ngoại thương, Thương mại hoặc tương đương.`,

    fail: `Vị trí: Senior DevOps / Cloud Infrastructure Engineer
Địa điểm: TP. Hồ Chí Minh
Mức lương: $2,500 - $3,500

Mô tả công việc:
- Thiết kế, triển khai và vận hành hạ tầng Kubernetes trên AWS / GCP.
- Xây dựng hệ thống CI/CD pipeline tự động hóa với GitLab CI, Terraform và Ansible.
- Giám sát hiệu năng hệ thống với Prometheus, Grafana, ELK Stack.
- Đảm bảo tính sẵn sàng cao (High Availability) và bảo mật cho hệ thống microservices.

Yêu cầu ứng viên:
- Tối thiểu 5 năm kinh nghiệm chuyên sâu về DevOps và Cloud Architecture.
- Thành thạo Docker, Kubernetes, Terraform, Helm.
- Có kinh nghiệm lập trình Go hoặc Python phục vụ tự động hóa hạ tầng.
- Đạt các chứng chỉ AWS Solutions Architect Professional hoặc CKA là lợi thế lớn.`
};

// Đăng ký sự kiện chọn mẫu JD
document.querySelectorAll('.jd-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        if (JD_TEMPLATES[type] && jdInput) {
            jdInput.value = JD_TEMPLATES[type];
            showToast(`Đã áp dụng mẫu JD: ${type === 'pass' ? 'Procurement' : 'DevOps'}`, 'info');
        }
    });
});

// Xử lý modal mở rộng JD
if (toggleJdExpand && jdModal && modalJdInput) {
    toggleJdExpand.addEventListener('click', () => {
        modalJdInput.value = jdInput.value;
        jdModal.classList.remove('hidden');
    });

    closeJdModal?.addEventListener('click', () => jdModal.classList.add('hidden'));
    saveJdModal?.addEventListener('click', () => {
        jdInput.value = modalJdInput.value;
        jdModal.classList.add('hidden');
        showToast('Đã cập nhật nội dung JD.', 'info');
    });
}

// Chấm điểm độ phù hợp giữa hồ sơ ứng viên và JD
if (matchBtn) {
    matchBtn.addEventListener('click', async () => {
        const jd = jdInput ? jdInput.value.trim() : '';
        if (!jd) {
            showToast('Vui lòng nhập hoặc chọn mẫu JD cần chấm điểm!', 'warning');
            return;
        }

        // Lấy dữ liệu hồ sơ mới nhất từ form
        const candidateData = collectFormData();
        if (!candidateData.candidate.fullName && !currentCandidateRecord) {
            showToast('Vui lòng bóc tách hoặc nhập thông tin ứng viên trước khi chấm điểm!', 'warning');
            return;
        }

        matchBtn.disabled = true;
        matchBtn.innerHTML = '<span>Đang chấm điểm AI...</span>';

        try {
            const response = await fetch('/api/match-jd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateRecord: candidateData,
                    jobDescription: jd
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            renderMatchResult(data);
            showToast('Chấm điểm độ phù hợp thành công!', 'success');

        } catch (error) {
            showToast(`Lỗi chấm điểm: ${error.message}`, 'danger');
        } finally {
            matchBtn.disabled = false;
            matchBtn.innerHTML = '<span>✦ Chấm điểm độ phù hợp</span>';
        }
    });
}

// Hiển thị kết quả chấm điểm JD
function renderMatchResult(data) {
    if (!matchResult) return;
    matchResult.classList.remove('hidden');

    const score = Number(data.score) || 0;
    const rec = data.recommendation || 'CÂN NHẮC';
    const reason = data.reason || 'Không có nhận xét chi tiết.';

    // Cập nhật vòng quay điểm số
    if (scorePath) {
        scorePath.setAttribute('stroke-dasharray', `${score}, 100`);
        let strokeColor = 'var(--gold)';
        if (score >= 75) strokeColor = 'var(--brand)';
        else if (score < 50) strokeColor = 'var(--gap)';
        scorePath.style.color = strokeColor;
    }

    if (scoreText) scoreText.textContent = `${score}%`;

    // Cập nhật nhãn khuyến nghị
    if (recommendationBadge) {
        recommendationBadge.textContent = rec;
        recommendationBadge.className = 'conf-badge';
        if (rec.toUpperCase().includes('NÊN') || rec.toUpperCase().includes('PHỎNG VẤN') || score >= 75) {
            recommendationBadge.classList.add('conf-high');
        } else if (rec.toUpperCase().includes('TỪ CHỐI') || score < 50) {
            recommendationBadge.classList.add('conf-low');
        } else {
            recommendationBadge.classList.add('conf-med');
        }
    }

    // Nhận xét chi tiết
    if (reasonText) reasonText.textContent = reason;
}
