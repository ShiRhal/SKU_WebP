// 공통 include 함수
async function include(target, file) {
  try {
    const html = await fetch(file).then(res => res.text());
    document.querySelector(target).innerHTML = html;
  } catch (e) {
    console.error("Include Error:", target, file);
  }
}

// 페이지 로더
async function loadPage(page) {
  try {
    const html = await fetch(`pages/${page}.html`).then(res => res.text());
    document.getElementById("app").innerHTML = html;

    // 페이지별 JS 자동 실행
    const scriptPath = `js/${page}.js`;
    const exists = await fetch(scriptPath)
      .then(res => res.ok)
      .catch(() => false);

    if (exists) {
      const script = document.createElement("script");
      script.src = scriptPath;
      script.defer = true;
      document.body.appendChild(script);
    }

  } catch (e) {
    document.getElementById("app").innerHTML = "<h2>404 - Page Not Found</h2>";
  }
}

// 라우터
function router() {
  const page = location.hash.replace("#/", "") || "home";
  loadPage(page);
}

// 초기 실행
window.addEventListener("load", () => {
  include("#logo", "components/logo.html");
  include("#nav", "components/nav.html");

  router();
});

window.addEventListener("hashchange", router);
