import { fs } from "./firebaseConfig.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


async function initCampusPage() {

    const indexBoxEl = document.getElementById("buildingIndex");
    const cardListEl = document.getElementById("buildingCardList");
    const detailBoxEl = document.getElementById("buildingDetailBox");
    const floorContainerEl = document.getElementById("floorRoomContainer");

    detailBoxEl.innerHTML = "<p>건물을 선택하면 이미지가 표시됩니다.</p>";

    try {
        // ================================
        // 1) 건물 전체 로드 + ID 정렬
        // ================================
        const snap = await getDocs(collection(fs, "buildings"));
        let buildings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        buildings.sort((a, b) => a.id.localeCompare(b.id));

        // 색인에는 B_09까지만
        const indexBuildings = buildings.filter(b => {
            const num = Number(b.id.substring(2));
            return num <= 9;
        });

        // ================================
        // 2) 색인표 렌더링 (번호 + 이름)
        // ================================
        indexBoxEl.innerHTML = indexBuildings
            .map(b => {
                const num = Number(b.id.substring(2));
                return `<button data-id="${b.id}">${num}. ${b.name}</button>`;
            })
            .join("");

        const indexButtons = [...indexBoxEl.querySelectorAll("button")];

        const setActiveIndex = (id) => {
            indexButtons.forEach(btn =>
                btn.classList.toggle("active", btn.dataset.id === id)
            );
        };

        // ================================
        // 3) 카드 목록 렌더링 (전체 건물)
        // ================================
        cardListEl.innerHTML = buildings
            .map(b => {
                const imgHtml = b.image_url
                    ? `<img src="${b.image_url}">`
                    : `<div class="no-image">이미지 없음</div>`;
                return `
          <div class="building-card" data-id="${b.id}">
            <div class="building-card-image">${imgHtml}</div>
            <div class="building-card-body">
              <h3>${b.name}</h3>
            </div>
          </div>`;
            })
            .join("");

        const cardEls = [...cardListEl.querySelectorAll(".building-card")];

        const setActiveCard = (id) => {
            cardEls.forEach(card =>
                card.classList.toggle("active", card.dataset.id === id)
            );
        };

        // ================================
        // 4) 상세 패널 출력
        // ================================
        function renderDetail(building) {
            const tagHtml = (building.tag || [])
                .map(t => `<span class="tag-chip">#${t}</span>`)
                .join("");

            const imgHtml = building.image_url
                ? `<img src="${building.image_url}">`
                : `<div class="no-image">이미지 없음</div>`;

            detailBoxEl.innerHTML = `
        <div class="building-detail-content">
          <div class="building-detail-image">${imgHtml}</div>
          <div class="building-detail-text">
            <h2>${building.name}</h2>
            <div class="tag-list">${tagHtml}</div>
          </div>
        </div>`;
        }

        // ================================
        // 5) 층 ID → 표시 텍스트
        // ================================
        function floorLabel(fId) {
            if (fId === "F0") return "지하 1층";

            const num = parseInt(fId.replace("F", "").replace("_", ""), 10);
            return Number.isNaN(num) ? fId : `${num}층`;
        }

        // ================================
        // 6) 층 + Room 렌더링
        // ================================
        async function renderFloors(buildingId) {
            floorContainerEl.innerHTML = "<p>층 정보를 불러오는 중...</p>";

            const floorsSnap = await getDocs(
                collection(fs, "buildings", buildingId, "floors")
            );

            if (floorsSnap.empty) {
                floorContainerEl.innerHTML = "<p>층 정보 없음</p>";
                return;
            }

            // 🔥 숫자 기준 정렬 (핵심 수정)
            const sortedFloors = floorsSnap.docs.sort((a, b) => {
                const aNum = parseInt(a.id.replace("F", "").replace("_", ""), 10);
                const bNum = parseInt(b.id.replace("F", "").replace("_", ""), 10);
                return aNum - bNum;
            });

            const floors = [];

            for (const f of sortedFloors) {
                const roomsSnap = await getDocs(
                    collection(fs, "buildings", buildingId, "floors", f.id, "Room")
                );

                const rooms = roomsSnap.docs.map(r => ({
                    id: r.id,
                    ...r.data()
                }));

                floors.push({ floorId: f.id, rooms });
            }

            // 렌더링
            floorContainerEl.innerHTML = floors
                .map(({ floorId, rooms }) => {
                    const rows = rooms
                        .map(r => `
              <tr>
                <td>${r.name || ""}</td>
                <td>${r.locate || ""}</td>
              </tr>
            `)
                        .join("");

                    return `
            <div class="floor-block">
              <div class="floor-title">${floorLabel(floorId)}</div>
              <table class="room-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>위치</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `;
                })
                .join("");
        }

        // ================================
        // 7) 공통 선택 함수
        // ================================
        async function selectBuilding(id) {
            const b = buildings.find(x => x.id === id);
            if (!b) return;

            setActiveIndex(id);
            setActiveCard(id);
            renderDetail(b);
            await renderFloors(id);

            // 카드 가로 스크롤 포커싱
            const card = cardEls.find(c => c.dataset.id === id);
            if (card) {
                const container = cardListEl;

                const cardLeft = card.offsetLeft;
                const cardWidth = card.offsetWidth;
                const containerWidth = container.clientWidth;

                const scrollPos =
                    cardLeft - (containerWidth / 2) + (cardWidth / 2);

                container.scrollTo({
                    left: scrollPos,
                    behavior: "smooth"
                });
            }
        }

        // ================================
        // 이벤트 바인딩
        // ================================
        indexButtons.forEach(btn => {
            btn.addEventListener("click", () => selectBuilding(btn.dataset.id));
        });

        cardEls.forEach(card => {
            card.addEventListener("click", () => selectBuilding(card.dataset.id));
        });

    } catch (err) {
        console.error(err);
        detailBoxEl.innerHTML = "<p>데이터 로딩 오류</p>";
    }
}

export function initPage() {
    initCampusPage();
}

initCampusPage();
