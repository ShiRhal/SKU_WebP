import { fs } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initPage() {
  const $ = (id) => document.getElementById(id);
  const output = $("result");

  const print = (data) => {
    output.textContent =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
  };

  // -----------------------------------------------------
  // ① 전체 건물 조회 (image_url 포함)
  // -----------------------------------------------------
  $("readBuildings").addEventListener("click", async () => {
    try {
      const snap = await getDocs(collection(fs, "buildings"));

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      print(list);
    } catch (err) {
      print("건물 조회 오류: " + err);
    }
  });

  // -----------------------------------------------------
  // ② 특정 건물의 floors 조회 (필드 없음 → ID만 반환)
  // -----------------------------------------------------
  $("readFloors").addEventListener("click", async () => {
    const bId = $("buildingIdInput").value.trim();
    if (!bId) return print("건물 ID 입력 (예: B_01)");

    try {
      const snap = await getDocs(collection(fs, "buildings", bId, "floors"));

      if (snap.empty) return print("층 데이터 없음");

      const floors = snap.docs.map((f) => ({
        id: f.id,
      }));

      print(floors);
    } catch (err) {
      print("floors 조회 오류: " + err);
    }
  });

  // -----------------------------------------------------
  // ③ 특정 층의 Room 조회 (name, location)
  // -----------------------------------------------------
  $("readRooms").addEventListener("click", async () => {
    const bId = $("buildingIdInput").value.trim();
    const fId = $("floorIdInput").value.trim();

    if (!bId || !fId) return print("건물 ID(B_01), 층 ID(F0) 모두 입력");

    try {
      const snap = await getDocs(
        collection(fs, "buildings", bId, "floors", fId, "Room")
      );

      if (snap.empty) return print("Room 데이터 없음");

      const rooms = snap.docs.map((r) => ({
        id: r.id,
        ...r.data(),
      }));

      print(rooms);
    } catch (err) {
      print("Room 조회 오류: " + err);
    }
  });

  // -----------------------------------------------------
  // ④ 전체 편의시설 조회
  // -----------------------------------------------------
  $("readFacilities").addEventListener("click", async () => {
    try {
      const snap = await getDocs(collection(fs, "facilities"));

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      print(list);
    } catch (err) {
      print("편의시설 조회 오류: " + err);
    }
  });

  // -----------------------------------------------------
  // ⑤ tag 검색 (array-contains)
  // -----------------------------------------------------
  $("searchTag").addEventListener("click", async () => {
    const keyword = $("tagInput").value.trim();
    const target = $("tagTarget").value; // buildings or facilities

    if (!keyword) return print("검색할 태그 입력");

    try {
      const q = query(
        collection(fs, target),
        where("tag", "array-contains", keyword)
      );

      const snap = await getDocs(q);

      const result = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (result.length === 0) return print("해당 태그 문서 없음");

      print(result);
    } catch (err) {
      print("tag 검색 오류: " + err);
    }
  });

  // -----------------------------------------------------
  // ⑥ tag → latitude / longitude 출력 테스트
  // -----------------------------------------------------
  $("testLatLngBtn").addEventListener("click", async () => {
    const keyword = $("testLatLngTag").value.trim();
    if (!keyword) return print("태그 입력 필요!");

    print("검색 중...");

    try {
      // 1) buildings 검색
      const q1 = query(
        collection(fs, "buildings"),
        where("tag", "array-contains", keyword)
      );
      const bSnap = await getDocs(q1);

      if (!bSnap.empty) {
        const list = bSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          latitude: d.data().latitude,
          longitude: d.data().longitude,
        }));
        print(list);
        return; // buildings에서 찾으면 종료
      }

      // 2) facilities 검색
      const q2 = query(
        collection(fs, "facilities"),
        where("tag", "array-contains", keyword)
      );
      const fSnap = await getDocs(q2);

      if (!fSnap.empty) {
        const list = fSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          latitude: d.data().latitude,
          longitude: d.data().longitude,
        }));
        print(list);
        return;
      }

      print("해당 태그로 등록된 위도/경도 문서 없음");
    } catch (err) {
      print("좌표 테스트 오류: " + err);
    }
  });
}
