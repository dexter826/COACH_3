const extractBtn = document.getElementById('extractBtn');
const cvFileInput = document.getElementById('cvFile');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');

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

// Xử lý hiển thị tên file
cvFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileNameDisplay.textContent = `Đã chọn: ${e.target.files[0].name}`;
        fileNameDisplay.classList.add('text-brand-blue', 'font-medium');
    } else {
        fileNameDisplay.textContent = "Hỗ trợ PDF, PNG, JPG (Max 10MB)";
        fileNameDisplay.classList.remove('text-brand-blue', 'font-medium');
    }
});

extractBtn.addEventListener('click', async () => {
    const files = cvFileInput.files;

    if (files.length === 0) {
        alert("Vui lòng chọn file CV.");
        return;
    }

    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('cvFile', files[0]);

        // Gọi về Backend Server nội bộ
        const response = await fetch(`http://localhost:3000/api/parse-cv`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Lỗi khi gọi Server.");
        }

        const candidateRecord = await response.json();
        currentCandidateRecord = candidateRecord;
        fillForm(candidateRecord);
        switchTab('cv');

    } catch (error) {
        alert("Đã xảy ra lỗi: " + error.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        extractBtn.disabled = true;
        document.getElementById('btnText').textContent = "Đang xử lý...";
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    } else {
        extractBtn.disabled = false;
        document.getElementById('btnText').textContent = "Trích xuất CV";
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
    }
}

function triggerHighlight(element, isSuccess, errorMsg = "") {
    element.classList.remove('highlight-success', 'highlight-error', 'error-state');
    const parent = element.parentElement;
    const msgEl = parent.querySelector('.error-msg');
    if (msgEl) {
        msgEl.classList.add('hidden');
        msgEl.textContent = "";
    }

    void element.offsetWidth; // force reflow

    if (isSuccess) {
        element.classList.add('highlight-success');
        setTimeout(() => {
            element.classList.remove('highlight-success');
        }, 1000);
    } else {
        element.classList.add('highlight-error', 'error-state');
        setTimeout(() => {
            element.classList.remove('highlight-error');
        }, 1000);
        if (msgEl) {
            msgEl.textContent = errorMsg;
            msgEl.classList.remove('hidden');
        }
    }
}

function fillForm(record) {
    const candidate = record.candidate || {};
    const links = candidate.links || {};
    const missing = record.missingFields || [];

    // 1. Text Inputs
    const textMappings = ['fullName', 'email', 'phone', 'location', 'currentTitle', 'totalExperienceMonths', 'professionalSummary'];
    textMappings.forEach(key => {
        const el = formFields[key];
        const val = candidate[key] !== null && candidate[key] !== undefined ? candidate[key] : "";
        
        if (missing.includes(key) || (!val && ['fullName', 'email', 'phone'].includes(key))) {
            triggerHighlight(el, false, `AI không tìm thấy ${key}, vui lòng bổ sung.`);
        } else {
            el.value = val;
            triggerHighlight(el, true);
        }
    });

    // 2. Links
    const linkMappings = [
        { key: 'linkedin', el: formFields.linkLinkedin },
        { key: 'github', el: formFields.linkGithub },
        { key: 'portfolio', el: formFields.linkPortfolio }
    ];
    linkMappings.forEach(item => {
        const val = links[item.key] || "";
        item.el.value = val;
        if (val) triggerHighlight(item.el, true);
        else triggerHighlight(item.el, false);
    });

    // 3. Helper for Array Pills (Skills, Languages)
    const fillPills = (list, container, emptyMsg) => {
        container.innerHTML = "";
        if (list && list.length > 0) {
            triggerHighlight(container, true);
            list.forEach(item => {
                const span = document.createElement('span');
                span.className = 'skill-pill';
                span.textContent = item;
                container.appendChild(span);
            });
        } else {
            triggerHighlight(container, false);
            container.innerHTML = `<span class="text-sm text-gray-400 italic">${emptyMsg}</span>`;
        }
    };
    fillPills(candidate.skills, formFields.skills, "Chưa có dữ liệu kỹ năng");
    fillPills(candidate.languages, formFields.languages, "Chưa có dữ liệu ngoại ngữ");

    // 4. Helper for Cards (Exp, Projects, Education)
    const fillCards = (list, container, emptyMsg, renderHtml) => {
        container.innerHTML = "";
        if (list && list.length > 0) {
            triggerHighlight(container, true);
            list.forEach(item => {
                const div = document.createElement('div');
                div.className = 'exp-card';
                div.innerHTML = renderHtml(item);
                container.appendChild(div);
            });
        } else {
            triggerHighlight(container, false);
            container.innerHTML = `<div class="text-sm text-gray-400 italic">${emptyMsg}</div>`;
        }
    };

    fillCards(record.workExperience, formFields.workExperience, "Chưa có dữ liệu kinh nghiệm", (exp) => `
        <div class="font-medium text-gray-900">${exp.title || "Chưa rõ chức danh"}</div>
        <div class="text-sm text-gray-500">${exp.company || "Công ty?"} | ${exp.startDate || "?"} - ${exp.endDate || "Hiện tại"}</div>
    `);

    fillCards(record.projects, formFields.projects, "Chưa có dữ liệu dự án", (proj) => `
        <div class="font-medium text-gray-900">${proj.name || "Tên dự án?"} <span class="font-normal text-sm text-gray-500">(${proj.role || "Vai trò?"})</span></div>
        <div class="text-sm text-gray-500 mt-1 truncate">${(proj.technologies || []).join(', ')}</div>
    `);

    fillCards(record.education, formFields.education, "Chưa có dữ liệu học vấn", (edu) => `
        <div class="font-medium text-gray-900">${edu.institution || "Trường?"}</div>
        <div class="text-sm text-gray-500">${edu.degree ? edu.degree + " - " : ""}${edu.fieldOfStudy || "Chuyên ngành?"}</div>
        <div class="text-sm text-gray-500 mt-1">${edu.startDate || "?"} - ${edu.endDate || "?"}</div>
    `);

    fillCards(record.certifications, formFields.certifications, "Chưa có dữ liệu chứng chỉ", (cert) => `
        <div class="font-medium text-gray-900">${cert.name || "Tên chứng chỉ?"}</div>
        <div class="text-sm text-gray-500">${cert.issuer || "Đơn vị cấp?"} | ${cert.issueDate || "?"}</div>
    `);
}

// LOGIC JD MATCHER
const JDTemplates = {
    frontend: `Vị trí: Senior Frontend Developer
Yêu cầu:
- Tối thiểu 3 năm kinh nghiệm lập trình Frontend với ReactJS.
- Thành thạo HTML, CSS, JavaScript, ES6.
- Có kinh nghiệm làm việc với hệ thống UI lớn, tối ưu hóa hiệu năng (performance tuning).
- Có kiến thức về CI/CD, Git.
- Tinh thần làm việc nhóm tốt, chủ động trong công việc.`,
    marketing: `Vị trí: Digital Marketing Executive
Yêu cầu:
- Tốt nghiệp Đại học chuyên ngành Marketing, QTKD hoặc tương đương.
- Ít nhất 2 năm kinh nghiệm chạy Ads (Facebook, Google, Tiktok).
- Có tư duy phân tích số liệu (Google Analytics).
- Có khả năng lên kế hoạch và tối ưu chiến dịch quảng cáo.
- Kỹ năng giao tiếp và làm việc nhóm xuất sắc.`
};

document.querySelectorAll('.jd-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        document.getElementById('jdInput').value = JDTemplates[type];
    });
});

document.getElementById('matchBtn').addEventListener('click', async () => {
    const jdText = document.getElementById('jdInput').value.trim();
    if (!jdText) {
        alert("Vui lòng nhập Yêu cầu công việc (JD).");
        return;
    }
    if (!currentCandidateRecord) {
        alert("Vui lòng trích xuất CV trước khi chấm điểm.");
        return;
    }

    const btn = document.getElementById('matchBtn');
    btn.disabled = true;
    btn.innerHTML = 'Đang phân tích...';

    try {
        const response = await fetch(`http://localhost:3000/api/match-jd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateRecord: currentCandidateRecord,
                jobDescription: jdText
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Lỗi khi gọi Server Matcher.");
        }

        const matchResult = await response.json();
        
        // Show result
        document.getElementById('matchResult').classList.remove('hidden');
        
        // Update Gauge
        const score = matchResult.score || 0;
        document.getElementById('scoreText').textContent = score + '%';
        document.getElementById('scorePath').setAttribute('stroke-dasharray', `${score}, 100`);
        
        // Update Badge
        const badge = document.getElementById('recommendationBadge');
        badge.textContent = matchResult.recommendation;
        if (score >= 80) badge.className = "mt-4 px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800 text-center border border-green-200";
        else if (score >= 50) badge.className = "mt-4 px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 text-center border border-yellow-200";
        else badge.className = "mt-4 px-4 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 text-center border border-red-200";

        // Lists
        const prosList = document.getElementById('prosList');
        prosList.innerHTML = (matchResult.pros || []).map(p => `<li class="flex items-start gap-2"><span class="text-green-500 mt-0.5 font-bold">✓</span> <span>${p}</span></li>`).join('');
        
        const consList = document.getElementById('consList');
        consList.innerHTML = (matchResult.cons || []).map(c => `<li class="flex items-start gap-2"><span class="text-red-500 mt-0.5 font-bold">✗</span> <span>${c}</span></li>`).join('');

    } catch (error) {
        alert("Đã xảy ra lỗi: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Chấm điểm hồ sơ';
    }
});


const tabCv = document.getElementById('tab-cv');
const tabJd = document.getElementById('tab-jd');
const contentCv = document.getElementById('content-cv');
const contentJd = document.getElementById('content-jd');
const tabDescription = document.getElementById('tabDescription');

function switchTab(tabName) {
    if (tabName === 'cv') {
        tabCv.className = "border-brand-blue text-brand-blue whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg";
        tabJd.className = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors";
        contentCv.classList.remove('hidden');
        contentJd.classList.add('hidden');
        tabDescription.textContent = "Các thông tin dưới đây được AI tự động trích xuất và chuẩn hóa từ CV.";
    } else {
        tabJd.className = "border-brand-blue text-brand-blue whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg";
        tabCv.className = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors";
        contentJd.classList.remove('hidden');
        contentCv.classList.add('hidden');
        tabDescription.textContent = "So sánh kỹ năng và kinh nghiệm của ứng viên với yêu cầu công việc (JD).";
    }
}

tabCv.addEventListener('click', () => switchTab('cv'));
tabJd.addEventListener('click', () => switchTab('jd'));
