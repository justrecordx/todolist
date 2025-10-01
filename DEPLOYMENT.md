# 🚀 TodoList 애플리케이션 배포 가이드

이 문서는 TodoList 애플리케이션을 다양한 플랫폼에 배포하는 방법을 설명합니다.

---

## 📋 목차
1. [Render.com 배포 (추천 - 가장 쉬움)](#1-rendercom-배포-추천)
2. [Railway 배포](#2-railway-배포)
3. [Docker 사용 배포](#3-docker-사용-배포)
4. [AWS EC2 배포](#4-aws-ec2-배포)
5. [Vercel 배포](#5-vercel-배포)
6. [PythonAnywhere 배포](#6-pythonanywhere-배포)

---

## 1. Render.com 배포 (추천)

**장점:** 무료, 쉬움, 자동 HTTPS, 지속적 배포

### 단계별 가이드:

1. **GitHub에 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/todolist.git
   git push -u origin main
   ```

2. **Render 계정 생성**
   - https://render.com 접속
   - GitHub 계정으로 로그인

3. **새 Web Service 생성**
   - Dashboard → "New +" → "Web Service"
   - GitHub 저장소 연결
   - 다음 설정 입력:
     - **Name**: `todolist-app`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

4. **배포 완료!**
   - 자동으로 배포가 시작됩니다
   - URL: `https://todolist-app.onrender.com`
   - 웹앱: `https://todolist-app.onrender.com/static/index.html`

### 주의사항:
- 무료 플랜은 15분 비활성 후 sleep 모드로 전환됩니다
- 첫 요청 시 30초 정도 걸릴 수 있습니다

---

## 2. Railway 배포

**장점:** 간단, 무료 크레딧 제공, 빠른 배포

### 단계별 가이드:

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" → "Deploy from GitHub repo"
   - 저장소 선택

3. **자동 배포**
   - Railway가 자동으로 감지하고 배포합니다
   - `railway.json` 파일이 이미 설정되어 있습니다

4. **도메인 설정**
   - Settings → Generate Domain
   - 생성된 URL로 접속

### 환경 변수 (선택사항):
```
PORT=8000
PYTHON_VERSION=3.11
```

---

## 3. Docker 사용 배포

**장점:** 어디서나 실행 가능, 환경 일관성

### 로컬에서 Docker 테스트:

```bash
# Docker 이미지 빌드
docker build -t todolist-app .

# 컨테이너 실행
docker run -d -p 8000:8000 --name todolist todolist-app

# 접속
# http://localhost:8000/static/index.html

# 로그 확인
docker logs todolist

# 중지 및 삭제
docker stop todolist
docker rm todolist
```

### Docker Compose 사용:

```bash
# 시작
docker-compose up -d

# 중지
docker-compose down

# 로그 확인
docker-compose logs -f
```

### 클라우드에 Docker 배포:

#### AWS ECS
1. ECR에 이미지 푸시
2. ECS 서비스 생성
3. 로드 밸런서 설정

#### Google Cloud Run
```bash
# 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/PROJECT_ID/todolist

# 배포
gcloud run deploy todolist \
  --image gcr.io/PROJECT_ID/todolist \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances
```bash
# 컨테이너 레지스트리에 푸시
az acr build --registry REGISTRY_NAME --image todolist .

# 컨테이너 인스턴스 생성
az container create \
  --resource-group RESOURCE_GROUP \
  --name todolist \
  --image REGISTRY_NAME.azurecr.io/todolist \
  --dns-name-label todolist-app \
  --ports 8000
```

---

## 4. AWS EC2 배포

**장점:** 완전한 제어, 확장 가능

### 단계별 가이드:

1. **EC2 인스턴스 생성**
   - Ubuntu 22.04 LTS 선택
   - t2.micro (프리 티어)
   - 보안 그룹: 포트 8000, 80, 443 열기

2. **SSH 접속**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **서버 설정**
   ```bash
   # 시스템 업데이트
   sudo apt update && sudo apt upgrade -y
   
   # Python 설치
   sudo apt install python3-pip python3-venv -y
   
   # Git 설치
   sudo apt install git -y
   
   # 코드 클론
   git clone https://github.com/USERNAME/todolist.git
   cd todolist
   
   # 가상환경 생성 및 활성화
   python3 -m venv venv
   source venv/bin/activate
   
   # 패키지 설치
   pip install -r requirements.txt
   ```

4. **Nginx 설정 (선택사항)**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/todolist
   ```
   
   설정 내용:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/todolist /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Systemd 서비스 생성**
   ```bash
   sudo nano /etc/systemd/system/todolist.service
   ```
   
   내용:
   ```ini
   [Unit]
   Description=TodoList FastAPI Application
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/todolist
   Environment="PATH=/home/ubuntu/todolist/venv/bin"
   ExecStart=/home/ubuntu/todolist/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start todolist
   sudo systemctl enable todolist
   sudo systemctl status todolist
   ```

6. **SSL 인증서 (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

## 5. Vercel 배포

**장점:** 빠른 배포, 자동 HTTPS, 글로벌 CDN

### 단계별 가이드:

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **배포**
   ```bash
   vercel
   ```

3. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

**주의:** Vercel은 Serverless Function으로 실행되므로 메모리 저장소는 요청마다 초기화됩니다. 실제 데이터베이스 연동이 필요합니다.

---

## 6. PythonAnywhere 배포

**장점:** Python 특화, 무료 티어, 쉬움

### 단계별 가이드:

1. **PythonAnywhere 계정 생성**
   - https://www.pythonanywhere.com 가입

2. **Bash 콘솔에서 설정**
   ```bash
   git clone https://github.com/USERNAME/todolist.git
   cd todolist
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Web 앱 생성**
   - Web → Add a new web app
   - Manual configuration 선택
   - Python 3.10 선택

4. **WSGI 설정**
   - WSGI configuration file 편집:
   ```python
   import sys
   path = '/home/USERNAME/todolist'
   if path not in sys.path:
       sys.path.append(path)
   
   from main import app as application
   ```

5. **Static files 설정**
   - URL: `/static/`
   - Directory: `/home/USERNAME/todolist/frontend/`

6. **Reload 후 접속**

---

## 🗄️ 데이터베이스 연동 (프로덕션 필수)

현재는 메모리에 데이터를 저장하므로 서버 재시작 시 데이터가 사라집니다. 프로덕션에서는 실제 데이터베이스를 사용하세요.

### 추천 옵션:

1. **PostgreSQL (Render/Railway 무료 제공)**
   ```bash
   pip install sqlalchemy psycopg2-binary
   ```

2. **MongoDB Atlas (무료 티어)**
   ```bash
   pip install motor pymongo
   ```

3. **SQLite (간단한 경우)**
   - 이미 Python에 포함됨
   - 파일 기반, 백업 필요

---

## 🔒 보안 체크리스트

배포 전 확인사항:

- [ ] CORS 설정을 특정 도메인으로 제한
- [ ] 환경 변수로 민감한 정보 관리
- [ ] HTTPS 사용
- [ ] Rate limiting 추가
- [ ] 입력 검증 강화
- [ ] SQL Injection 방지 (ORM 사용)
- [ ] XSS 방지 (이미 구현됨)

### main.py에서 CORS 수정:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # 실제 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 모니터링

배포 후 모니터링 도구:

1. **로그 확인**
   - Render: Dashboard → Logs
   - Railway: 프로젝트 → Logs
   - Docker: `docker logs`

2. **성능 모니터링**
   - New Relic
   - Datadog
   - Sentry (에러 추적)

3. **Uptime 모니터링**
   - UptimeRobot
   - Pingdom

---

## 🎯 추천 배포 플랫폼 비교

| 플랫폼 | 난이도 | 무료 티어 | 속도 | 추천 대상 |
|--------|--------|-----------|------|-----------|
| Render | ⭐ | ✅ (sleep) | 중간 | **초보자** |
| Railway | ⭐⭐ | ✅ ($5 크레딧) | 빠름 | 개발자 |
| Vercel | ⭐ | ✅ | 매우 빠름 | Serverless |
| Docker | ⭐⭐⭐ | - | 빠름 | 고급 사용자 |
| AWS EC2 | ⭐⭐⭐⭐ | ✅ (12개월) | 빠름 | 엔터프라이즈 |
| PythonAnywhere | ⭐⭐ | ✅ (제한) | 느림 | Python 학습 |

---

## 💡 빠른 시작 (가장 쉬운 방법)

### Render 배포 3단계:

```bash
# 1. Git 초기화 및 푸시
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/todolist.git
git push -u origin main

# 2. Render.com 접속하여 GitHub 연동

# 3. Web Service 생성 후 자동 배포 ✅
```

완료! 🎉

---

**도움이 필요하면 각 플랫폼의 공식 문서를 참고하세요.**

