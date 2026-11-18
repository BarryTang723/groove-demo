import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const MAX_ORDERS = 100;

function formatDate(order) {
  if (order?.createdAt?.toDate) {
    return order.createdAt.toDate().toLocaleString();
  }
  return order?.date || "时间未知";
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)} USD`;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // 只读取最近 7 天，最多显示最新 100 笔，避免订单量过大拖慢页面。
    const cutoff = Timestamp.fromDate(new Date(Date.now() - SEVEN_DAYS));
    const ordersQuery = query(
      collection(db, "orders"),
      where("createdAt", ">=", cutoff),
      orderBy("createdAt", "desc"),
      limit(MAX_ORDERS)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLastUpdated(new Date());
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Admin order query failed:", err);
        setError(err?.message || "订单读取失败，请检查网络或 Firestore 权限。");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const total = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders]
  );

  return (
    <main className="min-h-screen bg-[#181614] px-3 py-5 text-[#F2E9DC] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex items-center justify-between gap-3 border-b border-[#37312B] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#D9A441]">XIU-LIVE</p>
            <h1 className="mt-1 text-xl font-semibold">最近 7 天订单</h1>
            <p className="mt-1 text-xs text-[#958A7B]">
              {lastUpdated ? `更新于 ${lastUpdated.toLocaleTimeString()}` : "正在连接订单数据库…"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-[#D9A441]">{orders.length}</p>
            <p className="text-[11px] text-[#958A7B]">笔订单 · {money(total)}</p>
          </div>
        </header>

        {loading && <p className="py-12 text-center text-sm text-[#958A7B]">正在加载订单…</p>}
        {!loading && error && (
          <div className="rounded border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <p className="rounded border border-[#37312B] p-8 text-center text-sm text-[#958A7B]">
            最近 7 天没有订单。
          </p>
        )}

        <section className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-[#37312B] bg-[#211E1A] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold text-[#D9A441]">
                    {order.orderId || order.id}
                  </p>
                  <p className="mt-1 text-xs text-[#A79A87]">{formatDate(order)}</p>
                </div>
                <span className="shrink-0 rounded bg-emerald-950/60 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                  {order.status || "UNKNOWN"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-y border-[#37312B] py-3 text-xs">
                <div>
                  <p className="text-[#958A7B]">买家</p>
                  <p className="mt-1 break-words">{order.buyerName || order.payer || "Anonymous"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#958A7B]">订单金额</p>
                  <p className="mt-1 font-semibold text-[#D9A441]">{money(order.totalAmount)}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {(order.items || []).map((item, index) => (
                  <div key={`${item.id || item.name || "item"}-${index}`} className="flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="break-words">{item.name || "Item"} <span className="text-[#958A7B]">×{item.qty || 1}</span></p>
                      {item.receiver && <p className="mt-0.5 text-[#D9A441]">→ {item.receiver}</p>}
                    </div>
                    <p className="shrink-0 text-[#C9BCA8]">{money(Number(item.price || 0) * Number(item.qty || 1))}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        {!loading && !error && orders.length === MAX_ORDERS && (
          <p className="mt-4 text-center text-[11px] text-[#958A7B]">
            当前显示最近 {MAX_ORDERS} 笔订单。如一周内超过此数量，需要提高查询上限或增加分页。
          </p>
        )}
      </div>
    </main>
  );
}
