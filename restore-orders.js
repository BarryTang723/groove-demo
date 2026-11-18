const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function restoreOrders() {
  // 在这里放入五笔订单数据
  // 使用 db.collection("orders").doc(id).set(data)
}

restoreOrders();