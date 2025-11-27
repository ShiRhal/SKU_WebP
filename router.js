// HTML 파일 불러오기
async function loadHTML(path) {
  const res = await fetch(path);
  return await res.text();
}

// nav include
async function includeNav() {
  const nav = await loadHTML("/components/nav.html");
  document.getElementById("nav-root").innerHTML = nav;
}

// 라우트 테이블
const routes = {
  home: {
    html: "/pages/home.html",
    script: "/pages/home.js",
  },
  map: {
    html: "/pages/map.html",
    script: "/pages/map.js",
  },
  reserve: {
    html: "/pages/reserve.html",
    script: "/pages/reserve.js",
  },
  support: {
    html: "/pages/support.html",
    script: "/pages/support.js",
  },
};

// 라우터
async function router() {
  let hash = location.hash || "#/home";
  let page = hash.replace("#/", ""); // home, map, reserve...

  const route = routes[page];

  if (!route) {
    document.getElementById("app").innerHTML = "<h2>404 - 페이지 없음</h2>";
    return;
  }

  // HTML 로드
  const html = await loadHTML(route.html);
  document.getElementById("app").innerHTML = html;

  // JS 로드
  const script = document.createElement("script");
  script.src = route.script;
  script.defer = true;
  document.body.appendChild(script);
}

// 초기 실행
window.addEventListener("load", async () => {
  await includeNav();
  router();
});

// 해시 변경 시 실행
window.addEventListener("hashchange", router);
