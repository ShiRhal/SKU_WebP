import { getAllBuildings, getAllFacilities } from "./db.js";

let map = null;
let activeMarkers = [];
let activeTag = null;

/* Kakao SDK 로딩 */
function loadKakaoMapSDK() {
  return new Promise((resolve) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.onload = () => resolve();
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=9d380e76f7c8a8ea1b1f7bcc8ec2cde9&autoload=false";
    document.head.appendChild(script);
  });
}

/* 지도 초기화 */
function initMap() {
  const container = document.getElementById("map");
  map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.379859, 126.928797),
    level: 3,
  });
  // 지도 타입 컨트롤 (일반/위성)
  const mapTypeControl = new kakao.maps.MapTypeControl();

  // 지도 우측 상단에 추가
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
}

/* 마커 이미지 매핑 */
function getMarkerImage(tag) {
  const base =
    "https://raw.githubusercontent.com/ShiRhal/SKU_WebP/refs/heads/img/Markers/";

  const markerMap = {
    주차: "M_01_Parking.png",
    어린이집: "M_02_YuChiWon.png",
    "체육 시설": "M_03_CheYuk.png",
    도서관: "M_04_DoSuGwan.png",
    편의점: "M_05_MaeJum.png",
    복사: "M_06_InSoe.png",
    인쇄: "M_06_InSoe.png",
    학식당: "M_07_SikDang.png",
    카페: "M_08_Cafe.png",
    건물: "M_09_GunMul.png",
  };

  return base + (markerMap[tag] || "M_09_GunMul.png");
}

/* 태그 검색*/
async function findDataByTag(tag) {
  const results = [];
  const buildings = await getAllBuildings();
  const facilities = await getAllFacilities();

  buildings.forEach((b) => {
    if (b.tag?.includes(tag)) {
      results.push(b);
    }
  });

  facilities.forEach((f) => {
    if (f.tag?.includes(tag)) {
      results.push(f);
    }
  });

  return results;
}

/* 모든 InfoWindow 닫기*/
function closeAllInfoWindows() {
  activeMarkers.forEach((m) => {
    if (m.infoWindow) m.infoWindow.close();
  });
}

/* 마커 표시 */
function displayMarkers(list, markerImg) {
  clearMarkers();

  list.forEach((data) => {
    if (!data.latitude || !data.longitude) {
      return;
    }

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    const pos = new kakao.maps.LatLng(lat, lng);

    const marker = new kakao.maps.Marker({
      position: pos,
      image: new kakao.maps.MarkerImage(
        markerImg,
        new kakao.maps.Size(55, 55),
        { offset: new kakao.maps.Point(27, 55) }
      ),
      map,
    });

    activeMarkers.push(marker);

    /* InfoWindow HTML */
    const infoHtml = `
      <div class="infowindow-content" style="
        padding: 10px 14px;
        font-size: 16px;
        font-weight: 600;
        line-height: 1.4;
        background: white;
        border-radius: 10px;
        border: 2px solid #1f6feb;
        white-space: nowrap;
      ">
        ${data.name}<br />
        <span style="font-size: 14px; font-weight: 400;">
          ${data.location ? data.location : ""}
        </span>
      </div>
    `;

    const infoWindow = new kakao.maps.InfoWindow({
      content: infoHtml,
      removable: false,
    });

    marker.infoWindow = infoWindow;

    /* 마커 클릭 시 팝업 토글 */
    kakao.maps.event.addListener(marker, "click", () => {
      if (marker.infoWindowVisible) {
        marker.infoWindow.close();
        marker.infoWindowVisible = false;
      } else {
        closeAllInfoWindows();
        infoWindow.open(map, marker);
        marker.infoWindowVisible = true;
      }
    });
  });

  if (activeMarkers.length > 0) {
    map.panTo(activeMarkers[0].getPosition());
  }
}

/*  마커 제거*/
function clearMarkers() {
  closeAllInfoWindows();
  activeMarkers.forEach((m) => m.setMap(null));
  activeMarkers = [];
}

/* 버튼 이벤트 설정 */
function setupIndexButtons() {
  const buttons = document.querySelectorAll("#buildingIndex .index-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tag = btn.dataset.tag;

      /* 동일 버튼 → 토글 OFF */
      if (activeTag === tag) {
        activeTag = null;
        buttons.forEach((b) => b.classList.remove("active"));
        clearMarkers();
        return;
      }

      activeTag = tag;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const markerImg = getMarkerImage(tag);
      const found = await findDataByTag(tag);

      if (found.length === 0) {
        alert("해당하는 장소를 찾을 수 없습니다.");
        return;
      }

      displayMarkers(found, markerImg);
    });
  });
}

export async function initPage() {
  await loadKakaoMapSDK();
  kakao.maps.load(() => {
    initMap();
    setupIndexButtons();
  });
}
