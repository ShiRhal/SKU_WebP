import { fs } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* 전역 상태*/
const state = {
  facilities: [],
  buildings: [],
  selectedBuilding: null,
  selectedFilters: new Set(),
  searchTag: "",
};

/* 초기 진입 */
export async function initPage() {
  await loadData();
  renderBuildingCards();
  renderFilterButtons();
  renderFacilityCards();
}

initPage();

/* 데이터 로드 */
async function loadData() {
  const [facilitySnap, buildingSnap] = await Promise.all([
    getDocs(collection(fs, "facilities")),
    getDocs(collection(fs, "buildings")),
  ]);

  state.facilities = facilitySnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const usedBuildingIds = new Set(
    state.facilities.map((f) => f.B_ref).filter(Boolean)
  );

  state.buildings = buildingSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) => usedBuildingIds.has(b.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/*  건물 카드 (토글) */
function renderBuildingCards() {
  const el = document.getElementById("buildingCardList");

  el.innerHTML = state.buildings
    .map(
      (b) => `
        <div class="building-card ${
          state.selectedBuilding === b.id ? "active" : ""
        }"
             data-id="${b.id}">
          <div class="building-card-image">
            ${
              b.image_url
                ? `<img src="${b.image_url}">`
                : `<div class="no-image">이미지 없음</div>`
            }
          </div>
          <div class="building-card-body">
            <h3>${b.name}</h3>
          </div>
        </div>
    `
    )
    .join("");

  el.querySelectorAll(".building-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      state.selectedBuilding = state.selectedBuilding === id ? null : id;

      renderBuildingCards();
      renderFacilityCards();
    });
  });
}

/* 필터 버튼 */
const FILTERS = [
  "휴식 공간",
  "학업 시설",
  "식음 시설",
  "복사",
  "체육 시설",
  "기타 시설",
  "주차",
];

function renderFilterButtons() {
  const el = document.getElementById("facilityFilterButtons");

  el.innerHTML = FILTERS.map(
    (f) => `
        <button class="${state.selectedFilters.has(f) ? "active" : ""}">
          ${f}
        </button>
    `
  ).join("");

  [...el.children].forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const key = FILTERS[i];
      state.selectedFilters.has(key)
        ? state.selectedFilters.delete(key)
        : state.selectedFilters.add(key);

      renderFilterButtons();
      renderFacilityCards();
    });
  });
}

/* 태그 검색*/
const searchInput = document.getElementById("tagSearchInput");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    state.searchTag = e.target.value.trim();
    renderFacilityCards();
  });
}

/* 결과 카드 */
function renderFacilityCards() {
  const gridEl = document.getElementById("facilityCardGrid");
  const infoEl = document.getElementById("facilityResultInfo");

  const filtered = state.facilities.filter((f) => {
    if (state.selectedBuilding && f.B_ref !== state.selectedBuilding) {
      return false;
    }

    if (state.selectedFilters.size > 0) {
      const tags = (f.tag || []).map((t) => String(t).trim());
      const ok = [...state.selectedFilters].some((filter) =>
        tags.includes(filter)
      );
      if (!ok) return false;
    }

    if (state.searchTag) {
      const keyword = state.searchTag.replace(/\s+/g, "").toLowerCase();
      const match = (f.tag || []).some((t) =>
        t.replace(/\s+/g, "").toLowerCase().includes(keyword)
      );
      if (!match) return false;
    }

    return true;
  });

  /* 결과 요약 문구 */
  const conditions = [];

  if (state.selectedBuilding) {
    const b = state.buildings.find((b) => b.id === state.selectedBuilding);
    if (b) conditions.push(b.name);
  }

  if (state.selectedFilters.size > 0) {
    conditions.push([...state.selectedFilters].join(", "));
  }

  if (state.searchTag) {
    conditions.push(`'${state.searchTag}'`);
  }

  if (filtered.length === 0) {
    infoEl.textContent = "조건에 맞는 편의시설이 없습니다.";
    gridEl.innerHTML = "<p>조건을 변경해 다시 시도해보세요.</p>";
    return;
  }

  const conditionText =
    conditions.length > 0 ? `${conditions.join(" · ")} 기준 ` : "";

  infoEl.textContent = `${conditionText}${filtered.length}개의 편의시설`;

  /* 카드 렌더링 */
  gridEl.innerHTML = filtered
    .map(
      (f) => `
        <div class="facility-card">
          <div class="facility-image">
            ${
              f.image_url
                ? `<img src="${f.image_url}">`
                : `<div class="no-image">이미지 없음</div>`
            }
          </div>

          <div class="facility-body">
            <h3>${f.name}</h3>
            <p class="facility-location">${f.location}</p>
            <p class="facility-desc">${f.description}</p>

            <div class="tag-list">
              ${(f.tag || [])
                .map((t) => `<span class="tag-chip">#${t}</span>`)
                .join("")}
            </div>
          </div>
        </div>
    `
    )
    .join("");
}
