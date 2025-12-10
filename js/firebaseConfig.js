// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// TODO: 너의 Firebase 설정값으로 교체
const firebaseConfig = {
  apiKey: "AIzaSyBciLypfWRPoxiI105xYzocb3phmq6NQ2Q",
  authDomain: "shirhal-sku.firebaseapp.com",
  databaseURL: "https://shirhal-sku-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "shirhal-sku",
  storageBucket: "shirhal-sku.firebasestorage.app",
  messagingSenderId: "631130391978",
  appId: "1:631130391978:web:bc160a4c42b194d11a57d3"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// DB export
export const db = getDatabase(app);
