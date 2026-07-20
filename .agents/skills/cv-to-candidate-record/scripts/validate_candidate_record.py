import sys
import json
import re

# Xác thực định dạng email.
def validate_email(email):
    if not email:
        return True
    return re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email) is not None

# Xác thực định dạng ngày.
def validate_date(date_str):
    if not date_str or date_str == "present":
        return True
    return re.match(r"^\d{4}(-\d{2})?$", date_str) is not None

# Xác thực cấu trúc URL.
def validate_url(url):
    if not url:
        return True
    return url.startswith("http://") or url.startswith("https://")

# Chạy chương trình chính.
def main():
    if len(sys.argv) < 2:
        print("Lỗi: Cần cung cấp đường dẫn đến file candidate-record.json.")
        sys.exit(1)

    path = sys.argv[1]
    errors = []

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy {path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Lỗi: File JSON không hợp lệ. ({e})")
        sys.exit(1)

    expected_keys = {
        "candidate", "workExperience", "projects", 
        "education", "certifications", "missingFields", "uncertainFields"
    }
    
    missing = expected_keys - set(data.keys())
    if missing:
        errors.append(f"Thiếu key cấp cao: {', '.join(missing)}")

    candidate = data.get("candidate", {})
    if isinstance(candidate, dict):
        if not validate_email(candidate.get("email", "")):
            errors.append("Email không hợp lệ.")
            
        months = candidate.get("totalExperienceMonths")
        if months is not None and (not isinstance(months, int) or months < 0):
            errors.append("totalExperienceMonths phải là số nguyên không âm hoặc null.")
            
        skills = candidate.get("skills", [])
        if isinstance(skills, list):
            lowered = [s.lower() for s in skills if isinstance(s, str)]
            if len(lowered) != len(set(lowered)):
                errors.append("Danh sách skills bị trùng lặp.")
                
        links = candidate.get("links", {})
        if isinstance(links, dict):
            for k in ["linkedin", "github", "portfolio"]:
                if not validate_url(links.get(k, "")):
                    errors.append(f"URL {k} không hợp lệ.")
            for u in links.get("others", []):
                if not validate_url(u):
                    errors.append("URL trong others không hợp lệ.")
    else:
        errors.append("Trường candidate phải là object.")

    for field in ["missingFields", "uncertainFields"]:
        if not isinstance(data.get(field), list):
            errors.append(f"Trường {field} phải là mảng.")

    for i, exp in enumerate(data.get("workExperience", [])):
        if isinstance(exp, dict):
            if not validate_date(exp.get("startDate", "")):
                errors.append(f"workExperience[{i}].startDate không hợp lệ.")
            if not validate_date(exp.get("endDate", "")):
                errors.append(f"workExperience[{i}].endDate không hợp lệ.")

    for i, edu in enumerate(data.get("education", [])):
        if isinstance(edu, dict):
            if not validate_date(edu.get("startDate", "")):
                errors.append(f"education[{i}].startDate không hợp lệ.")
            if not validate_date(edu.get("endDate", "")):
                errors.append(f"education[{i}].endDate không hợp lệ.")

    for i, cert in enumerate(data.get("certifications", [])):
        if isinstance(cert, dict):
            if not validate_url(cert.get("credentialUrl", "")):
                errors.append(f"certifications[{i}].credentialUrl không hợp lệ.")

    if errors:
        for err in errors:
            print(f"- {err}")
        sys.exit(1)
        
    print("File JSON hoàn toàn hợp lệ.")
    sys.exit(0)

if __name__ == "__main__":
    main()
