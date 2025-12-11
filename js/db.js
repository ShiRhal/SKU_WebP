// js/db.js (Firestore Only)

import { fs } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --------------------
// BUILDINGS
// --------------------

// 전체 건물 목록
export async function getAllBuildings() {
  const snap = await getDocs(collection(fs, "buildings"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 특정 건물
export async function getBuilding(id) {
  const ref = doc(fs, "buildings", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 특정 건물의 하위 floors subcollection
export async function getFloors(buildingId) {
  const floorRef = collection(fs, "buildings", buildingId, "floors");
  const snap = await getDocs(floorRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --------------------
// FACILITIES
// --------------------

// 전체 편의시설
export async function getAllFacilities() {
  const snap = await getDocs(collection(fs, "facilities"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 카테고리로 필터
export async function getFacilitiesByCategory(category) {
  const q = query(
    collection(fs, "facilities"),
    where("category", "==", category)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 태그 array 검색
export async function getFacilitiesByTag(tag) {
  const q = query(
    collection(fs, "facilities"),
    where("tag", "array-contains", tag)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --------------------
// CAFE
// --------------------
export async function getAllCafeMenus() {
  const snap = await getDocs(collection(fs, "cafe"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --------------------
// DINER
// --------------------
export async function getAllDinerMenus() {
  const snap = await getDocs(collection(fs, "diner"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
