// js/db.js (READ-ONLY VERSION)

import { db } from "./firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 전체 건물 리스트 가져오기
export async function getBuildings() {
  const snapshot = await get(ref(db, "buildings"));
  return snapshot.exists() ? snapshot.val() : null;
}

// 전체 편의시설 리스트 가져오기
export async function getFacilities() {
  const snapshot = await get(ref(db, "facilities"));
  return snapshot.exists() ? snapshot.val() : null;
}

// 특정 경로 읽기 (범용 함수) — 나중에 특정 건물만 가져올 때 사용
export async function readPath(path) {
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? snapshot.val() : null;
}
