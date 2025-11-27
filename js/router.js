// 공통 HTML 조각 불러오기
async function include(target, file) {
  try {
    const html = await fetch(file).then(res => res.text());
    document.querySelector(target).innerHTML = html;
  } catch (e) {
    console.error("Include Error:", file);
  }
}

// 페이지 로드 함수
async function loadPage(page) {
  try {
    const html = await fetch(`pages/${page}.html`).then(res => res.text());
    document.getElementById("app").innerHTML = html;
  } catch (e) {
    document.getElementById("app").innerHTML = "<h2>404 - Page Not Found</h2>";
  }
}

// 라우터
function router() {
  const hash = location.hash.replace("#/", "") || "home";
  loadPage(hash);
}

// 초기 로드
window.addEventListener("load", () => {
  include("#header", "components/header.html");
  include("#nav", "components/nav.html");
  include("#footer", "components/footer.html");
  router();
});

// hash 변경되면 페이지 바뀜
window.addEventListener("hashchange", router);
