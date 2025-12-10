// js/home.js
let map = null;

// Kakao SDK 동적 로딩
function loadKakaoMapSDK() {
  return new Promise((resolve) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.onload = () => resolve();
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=9d380e76f7c8a8ea1b1f7bcc8ec2cde9&autoload=false";
    document.head.appendChild(script);
  });
}

// 지도 초기화
function initMap() {
  const container = document.getElementById("map");
  if (!container) return;

  const options = {
    center: new kakao.maps.LatLng(37.379859, 126.928797),
    level: 3,
  };

  map = new kakao.maps.Map(container, options);

  new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.379859, 126.928797),
    map: map,
  });

  setTimeout(() => {
    kakao.maps.event.trigger(map, "resize");
    map.setCenter(new kakao.maps.LatLng(37.379859, 126.928797));
  }, 200);
}

// 🔹 router.js에서 매번 호출할 엔트리 함수
export async function initPage() {
  await loadKakaoMapSDK();
  kakao.maps.load(() => {
    initMap();
  });
}

// ⛔ 이 줄은 삭제해야 함!
// initHomePage();
