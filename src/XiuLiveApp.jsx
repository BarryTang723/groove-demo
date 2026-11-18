
import { lazy, Suspense } from "react";

// Lightweight order page
const AdminOrders = lazy(() => import("./AdminOrders.jsx"));

// Date-range statistics page
const OrderStatistics = lazy(() => import("./OrderStatistics.jsx"));

// Full storefront
const Storefront = lazy(() => import("./XiuLiveStorefront.jsx"));

function getPage() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/xnxi") {
    return AdminOrders;
  }

  if (path === "/zsjx") {
    return OrderStatistics;
  }

  return Storefront;
}

export default function XiuLiveStore() {
  const Page = getPage();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#181614] p-8 text-center text-sm text-[#A79A87]">
          Loading...
        </div>
      }
    >
      <Page />
    </Suspense>
  );
}
