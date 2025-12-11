import { fs } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// router.js에서 호출하는 엔트리
export function initPage() {
  const $ = (id) => document.getElementById(id);
  const output = $("result");

  // ---------------------
  // ① Firestore 연결 확인
  // ---------------------
  $("checkConnection").addEventListener("click", async () => {
    try {
      // buildings 컬렉션에 간단히 접근해보는 용도
      await getDocs(collection(fs, "buildings"));
      output.textContent = "✔ Firestore 연결 성공!";
    } catch (e) {
      output.textContent = "❌ Firestore 연결 실패: " + e;
    }
  });

  // ---------------------
  // ② 건물 전체 읽기
  // ---------------------
  $("readBuildings").addEventListener("click", async () => {
    try {
      const snap = await getDocs(collection(fs, "buildings"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      output.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      output.textContent = "건물 읽기 오류: " + e;
    }
  });

  // ---------------------
  // ③ 편의시설 전체 읽기
  // ---------------------
  $("readFacilities").addEventListener("click", async () => {
    try {
      const snap = await getDocs(collection(fs, "facilities"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      output.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      output.textContent = "편의시설 읽기 오류: " + e;
    }
  });

  // ---------------------------
  // ④ 특정 문서 읽기 (컬렉션/ID)
  // ---------------------------
  // 입력 예: buildings/B_01 , facilities/F_01
  $("readPath").addEventListener("click", async () => {
    const path = $("pathInput").value.trim();

    if (!path) {
      output.textContent = "경로를 입력하세요. (예: buildings/B_01)";
      return;
    }

    const [col, id] = path.split("/");

    if (!col || !id) {
      output.textContent =
        "경로 형식이 잘못되었습니다. (예: buildings/B_01, facilities/F_01)";
      return;
    }

    try {
      const snap = await getDoc(doc(fs, col, id));

      if (!snap.exists()) {
        output.textContent = "❌ 문서가 존재하지 않습니다.";
        return;
      }

      output.textContent = JSON.stringify(
        { id: snap.id, ...snap.data() },
        null,
        2
      );
    } catch (e) {
      output.textContent = "문서 읽기 오류: " + e;
    }
  });
}
