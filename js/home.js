// Kakao 지도 생성 함수
function initMap() {
  const container = document.getElementById("map");
  if (!container) return;

  const options = {
    center: new kakao.maps.LatLng(37.379859, 126.928797), // 성결대
    level: 3,
  };

  const map = new kakao.maps.Map(container, options);

  // 예시 마커 (캠퍼스 중심)
  new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.379859, 126.928797),
    map: map,
  });
}

// 카카오 SDK 로딩 체크 후 생성
function waitForKakao() {
  if (window.kakao && window.kakao.maps) {
    initMap();
  } else {
    setTimeout(waitForKakao, 100);
  }
}

waitForKakao();
