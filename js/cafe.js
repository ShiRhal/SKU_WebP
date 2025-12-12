// js/cafe.js
import { fs } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allMenus = [];

// Firestore에서 카페 메뉴 읽기
async function loadCafeMenus() {
  const snap = await getDocs(collection(fs, "cafe"));
  allMenus = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderMenus("all");
}

// 메뉴 렌더링
function renderMenus(tag) {
  const container = document.getElementById("cafe-menu-container");
  container.innerHTML = "";

  let list = [];

  if (tag === "all") list = allMenus;
  else list = allMenus.filter((m) => m.tag === tag);

  list.forEach((menu) => {
    const card = document.createElement("div");
    card.className = "cafe-card";

    card.innerHTML = `
            <img src="${menu.img}" alt="${menu.name}">
            <div class="cafe-card-name">${menu.name}</div>
        `;

    container.appendChild(card);
  });
}

// 버튼 이벤트 연결
function setupCategoryButtons() {
  const buttons = document.querySelectorAll(".cat-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".cat-btn.active")?.classList.remove("active");
      btn.classList.add("active");
      renderMenus(btn.dataset.category);
    });
  });
}

// router.js가 호출하는 함수
export function initPage() {
  console.log("cafe.js initPage()");
  setupCategoryButtons();
  loadCafeMenus();
}

const categoryMap = {
  all: { en: "ALL", ko: "전체 메뉴" },
  coffee: { en: "COFFEE & LATTE", ko: "커피 & 라떼" },
  ade: { en: "ADE & ICED TEA", ko: "에이드 / 아이스티" },
  smoothie: { en: "SHAKE & SMOOTHIE", ko: "스무디 / 쉐이크" },
  tea: { en: "TEA", ko: "티" },
};

document.querySelectorAll(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".cat-btn.active")?.classList.remove("active");
    btn.classList.add("active");

    const cat = btn.dataset.category;
    document.getElementById("category-en").textContent = categoryMap[cat].en;
    document.getElementById("category-ko").textContent = categoryMap[cat].ko;
  });
});
