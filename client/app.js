const API_BASE_URL = "http://54.242.109.22:3000";

const form = document.querySelector("#searchForm");
const input = document.querySelector("#companyInput");
const loading = document.querySelector("#loading");
const errorBox = document.querySelector("#errorBox");
const result = document.querySelector("#result");
const apiStatus = document.querySelector("#apiStatus");
const recentSearches = document.querySelector("#recentSearches");

const fields = {
  companyName: document.querySelector("#companyName"),
  createdAt: document.querySelector("#createdAt"),
  esgOverview: document.querySelector("#esgOverview"),
  carbonTarget: document.querySelector("#carbonTarget"),
  performance: document.querySelector("#performance"),
  outlook: document.querySelector("#outlook"),
  plans: document.querySelector("#plans"),
  caution: document.querySelector("#caution")
};

function showLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function saveRecentSearch(company) {
  const previous = JSON.parse(localStorage.getItem("recentCompanies") || "[]");
  const next = [company, ...previous.filter((item) => item !== company)].slice(0, 5);
  localStorage.setItem("recentCompanies", JSON.stringify(next));
  renderRecentSearches();
}

function renderRecentSearches() {
  const items = JSON.parse(localStorage.getItem("recentCompanies") || "[]");
  recentSearches.textContent = items.length ? items.join(", ") : "없음";
}

function renderReport(payload) {
  const report = payload.report;
  fields.companyName.textContent = report.company || "기업명 없음";
  fields.createdAt.textContent = new Date(payload.createdAt).toLocaleString("ko-KR");
  fields.esgOverview.textContent = report.esgOverview || "내용 없음";
  fields.carbonTarget.textContent = report.carbonTarget || "내용 없음";
  fields.performance.textContent = report.performance || "내용 없음";
  fields.outlook.textContent = report.outlook || "내용 없음";
  fields.plans.textContent = report.plans || "내용 없음";
  fields.caution.textContent = report.caution || "AI 생성 결과이므로 공식 자료 확인이 필요합니다.";

  result.classList.remove("hidden");
}

async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error("API 서버 응답 오류");
    const data = await response.json();
    apiStatus.textContent = data.ok ? "정상 연결" : "연결 이상";
  } catch (error) {
    apiStatus.textContent = "연결 실패";
  }
}

async function requestReport(company) {
  clearError();
  result.classList.add("hidden");
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/esg-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ company })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || "리포트 생성 실패");
    }

    renderReport(data);
    saveRecentSearch(company);
  } catch (error) {
    showError(`오류: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const company = input.value.trim();

  if (!company) {
    showError("기업명을 입력해주세요.");
    return;
  }

  requestReport(company);
});

document.querySelectorAll(".sample-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const company = button.dataset.company;
    input.value = company;
    requestReport(company);
  });
});

renderRecentSearches();
checkApiStatus();
