// js/dbTest.js
import { db } from "./firebaseConfig.js";
import { readPath, getBuildings, getFacilities } from "./db.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const result = document.getElementById("result");

// Firebase 연결 확인
document.getElementById("checkConnection").addEventListener("click", async () => {
  try {
    // DB 루트('/')에서 최소한의 접근 시도
    const snap = await get(ref(db, "/"));
    result.textContent = snap.exists()
      ? "✔ Firebase 연결 성공 (DB 접근 가능)"
      : "⚠ Firebase 연결됨, 하지만 DB에 데이터 없음";
  } catch (e) {
    result.textContent = "❌ Firebase 연결 실패: " + e;
  }
});

// 건물 전체 읽기
document.getElementById("readBuildings").addEventListener("click", async () => {
  const data = await getBuildings();
  result.textContent = JSON.stringify(data, null, 2);
});

// 편의시설 전체 읽기
document.getElementById("readFacilities").addEventListener("click", async () => {
  const data = await getFacilities();
  result.textContent = JSON.stringify(data, null, 2);
});

// 특정 경로 읽기
document.getElementById("readPath").addEventListener("click", async () => {
  const path = document.getElementById("pathInput").value.trim();
  if (path === "") {
    result.textContent = "경로를 입력하세요.";
    return;
  }

  const data = await readPath(path);
  result.textContent = JSON.stringify(data, null, 2);
});
