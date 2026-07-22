const extractBtn = document.getElementById('extractBtn');
const cvFileInput = document.getElementById('cvFile');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');
const avatarInitials = document.getElementById('avatarInitials');

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

// Cập nhật tên file PDF đã chọn
cvFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileNameDisplay.textContent = `Đã chọn: ${e.target.files[0].name}`;
        fileNameDisplay.classList.add('text-indigo-600', 'font-bold');
    } else {
        fileNameDisplay.textContent = "Định dạng PDF (Tối đa 10MB)";
        fileNameDisplay.classList.remove('text-indigo-600', 'font-bold');
    }
});

// Gửi file CV lên server bóc tách AI
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

    } catch (error) {
        alert("Đã xảy ra lỗi: " + error.message);
    } finally {
        setLoading(false);
    }
});

// Trạng thái chờ xử lý trích xuất CV (Lock UI Canvas hoàn toàn)
function setLoading(isLoading) {
    const formPane = document.getElementById('formPane');
    if (isLoading) {
        extractBtn.disabled = true;
        document.getElementById('btnText').textContent = "Đang xử lý...";
        
        // Khóa cuộn & cuộn lên đầu canvas để che mờ toàn bộ UI
        formPane.scrollTop = 0;
        formPane.classList.add('overflow-hidden', 'pointer-events-none');
        formPane.classList.remove('overflow-y-auto');

        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    } else {
        extractBtn.disabled = false;
        document.getElementById('btnText').textContent = "Trích xuất CV";
        
        // Mở lại cuộn & tương tác UI
        formPane.classList.remove('overflow-hidden', 'pointer-events-none');
        formPane.classList.add('overflow-y-auto');

        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
    }
}

// Báo hiệu trực quan dữ liệu tự động điền
function triggerHighlight(element, isSuccess, errorMsg = "") {
    element.classList.remove('highlight-success', 'highlight-error', 'error-state');
    void element.offsetWidth;

    if (isSuccess) {
        element.classList.add('highlight-success');
        setTimeout(() => {
            element.classList.remove('highlight-success');
        }, 1000);
    } else {
        element.classList.add('highlight-error');
        setTimeout(() => {
            element.classList.remove('highlight-error');
        }, 1000);
    }
}

// Tạo chữ cái viết tắt tên ứng viên
function getInitials(name) {
    if (!name) return "YD";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Đổ dữ liệu CV vào canvas ứng viên
function fillForm(record) {
    const candidate = record.candidate || {};
    const links = candidate.links || {};
    const missing = record.missingFields || [];

    avatarInitials.textContent = getInitials(candidate.fullName);

    const textMappings = ['fullName', 'email', 'phone', 'location', 'currentTitle', 'totalExperienceMonths', 'professionalSummary'];
    textMappings.forEach(key => {
        const el = formFields[key];
        const val = candidate[key] !== null && candidate[key] !== undefined ? candidate[key] : "";
        
        if (missing.includes(key) || (!val && ['fullName', 'email', 'phone'].includes(key))) {
            triggerHighlight(el, false);
        } else {
            el.value = val;
            triggerHighlight(el, true);
        }
    });

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

    const fillPills = (list, container, emptyMsg) => {
        container.innerHTML = "";
        if (list && list.length > 0) {
            triggerHighlight(container, true);
            list.forEach(item => {
                const span = document.createElement('span');
                span.className = 'tag-yody';
                span.textContent = item;
                container.appendChild(span);
            });
        } else {
            triggerHighlight(container, false);
            container.innerHTML = `<span class="text-xs text-slate-400 italic font-medium">${emptyMsg}</span>`;
        }
    };
    fillPills(candidate.skills, formFields.skills, "Chưa có dữ liệu kỹ năng");
    fillPills(candidate.languages, formFields.languages, "Chưa có dữ liệu ngoại ngữ");

    // Render Timeline kinh nghiệm làm việc
    const expContainer = formFields.workExperience;
    expContainer.innerHTML = "";
    if (record.workExperience && record.workExperience.length > 0) {
        triggerHighlight(expContainer, true);
        record.workExperience.forEach(exp => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'timeline-item';
            itemDiv.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="card-yody">
                    <div class="font-bold text-slate-900 text-sm font-display">${exp.title || "Chưa rõ chức danh"}</div>
                    <div class="text-xs font-semibold text-[#2a2b86] mt-0.5">${exp.company || "Công ty?"} <span class="text-slate-400 font-normal">| ${exp.startDate || "?"} - ${exp.endDate || "Hiện tại"}</span></div>
                    ${exp.description ? `<p class="text-xs text-slate-600 mt-2 leading-relaxed">${exp.description}</p>` : ''}
                </div>
            `;
            expContainer.appendChild(itemDiv);
        });
    } else {
        triggerHighlight(expContainer, false);
        expContainer.innerHTML = `<div class="text-xs text-slate-400 italic font-medium p-2">Chưa có dữ liệu kinh nghiệm</div>`;
    }

    const fillCards = (list, container, emptyMsg, renderHtml) => {
        container.innerHTML = "";
        if (list && list.length > 0) {
            triggerHighlight(container, true);
            list.forEach(item => {
                const div = document.createElement('div');
                div.className = 'card-yody';
                div.innerHTML = renderHtml(item);
                container.appendChild(div);
            });
        } else {
            triggerHighlight(container, false);
            container.innerHTML = `<div class="text-xs text-slate-400 italic font-medium p-2">${emptyMsg}</div>`;
        }
    };

    fillCards(record.projects, formFields.projects, "Chưa có dữ liệu dự án", (proj) => `
        <div class="font-bold text-slate-900 text-sm font-display">${proj.name || "Tên dự án?"} <span class="font-semibold text-xs text-[#2a2b86]">(${proj.role || "Vai trò?"})</span></div>
        <div class="text-xs text-slate-500 mt-1 truncate font-mono">${(proj.technologies || []).join(', ')}</div>
        ${proj.description ? `<p class="text-xs text-slate-600 mt-1 leading-relaxed">${proj.description}</p>` : ''}
    `);

    fillCards(record.education, formFields.education, "Chưa có dữ liệu học vấn", (edu) => `
        <div class="font-bold text-slate-900 text-sm font-display">${edu.institution || "Trường?"}</div>
        <div class="text-xs text-[#2a2b86] font-medium mt-0.5">${edu.degree ? edu.degree + " - " : ""}${edu.fieldOfStudy || "Chuyên ngành?"}</div>
        <div class="text-xs text-slate-400 mt-1 font-mono">${edu.startDate || "?"} - ${edu.endDate || "?"}</div>
    `);

    fillCards(record.certifications, formFields.certifications, "Chưa có dữ liệu chứng chỉ", (cert) => `
        <div class="font-bold text-slate-900 text-sm font-display">${cert.name || "Tên chứng chỉ?"}</div>
        <div class="text-xs text-[#2a2b86] font-medium mt-0.5">${cert.issuer || "Đơn vị cấp?"} | ${cert.issueDate || "?"}</div>
    `);
}

// JD Mẫu kiểm thử ban đầu
const JDTemplates = {
    pass: `Vị trí: JUNIOR / ASSOCIATE FRONTEND ENGINEER (REACT / TYPESCRIPT / FIREBASE)

1. TỔNG QUAN VỊ TRÍ:
Tham gia thiết kế, phát triển các ứng dụng Web/PWA, hệ thống thời gian thực (Real-time), tích hợp dịch vụ AI APIs và hạ tầng Serverless.

2. TRÁCH NHIỆM & YÊU CẦU CÔNG VIỆC:
- Tốt nghiệp Đại học chuyên ngành Công nghệ Phần mềm / CNTT. Ưu tiên GPA >= 3.0/4.0.
- Lập trình Web/PWA responsive với React và TypeScript.
- Kết nối Firebase (Firestore, Auth) và RESTful APIs (TMDB, VietQR, OpenRouter AI API).
- Xây dựng hệ thống giao tiếp real-time (ZegoCloud), Dashboard quản lý nhân sự, thanh toán mã QR.
- Quản lý mã nguồn qua Git/GitHub, thiết kế UML (Visual Paradigm).
- Ngoại ngữ: Tiếng Anh đọc hiểu tài liệu kỹ thuật tốt (tương đương B2 VSTEP).
- Điểm cộng: Có kinh nghiệm triển khai thực tế trên Vercel.`,
    fail: `Vị trí: SENIOR JAVA & DEVOPS ENGINEER (KUBERNETES / AWS / SPRING BOOT)

1. TỔNG QUAN VỊ TRÍ:
Quản trị hạ tầng điện toán đám mây quy mô lớn và phát triển hệ thống Core Banking Microservices.

2. TRÁCH NHIỆM & YÊU CẦU CÔNG VIỆC:
- Tối thiểu 6 năm kinh nghiệm lập trình Java Spring Boot, Microservices Architecture.
- Quản trị hạ tầng Cloud AWS, Kubernetes (K8s), Docker Cluster, Terraform, Ansible.
- Tối ưu hóa CSDL phân tán PostgreSQL, Oracle và Distributed Caching (Redis, Hazelcast).
- Yêu cầu bắt buộc: Có chứng chỉ AWS Certified Solutions Architect Professional hoặc CKA.
- Ngoại ngữ: Tiếng Trung thành thạo HSK 5 trở lên (trao đổi trực tiếp với đối tác).
- Tối thiểu 3 năm kinh nghiệm ở vị trí Tech Lead / Manager quản lý từ 10 nhân sự.`
};

document.querySelectorAll('.jd-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        if (JDTemplates[type]) {
            document.getElementById('jdInput').value = JDTemplates[type];
        }
    });
});

// Quản lý Modal xem full JD
const toggleJdExpandBtn = document.getElementById('toggleJdExpand');
const jdModal = document.getElementById('jdModal');
const closeJdModalBtn = document.getElementById('closeJdModal');
const saveJdModalBtn = document.getElementById('saveJdModal');
const modalJdInput = document.getElementById('modalJdInput');

if (toggleJdExpandBtn) {
    toggleJdExpandBtn.addEventListener('click', () => {
        modalJdInput.value = document.getElementById('jdInput').value;
        jdModal.classList.remove('hidden');
    });
}

if (closeJdModalBtn) {
    closeJdModalBtn.addEventListener('click', () => {
        jdModal.classList.add('hidden');
    });
}

if (saveJdModalBtn) {
    saveJdModalBtn.addEventListener('click', () => {
        document.getElementById('jdInput').value = modalJdInput.value;
        jdModal.classList.add('hidden');
    });
}

// Chấm điểm độ phù hợp JD
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
    btn.innerHTML = '<span>Đang phân tích...</span>';

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
        
        const matchResultEl = document.getElementById('matchResult');
        matchResultEl.classList.remove('hidden');
        setTimeout(() => {
            matchResultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
        
        const score = matchResult.score || 0;
        document.getElementById('scoreText').textContent = score + '%';
        document.getElementById('scorePath').setAttribute('stroke-dasharray', `${score}, 100`);
        
        const badge = document.getElementById('recommendationBadge');
        const reasonBox = document.getElementById('reasonBox');
        const reasonTitle = document.getElementById('reasonTitle');
        const reasonIcon = document.getElementById('reasonIcon');
        const reasonText = document.getElementById('reasonText');

        badge.textContent = matchResult.recommendation;
        reasonText.textContent = matchResult.reason || 'Chưa có thông tin đánh giá.';

        if (score >= 80) {
            badge.className = "conf-badge conf-high mt-2.5 text-center shadow-xs";
            reasonBox.className = "p-4 rounded-2xl border bg-emerald-50/90 border-emerald-200 text-emerald-950 fill-transition shadow-2xs";
            reasonTitle.className = "text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono text-emerald-800";
            reasonIcon.innerHTML = '<svg class="w-4 h-4 text-emerald-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        } else if (score >= 50) {
            badge.className = "conf-badge conf-med mt-2.5 text-center shadow-xs";
            reasonBox.className = "p-4 rounded-2xl border bg-amber-50/90 border-amber-200 text-amber-950 fill-transition shadow-2xs";
            reasonTitle.className = "text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono text-amber-800";
            reasonIcon.innerHTML = '<svg class="w-4 h-4 text-amber-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
        } else {
            badge.className = "conf-badge conf-low mt-2.5 text-center shadow-xs";
            reasonBox.className = "p-4 rounded-2xl border bg-rose-50/90 border-rose-200 text-rose-950 fill-transition shadow-2xs";
            reasonTitle.className = "text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono text-rose-800";
            reasonIcon.innerHTML = '<svg class="w-4 h-4 text-rose-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        }

    } catch (error) {
        alert("Đã xảy ra lỗi: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Chấm điểm độ phù hợp</span>';
    }
});
