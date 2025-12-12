import { fs } from "./firebaseConfig.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ==============================
   전역 상태
================================ */
const state = {
    facilities: [],
    buildings: [],              // ← 실제 사용되는 건물만
    selectedBuilding: null,
    selectedFilters: new Set(),
    searchTag: ""
};

/* ==============================
   초기 진입
================================ */
export async function initPage() {
    await loadData();
    renderBuildingCards();
    renderFilterButtons();
    renderFacilityCards();
}

initPage();

/* ==============================
   데이터 로드
================================ */
async function loadData() {
    const [facilitySnap, buildingSnap] = await Promise.all([
        getDocs(collection(fs, "facilities")),
        getDocs(collection(fs, "buildings"))
    ]);

    // 1) facilities 전체
    state.facilities = facilitySnap.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));

    // 2) facilities에 실제로 존재하는 B_ref만 추출
    const usedBuildingIds = new Set(
        state.facilities
            .map(f => f.B_ref)
            .filter(Boolean)
    );

    // 3) buildings 중에서 사용되는 것만
    state.buildings = buildingSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => usedBuildingIds.has(b.id))
        .sort((a, b) => a.id.localeCompare(b.id));
}

/* ==============================
   건물 카드 (토글)
================================ */
function renderBuildingCards() {
    const el = document.getElementById("buildingCardList");

    el.innerHTML = state.buildings.map(b => `
    <div class="building-card ${state.selectedBuilding === b.id ? "active" : ""}"
         data-id="${b.id}">
      <div class="building-card-image">
        ${b.image_url
            ? `<img src="${b.image_url}">`
            : `<div class="no-image">이미지 없음</div>`}
      </div>
      <div class="building-card-body">
        <h3>${b.name}</h3>
      </div>
    </div>
  `).join("");

    el.querySelectorAll(".building-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.dataset.id;
            state.selectedBuilding =
                state.selectedBuilding === id ? null : id;

            renderBuildingCards();
            renderFacilityCards();
        });
    });
}

/* ==============================
   필터 버튼
================================ */
const FILTERS = [
    "휴식 공간",
    "학업 시설",
    "식음 시설",
    "복사",
    "체육 시설",
    "기타 시설",
    "주차"
];

function renderFilterButtons() {
    const el = document.getElementById("facilityFilterButtons");

    el.innerHTML = FILTERS.map(f => `
    <button class="${state.selectedFilters.has(f) ? "active" : ""}">
      ${f}
    </button>
  `).join("");

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

/* ==============================
   태그 검색
================================ */
const searchInput = document.getElementById("tagSearchInput");
if (searchInput) {
    searchInput.addEventListener("input", e => {
        state.searchTag = e.target.value.trim();
        renderFacilityCards();
    });
}

/* ==============================
   결과 카드 렌더링
================================ */
function renderFacilityCards() {
    const el = document.getElementById("facilityCardGrid");

    const filtered = state.facilities.filter(f => {
        // 건물 필터
        if (state.selectedBuilding && f.B_ref !== state.selectedBuilding) {
            return false;
        }

        // 필터 버튼(휴식 공간/학업 시설/...) => tag 배열에서 매칭
        if (state.selectedFilters.size > 0) {
            const tags = (f.tag || []).map(t => String(t).trim());
            const ok = [...state.selectedFilters].some(filter => tags.includes(filter));
            if (!ok) return false;
        }

        // 태그 검색 (방어 처리 포함)
        if (state.searchTag) {
            const keyword = state.searchTag.replace(/\s+/g, "").toLowerCase();

            const match = (f.tag || []).some(t =>
                t.replace(/\s+/g, "").toLowerCase().includes(keyword)
            );

            if (!match) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        el.innerHTML = "<p>조건에 맞는 편의시설이 없습니다.</p>";
        return;
    }

    el.innerHTML = filtered.map(f => `
    <div class="facility-card">
      <div class="facility-image">
        ${f.image_url
            ? `<img src="${f.image_url}">`
            : `<div class="no-image">이미지 없음</div>`}
      </div>

      <div class="facility-body">
        <h3>${f.name}</h3>
        <p class="facility-location">${f.location}</p>
        <p class="facility-desc">${f.description}</p>

        <div class="tag-list">
          ${(f.tag || []).map(t => `<span class="tag-chip">#${t}</span>`).join("")}
        </div>
      </div>
    </div>
  `).join("");
}
