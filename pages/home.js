// 네비게이션 바의 실제 가로 너비(%수치)
const navWidth = 36;

// home.html 안의 #map 요소 가져오기
const mapRef = document.getElementById("map");

// 네비게이션을 피해서 오른쪽에 배치(지금 36%에 위치)
mapRef.style.marginLeft = `${navWidth}%`;

// 지도 높이(세로)
mapRef.style.height = "500px";

// 지도 가로 폭 설정 (반응형)
// 80vw = 화면 가로의 80%
// 가로가 너무 길거나 짧아지는 걸 방지하기 위해 max, min 설정
mapRef.style.width = "80vw";
mapRef.style.maxWidth = "800px";
mapRef.style.minWidth = "800px";

// =========================
//  지도 생성 함수
// =========================
function drawMap() {
  if (!window.kakao) return; // SDK가 아직 로드되지 않은 경우 방지

  // 지도 중심 좌표 (성결관)
  const position = new kakao.maps.LatLng(37.379859, 126.928797);

  // 지도 생성
  const map = new kakao.maps.Map(mapRef, {
    center: position,
    level: 3, // 확대 레벨(작을수록 확대)
  });

  // 마커 생성(이거 아마 마커 종류 변경가능할거임)
  new kakao.maps.Marker({ position }).setMap(map);

  // 지도 타입(지도/스카이뷰) 컨트롤 추가
  const mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  // 줌 컨트롤 추가
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

// =========================
//  Kakao SDK가 로드될 때까지 반복 체크
// =========================
let tryCount = 0;
const timer = setInterval(() => {
  // 카카오 객체가 로드되면 지도 생성
  if (window.kakao) {
    drawMap();
    clearInterval(timer);
  }

  // 안전장치: 15번(= 약 3초) 시도 후 포기
  tryCount++;
  if (tryCount > 15) clearInterval(timer);
}, 200);
