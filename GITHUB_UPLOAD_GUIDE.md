# 🚀 GitHub에 코드 올리기 - 완벽 가이드

이 가이드를 따라하시면 TodoList 프로젝트를 GitHub에 업로드할 수 있습니다.

---

## 📋 사전 준비

### 1. GitHub 계정 확인
- GitHub 계정이 없다면: https://github.com/join 에서 가입
- 이미 있다면 https://github.com 에 로그인

### 2. Git 설치 확인
터미널에서 다음 명령어로 Git이 설치되어 있는지 확인:
```bash
git --version
```

설치되어 있지 않다면:
- **macOS**: `brew install git` 또는 Xcode Command Line Tools
- **Windows**: https://git-scm.com/download/win
- **Linux**: `sudo apt-get install git`

---

## 🌟 방법 1: 터미널에서 업로드 (추천)

### 1단계: GitHub에서 새 저장소 생성

1. https://github.com 로그인
2. 오른쪽 상단 **"+"** 클릭 → **"New repository"**
3. 다음 정보 입력:
   - **Repository name**: `todolist`
   - **Description**: `TodoList 애플리케이션 - FastAPI, HTML, CSS, JavaScript`
   - **Public** (공개) 또는 **Private** (비공개) 선택
   - ⚠️ **"Add a README file" 체크 해제** (이미 README가 있음)
   - ⚠️ **".gitignore" 선택 안 함** (이미 있음)
4. **"Create repository"** 클릭

저장소가 생성되면 URL을 복사하세요:
```
https://github.com/YOUR_USERNAME/todolist.git
```

### 2단계: Git 사용자 정보 설정 (처음 한 번만)

터미널을 열고 다음 명령어를 실행하세요:

```bash
# Git 사용자 이름 설정 (GitHub 사용자명)
git config --global user.name "Your Name"

# Git 이메일 설정 (GitHub 가입 이메일)
git config --global user.email "your.email@example.com"

# 설정 확인
git config --global user.name
git config --global user.email
```

### 3단계: 프로젝트 디렉토리로 이동

```bash
cd /Users/nkpark/Documents/Cursor/todolist
```

### 4단계: Git 저장소 초기화

```bash
# Git 저장소 초기화
git init

# 현재 상태 확인
git status
```

### 5단계: 파일 추가

```bash
# 모든 파일을 스테이징 영역에 추가
git add .

# 추가된 파일 확인
git status
```

### 6단계: 첫 커밋

```bash
# 커밋 (변경사항을 기록)
git commit -m "Initial commit: TodoList 애플리케이션 구현"

# 커밋 확인
git log --oneline
```

### 7단계: 기본 브랜치 이름 설정

```bash
# 브랜치 이름을 main으로 설정
git branch -M main
```

### 8단계: 원격 저장소(GitHub) 연결

**⚠️ 여기서 YOUR_USERNAME을 실제 GitHub 사용자명으로 변경하세요!**

```bash
# GitHub 저장소와 연결
git remote add origin https://github.com/YOUR_USERNAME/todolist.git

# 원격 저장소 확인
git remote -v
```

### 9단계: GitHub에 푸시 (업로드)

```bash
# GitHub에 푸시
git push -u origin main
```

**처음 푸시할 때 GitHub 로그인 요구될 수 있습니다:**
- **Username**: GitHub 사용자명 입력
- **Password**: 
  - ⚠️ GitHub 비밀번호가 아닌 **Personal Access Token** 사용
  - Token 생성: https://github.com/settings/tokens
    1. "Generate new token" → "Generate new token (classic)"
    2. Note: `todolist` 입력
    3. Expiration: 원하는 기간 선택
    4. Scopes: `repo` 체크
    5. "Generate token" 클릭
    6. 생성된 토큰 복사 (⚠️ 한 번만 보임, 저장 필수!)
  - 터미널에서 Password 입력 시 토큰 붙여넣기

### 10단계: 완료! 🎉

GitHub 저장소 페이지를 새로고침하면 모든 파일이 업로드된 것을 볼 수 있습니다!

```
https://github.com/YOUR_USERNAME/todolist
```

---

## 🌟 방법 2: GitHub Desktop 사용 (GUI)

GUI를 선호하신다면 GitHub Desktop을 사용할 수 있습니다.

### 1단계: GitHub Desktop 설치
- https://desktop.github.com 에서 다운로드 및 설치
- GitHub 계정으로 로그인

### 2단계: 저장소 추가
1. **File** → **Add local repository**
2. 프로젝트 폴더 선택: `/Users/nkpark/Documents/Cursor/todolist`
3. "create a repository" 클릭

### 3단계: 커밋
1. 왼쪽에서 모든 파일 선택
2. 하단 "Summary" 입력: `Initial commit: TodoList 애플리케이션`
3. **"Commit to main"** 클릭

### 4단계: GitHub에 Publish
1. 상단 **"Publish repository"** 클릭
2. Repository name: `todolist`
3. Description 입력 (선택)
4. Private/Public 선택
5. **"Publish repository"** 클릭

완료! 🎉

---

## 🌟 방법 3: VS Code에서 업로드

VS Code를 사용 중이라면 내장 Git 기능을 사용할 수 있습니다.

### 1단계: Source Control 열기
- 왼쪽 사이드바에서 **Source Control** 아이콘 클릭 (세 번째)
- 또는 `Cmd+Shift+G` (macOS) / `Ctrl+Shift+G` (Windows)

### 2단계: 저장소 초기화
- **"Initialize Repository"** 클릭

### 3단계: 파일 스테이징
- "Changes" 옆 **+** 버튼 클릭 (모든 파일 스테이징)

### 4단계: 커밋
- 상단 텍스트 박스에 커밋 메시지 입력:
  ```
  Initial commit: TodoList 애플리케이션 구현
  ```
- **"Commit"** 버튼 클릭 (✓ 아이콘)

### 5단계: GitHub에 Publish
- 상단 **"Publish Branch"** 클릭
- GitHub 로그인 (처음만)
- Repository name: `todolist`
- Private/Public 선택
- **"Publish"** 클릭

완료! 🎉

---

## 📝 이후 변경사항 업데이트 방법

코드를 수정한 후 GitHub에 업데이트하려면:

### 터미널 사용:
```bash
# 변경된 파일 확인
git status

# 모든 변경사항 스테이징
git add .

# 커밋
git commit -m "업데이트 내용 설명"

# GitHub에 푸시
git push
```

### GitHub Desktop:
1. 변경된 파일이 자동으로 표시됨
2. Summary 입력
3. "Commit to main" 클릭
4. 상단 "Push origin" 클릭

### VS Code:
1. Source Control에서 변경사항 확인
2. "+" 버튼으로 스테이징
3. 커밋 메시지 입력 후 Commit
4. 상단 "..." → "Push" 클릭

---

## 🔧 자주 발생하는 문제 해결

### 1. "failed to push some refs" 오류
원인: 원격 저장소에 로컬에 없는 변경사항이 있음

해결:
```bash
git pull origin main --rebase
git push -u origin main
```

### 2. "remote origin already exists" 오류
원인: 이미 원격 저장소가 연결되어 있음

해결:
```bash
# 기존 원격 저장소 제거
git remote remove origin

# 다시 추가
git remote add origin https://github.com/YOUR_USERNAME/todolist.git
```

### 3. 인증 실패
해결:
- Personal Access Token 사용 (위 9단계 참고)
- 또는 SSH 키 설정: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### 4. ".git already exists" 오류
원인: 이미 Git 저장소가 초기화되어 있음

해결:
```bash
# 그냥 다음 단계(파일 추가)로 진행
git add .
git commit -m "Initial commit"
```

### 5. 대용량 파일 업로드 실패
원인: GitHub는 100MB 이상 파일 제한

해결:
```bash
# .gitignore에 대용량 파일 추가
echo "large-file.zip" >> .gitignore
git rm --cached large-file.zip
git commit -m "Remove large file"
```

---

## 📚 유용한 Git 명령어

```bash
# 현재 상태 확인
git status

# 커밋 히스토리 보기
git log
git log --oneline
git log --graph --oneline --all

# 변경사항 확인
git diff

# 특정 파일만 추가
git add filename.py

# 마지막 커밋 메시지 수정
git commit --amend -m "새로운 메시지"

# 원격 저장소 정보 확인
git remote -v

# 브랜치 목록
git branch

# 새 브랜치 생성 및 전환
git checkout -b feature-branch

# 파일 삭제 (Git에서도 삭제)
git rm filename.py
git commit -m "Delete filename.py"

# 파일 이름 변경
git mv oldname.py newname.py
git commit -m "Rename file"
```

---

## 🎯 빠른 참조 - 전체 명령어 요약

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/nkpark/Documents/Cursor/todolist

# 2. Git 초기화
git init

# 3. 모든 파일 추가
git add .

# 4. 커밋
git commit -m "Initial commit: TodoList 애플리케이션"

# 5. 브랜치 이름 설정
git branch -M main

# 6. GitHub 저장소 연결 (YOUR_USERNAME 변경 필수!)
git remote add origin https://github.com/YOUR_USERNAME/todolist.git

# 7. GitHub에 푸시
git push -u origin main
```

---

## 🌐 GitHub Pages로 웹 호스팅 (보너스)

정적 파일(HTML, CSS, JS)을 GitHub Pages로 무료 호스팅할 수 있습니다!

### 방법:
1. GitHub 저장소 페이지에서 **Settings** 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. Source: **Deploy from a branch**
4. Branch: **main** 선택, 폴더: **/ (root)** 선택
5. **Save** 클릭

**주의:** FastAPI 백엔드는 GitHub Pages에서 실행 안 됨. 프론트엔드만 호스팅 가능.
백엔드는 Render, Railway 등에 별도 배포 필요.

---

## 💡 추가 리소스

- **Git 공식 문서**: https://git-scm.com/doc
- **GitHub 가이드**: https://docs.github.com/en
- **Git 시각화 학습**: https://learngitbranching.js.org/
- **Git 치트시트**: https://education.github.com/git-cheat-sheet-education.pdf

---

**도움이 필요하면 언제든 물어보세요! 🚀**

