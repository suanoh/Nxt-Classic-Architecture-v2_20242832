# ESG Insight Finder

기업명을 검색하면 Gemini API가 ESG 정보, 탄소 감축 목표, 최근 실적, 향후 전망, 계획 및 목표를 한국어로 요약해주는 AI 기반 ESG 분석 웹 애플리케이션입니다.

## 1. 프로젝트 개요

이 프로젝트는 수업에서 실습한 AI Note App 구조를 응용한 개인 과제입니다.  
기존 노트 생성 기능을 그대로 사용하지 않고, 기업 ESG 분석 리포트 생성 기능으로 변경했습니다.

사용자는 웹 화면에서 기업명을 입력하고, 백엔드 서버는 Gemini API를 호출하여 ESG 분석 결과를 생성합니다.  
클라이언트는 결과를 카드형 대시보드 형태로 보여줍니다.

## 2. 주요 기능

- 기업명 기반 ESG 리포트 생성
- ESG 개요 요약
- 탄소 감축 목표 요약
- 최근 실적 요약
- 향후 전망 요약
- 계획 및 목표 요약
- 최근 검색 기업명 저장
- Gemini API 오류 처리
- API Key를 `.env`로 분리 관리

## 3. 사용한 AWS 리소스

- Amazon S3  
  React 없이 HTML, CSS, JavaScript로 구성한 정적 클라이언트를 호스팅합니다.

- Amazon EC2  
  Node.js Express 백엔드 서버를 실행합니다.

- Security Group  
  SSH 접속과 웹/API 접속을 제어합니다.

- Gemini API  
  기업명 기반 ESG 분석 결과를 생성합니다.

## 4. 아키텍처

```txt
사용자 브라우저
    ↓
S3 정적 웹사이트 클라이언트
    ↓ HTTP 요청
EC2 Node.js Express 서버
    ↓
Gemini API
    ↓
ESG 분석 결과 반환
```

## 5. 로컬 실행 방법

### 5-1. 서버 실행

```bash
cd server
npm install
cp .env.example .env
```

`.env` 파일에 본인의 Gemini API Key를 입력합니다.

```env
GEMINI_API_KEY=본인의_Gemini_API_Key
PORT=3000
GEMINI_MODEL=gemini-2.5-flash
```

서버 실행:

```bash
npm start
```

서버 상태 확인:

```bash
curl http://localhost:3000/health
```

### 5-2. 클라이언트 실행

`client/app.js` 파일에서 아래 값을 서버 주소로 수정합니다.

```js
const API_BASE_URL = "http://localhost:3000";
```

로컬 테스트 시에는 `client/index.html` 파일을 브라우저로 열어 테스트할 수 있습니다.

## 6. AWS 배포 방법

### 6-1. EC2 서버 배포

1. EC2 인스턴스 생성
2. Security Group 인바운드 규칙 설정
   - SSH 22: 내 IP만 허용 권장
   - Custom TCP 3000: 테스트용으로 허용
3. EC2 접속
4. Node.js 설치
5. 프로젝트 업로드 또는 Git clone
6. 서버 실행

```bash
cd server
npm install
nano .env
npm start
```

백그라운드 실행이 필요한 경우:

```bash
npm install -g pm2
pm2 start server.js --name esg-api
pm2 save
```

### 6-2. S3 클라이언트 배포

1. S3 버킷 생성
2. 정적 웹사이트 호스팅 활성화
3. `client/index.html`, `client/style.css`, `client/app.js` 업로드
4. 퍼블릭 접근 정책 설정
5. S3 Website endpoint 접속

배포 전 `client/app.js`의 API 주소를 EC2 주소로 변경해야 합니다.

```js
const API_BASE_URL = "http://EC2_PUBLIC_IP:3000";
```

## 7. 테스트 방법

예시 기업명:

- Samsung Electronics
- Hyundai Motor
- Apple
- Microsoft
- Tesla

테스트 절차:

1. 클라이언트 주소 접속
2. 기업명 입력
3. `ESG 리포트 생성` 버튼 클릭
4. ESG 개요, 탄소 감축 목표, 최근 실적, 전망, 계획 및 목표가 표시되는지 확인

## 8. 보안 주의사항

- `.env` 파일은 GitHub에 업로드하지 않습니다.
- Gemini API Key를 코드에 직접 작성하지 않습니다.
- 실제 운영 계정, 비밀번호, API Key를 README에 작성하지 않습니다.
- 제출 전 `.gitignore`에 `.env`가 포함되어 있는지 확인합니다.

## 9. 제출 링크

- GitHub Repository: 제출 시 본인 GitHub 주소 입력
- Client URL: 제출 시 S3 정적 웹사이트 주소 입력
