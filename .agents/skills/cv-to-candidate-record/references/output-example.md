# Ví dụ CV và JSON đầu ra

## CV Mẫu
```text
Nguyễn Văn A
Email: nguyen.a @gmail.com
Phone: 0901.234.567
Hà Nội
Backend Dev

Tóm tắt: 3 năm kinh nghiệm làm NodeJS.

Kinh nghiệm:
Công ty X (Tháng 5/2020 - Hiện tại)
- Backend Engineer
- Viết API với NodeJS, xài MongoDB.
- Thành tích: Tăng 20% performance.

Học vấn:
Đại học Y
Công nghệ Thông tin
2016 - 2020

Kỹ năng: node.js, mongodb, React.js, tiếng anh
Github: https://github.com/nguyena
```

## JSON Đầu ra
```json
{
  "candidate": {
    "fullName": "Nguyễn Văn A",
    "email": "nguyen.a@gmail.com",
    "phone": "0901234567",
    "location": "Hà Nội",
    "currentTitle": "Backend Dev",
    "professionalSummary": "3 năm kinh nghiệm làm NodeJS.",
    "totalExperienceMonths": 38,
    "skills": [
      "Node.js",
      "MongoDB",
      "React",
      "Tiếng Anh"
    ],
    "languages": [],
    "links": {
      "linkedin": "",
      "github": "https://github.com/nguyena",
      "portfolio": "",
      "others": []
    }
  },
  "workExperience": [
    {
      "company": "Công ty X",
      "title": "Backend Engineer",
      "startDate": "2020-05",
      "endDate": "present",
      "description": [
        "Viết API với NodeJS, xài MongoDB."
      ],
      "achievements": [
        "Tăng 20% performance."
      ],
      "skills": [
        "Node.js",
        "MongoDB"
      ]
    }
  ],
  "projects": [],
  "education": [
    {
      "institution": "Đại học Y",
      "degree": "",
      "fieldOfStudy": "Công nghệ Thông tin",
      "startDate": "2016",
      "endDate": "2020",
      "details": []
    }
  ],
  "certifications": [],
  "missingFields": [
    "education[0].degree"
  ],
  "uncertainFields": []
}
```

## Giải thích chuẩn hóa
- `email` đã xóa khoảng trắng, đưa về chữ thường.
- `phone` đã bỏ dấu chấm.
- `skills` đã được chuẩn hóa định dạng chữ (Node.js, React).
- `missingFields` ghi nhận bằng cấp chưa được đề cập.
