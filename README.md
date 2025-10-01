# 📝 TodoList 애플리케이션

HTML, CSS, JavaScript, FastAPI를 활용한 모던 할 일 관리 웹 애플리케이션입니다.

## 🌟 주요 기능

- ✅ 할 일 추가, 수정, 삭제
- ✅ 완료/미완료 상태 토글
- ✅ 필터링 (전체/진행중/완료)
- ✅ 실시간 통계 표시
- ✅ 아름다운 UI/UX
- ✅ 반응형 디자인 (모바일 지원)
- ✅ RESTful API 백엔드

## 🛠️ 기술 스택

### 백엔드
- **FastAPI**: 빠르고 현대적인 Python 웹 프레임워크
- **Uvicorn**: ASGI 서버
- **Pydantic**: 데이터 검증

### 프론트엔드
- **HTML5**: 구조
- **CSS3**: 스타일링 (그라디언트, 애니메이션 등)
- **JavaScript (Vanilla)**: 기능 구현

## 📁 프로젝트 구조

```
todolist/
├── main.py                  # FastAPI 백엔드 서버
├── requirements.txt         # Python 패키지 의존성
├── README.md               # 프로젝트 문서
└── frontend/               # 프론트엔드 파일
    ├── index.html          # HTML 구조
    ├── style.css           # CSS 스타일
    └── script.js           # JavaScript 기능
```

## 🚀 설치 및 실행 방법

### 1. 사전 요구사항
- Python 3.8 이상
- pip (Python 패키지 관리자)

### 2. 가상환경 생성 (권장)
```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 3. 패키지 설치
```bash
pip install -r requirements.txt
```

### 4. 서버 실행
```bash
# 방법 1: Python으로 직접 실행
python main.py

# 방법 2: Uvicorn 명령어 사용
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 웹 브라우저에서 접속
- **프론트엔드**: http://localhost:8000/static/index.html
- **API 문서**: http://localhost:8000/docs
- **대체 API 문서**: http://localhost:8000/redoc

## 📡 API 엔드포인트

### 할 일 목록 관리

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/todos` | 모든 할 일 조회 |
| GET | `/api/todos/{id}` | 특정 할 일 조회 |
| POST | `/api/todos` | 새 할 일 생성 |
| PUT | `/api/todos/{id}` | 할 일 수정 |
| PATCH | `/api/todos/{id}/toggle` | 완료 상태 토글 |
| DELETE | `/api/todos/{id}` | 특정 할 일 삭제 |
| DELETE | `/api/todos` | 모든 할 일 삭제 |

### API 사용 예시

#### 할 일 추가
```bash
curl -X POST "http://localhost:8000/api/todos" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "FastAPI 공부하기",
    "description": "TodoList API 만들기",
    "completed": false
  }'
```

#### 할 일 목록 조회
```bash
curl http://localhost:8000/api/todos
```

## 💡 사용 방법

1. **할 일 추가**
   - 제목 입력란에 할 일을 입력
   - (선택) 상세 설명 입력
   - "추가하기" 버튼 클릭 또는 Enter 키

2. **할 일 완료 처리**
   - 체크박스 클릭 또는
   - 할 일 내용 클릭

3. **할 일 수정**
   - ✏️ (연필) 버튼 클릭
   - 새로운 제목과 설명 입력

4. **할 일 삭제**
   - 🗑️ (휴지통) 버튼 클릭
   - 확인 대화상자에서 "확인"

5. **필터링**
   - "전체": 모든 할 일 표시
   - "진행중": 미완료 할 일만 표시
   - "완료": 완료된 할 일만 표시

6. **일괄 삭제**
   - "완료된 항목 삭제": 완료된 할 일만 삭제
   - "전체 삭제": 모든 할 일 삭제

## 🎨 주요 특징

### UI/UX
- 모던하고 직관적인 디자인
- 부드러운 애니메이션 효과
- 그라디언트 배경
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 실시간 알림 메시지
- 로딩 스피너

### 기능
- 실시간 통계 (전체/진행중/완료)
- 생성 시간 자동 기록
- 상대적 시간 표시 ("방금 전", "5분 전" 등)
- XSS 방지를 위한 HTML 이스케이프
- CORS 설정으로 크로스 도메인 지원

## 🔧 개발 가이드

### 데이터베이스 연동 (선택사항)
현재는 메모리 내 저장소를 사용합니다. 실제 데이터베이스를 연동하려면:

1. **SQLite** (간단한 프로토타입)
```python
import sqlite3
```

2. **PostgreSQL** (프로덕션 환경)
```bash
pip install sqlalchemy psycopg2-binary
```

3. **MongoDB** (NoSQL)
```bash
pip install motor pymongo
```

### 프론트엔드 개선
- React, Vue, Angular 등으로 마이그레이션
- TypeScript 적용
- 상태 관리 라이브러리 추가
- PWA (Progressive Web App) 변환

### 백엔드 개선
- 데이터베이스 연동
- 사용자 인증/인가
- 파일 업로드 기능
- 태그/카테고리 기능
- 검색 기능

## 🐛 문제 해결

### 포트 충돌
```bash
# 다른 포트로 실행
uvicorn main:app --port 8001
```

### CORS 오류
- `main.py`의 `allow_origins` 설정 확인
- 브라우저 캐시 삭제

### 모듈 없음 오류
```bash
# 패키지 재설치
pip install -r requirements.txt --force-reinstall
```

## 📚 학습 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Python 공식 문서](https://docs.python.org/)

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다. 자유롭게 사용하고 수정할 수 있습니다.

## 🙏 기여

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

---

**즐거운 코딩 되세요! 💻✨**

