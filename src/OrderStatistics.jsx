
import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function formatMoney(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function getOrderDate(order) {
  if (order.createdAt?.toDate) {
    return order.createdAt.toDate();
  }

  if (order.createdAt instanceof Date) {
    return order.createdAt;
  }

  if (order.date) {
    const parsed = new Date(order.date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function formatDate(date) {
  return date
    ? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    : "-";
}

function titleCase(value) {
  return String(value || "Unknown")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function OrderStatistics() {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(todayString);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(collection(db, "orders"));

      const start = startDate
        ? new Date(`${startDate}T00:00:00`)
        : null;

      const end = endDate
        ? new Date(`${endDate}T00:00:00`)
        : null;

      if (end) {
        end.setDate(end.getDate() + 1);
      }

      const results = [];

      snapshot.forEach((doc) => {
        const order = doc.data();

        if (String(order.status || "").toUpperCase() !== "COMPLETED") {
          return;
        }

        const orderDate = getOrderDate(order);
        if (!orderDate) return;

        if (start && orderDate < start) return;
        if (end && orderDate >= end) return;

        results.push({
          ...order,
          _docId: doc.id,
          _orderDate: orderDate,
        });
      });

      results.sort(
        (a, b) => b._orderDate.getTime() - a._orderDate.getTime()
      );

      setOrders(results);
      setSearched(true);
    } catch (err) {
      console.error("Order statistics error:", err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  // Split each order into individual gift records, grouped by receiver.
  const grouped = {};

  orders.forEach((order) => {
    (order.items || []).forEach((item, index) => {
      const receiver = String(item.receiver || "Unknown").trim();
      const key = receiver.toLowerCase();

      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      const amount = price * qty;

      if (!grouped[key]) {
        grouped[key] = {
          name: titleCase(receiver),
          total: 0,
          giftCount: 0,
          orderCount: new Set(),
          items: [],
        };
      }

      const group = grouped[key];

      group.total += amount;
      group.giftCount += qty;
      group.orderCount.add(order.orderId || order._docId);

      group.items.push({
        key: `${order._docId}-${index}`,
        date: order._orderDate,
        sender: order.payer || order.buyerName || "Unknown",
        gift: item.name || "Unknown Gift",
        qty,
        amount,
        orderId: order.orderId || order._docId,
      });
    });
  });

  const groups = Object.values(grouped).sort(
    (a, b) => b.total - a.total
  );

  const grandTotal = groups.reduce(
    (sum, group) => sum + group.total,
    0
  );

  const totalGifts = groups.reduce(
    (sum, group) => sum + group.giftCount,
    0
  );

  return (
    <div className="min-h-screen bg-[#181614] text-[#F5EDE2] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-7">
          <p className="text-xs tracking-[0.3em] text-[#B89A70] uppercase">
            XIU-LIVE MANAGEMENT
          </p>
          <h1 className="text-3xl font-semibold mt-2">
            Order Statistics
          </h1>
          <p className="text-sm text-[#A79A87] mt-2">
            Revenue breakdown by streamer and gift details
          </p>
        </div>

        <div className="bg-[#24211E] border border-[#40382F] rounded-xl p-5 mb-6">
          <h2 className="text-lg font-medium mb-4">
            Select Date Range
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm text-[#B9AA98]">
              Start Date
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full mt-2 rounded-lg bg-[#181614] border border-[#55483A] p-3 text-white"
              />
            </label>

            <label className="text-sm text-[#B9AA98]">
              End Date
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full mt-2 rounded-lg bg-[#181614] border border-[#55483A] p-3 text-white"
              />
            </label>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full rounded-lg bg-[#B89A70] hover:bg-[#C9AA7E] disabled:opacity-50 text-[#181614] font-semibold p-3"
              >
                {loading ? "Loading..." : "Search Orders"}
              </button>
            </div>
          </div>

          <p className="text-xs text-[#897D70] mt-3">
            Leave the start date empty to include all available history.
          </p>

          {error && (
            <p className="text-sm text-red-400 mt-4">{error}</p>
          )}
        </div>

        {searched && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#24211E] border border-[#40382F] rounded-xl p-5">
                <p className="text-sm text-[#A79A87]">Total Revenue</p>
                <p className="text-3xl font-semibold text-[#D7B889] mt-2">
                  {formatMoney(grandTotal)}
                </p>
              </div>

              <div className="bg-[#24211E] border border-[#40382F] rounded-xl p-5">
                <p className="text-sm text-[#A79A87]">Completed Orders</p>
                <p className="text-3xl font-semibold mt-2">
                  {orders.length}
                </p>
              </div>

              <div className="bg-[#24211E] border border-[#40382F] rounded-xl p-5">
                <p className="text-sm text-[#A79A87]">Total Gifts</p>
                <p className="text-3xl font-semibold mt-2">
                  {totalGifts}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {groups.map((group) => (
                <section
                  key={group.name}
                  className="bg-[#24211E] border border-[#40382F] rounded-xl overflow-hidden"
                >
                  <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-[#40382F]">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {group.name}
                      </h2>
                      <p className="text-xs text-[#A79A87] mt-1">
                        {group.orderCount.size} orders · {group.giftCount} gifts
                      </p>
                    </div>

                    <p className="text-2xl font-semibold text-[#D7B889]">
                      {formatMoney(group.total)}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#302B26] text-[#B9AA98]">
                        <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Sender</th>
                          <th className="p-4">Gift</th>
                          <th className="p-4 text-center">Qty</th>
                          <th className="p-4 text-right">Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {group.items
                          .sort((a, b) => b.date - a.date)
                          .map((item) => (
                            <tr
                              key={item.key}
                              className="border-t border-[#40382F] hover:bg-[#302B26]"
                            >
                              <td className="p-4 whitespace-nowrap">
                                {formatDate(item.date)}
                              </td>
                              <td className="p-4">{item.sender}</td>
                              <td className="p-4">{item.gift}</td>
                              <td className="p-4 text-center">
                                {item.qty}
                              </td>
                              <td className="p-4 text-right whitespace-nowrap">
                                {formatMoney(item.amount)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}

              {groups.length === 0 && (
                <div className="text-center text-[#A79A87] py-12">
                  No completed orders found in this date range.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
