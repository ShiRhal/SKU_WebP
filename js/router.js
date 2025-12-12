// js/router.js (모듈)

async function include(target, file) {
  try {
    const html = await fetch(file).then((res) => res.text());
    document.querySelector(target).innerHTML = html;
  } catch (e) {
    console.error("Include Error:", target, file);
  }
}

// 페이지 로더
async function loadPage(page) {
  try {
    const html = await fetch(`pages/${page}.html`).then((res) => res.text());
    document.getElementById("app").innerHTML = html;

    // 예전 방식: script 태그 append → 모듈은 한 번만 실행돼서 문제
    // 새 방식: 동적 import
    try {
      const module = await import(`./${page}.js`); // /js/router.js 기준 상대경로

      // 페이지 모듈이 initPage를 export하면 매번 호출
      if (module && typeof module.initPage === "function") {
        module.initPage();
      }
      // initPage 없으면, 그냥 import 시 side-effect만 실행하게 둠
    } catch (err) {
      console.info("No JS module for page or import failed:", page, err);
    }
  } catch (e) {
    console.error(e);
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
