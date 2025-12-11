import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBciLypfWRPoxiI105xYzocb3phmq6NQ2Q",
  authDomain: "shirhal-sku.firebaseapp.com",
  projectId: "shirhal-sku",
  storageBucket: "shirhal-sku.firebasestorage.app",
  messagingSenderId: "631130391978",
  appId: "1:631130391978:web:bc160a4c42b194d11a57d3"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// FireStore 인스턴스
export const fs = getFirestore(app);
