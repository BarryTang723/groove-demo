// ===========================================================================
// Firebase 配置文件
// 这里的值需要你自己去 Firebase 控制台复制粘贴过来，不能直接用。
// 具体怎么拿到这些值，看聊天里的分步说明。
// ===========================================================================
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqxDteoopbQ9KzfgTAMVoJe_Gr10yKlOc",
  authDomain: "xiu-live-d4418.firebaseapp.com",
  projectId: "xiu-live-d4418",
  storageBucket: "xiu-live-d4418.firebasestorage.app",
  messagingSenderId: "947660514795",
  appId: "1:947660514795:web:5fafb1955863db6cb8e5ae",
  measurementId: "G-4S3BXQ8FE4"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
