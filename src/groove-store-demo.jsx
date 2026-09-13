import { useState, useMemo, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// XIU-Live — 虚拟直播打赏商城 (含主播列表 & 订单历史记录)
// ---------------------------------------------------------------------------

// ===========================================================================
// 图片映射表 (IMAGE MAP)
// 这是你唯一需要维护的地方！想换图片，只改这里，不用碰下面的商品列表。
// 左边是商品的 id（对照 PRODUCTS 数组里的 id），右边是导入的图片变量。
//
// 用法：
// 1. 把图片文件放进 src/pic/ 文件夹
// 2. 在下面 import 这张图片
// 3. 在 IMAGE_MAP 里加一行 "商品id": 图片变量
// 没有配图的商品会自动使用原来的彩色占位符，不会报错。
// ===========================================================================
import milkTea from "./pic/milk_tea.webp";
import water from "./pic/water.webp";
import fruitPlate from "./pic/fruits_plate.webp";
import lunch from "./pic/lunch.webp";
import noodles from "./pic/noodles.webp";
import star from "./pic/Avatar/star.jpeg";
import judy from "./pic/Avatar/judy.jpg";

// food 食品类
import cake from "./pic/cake_1.jpg";
import wineAndLiquors from "./pic/wines and liquors_1.png";
import yogurt from "./pic/yogurt_1.png";
import juice from "./pic/juice.jpg";
import fancyMeal from "./pic/fancy meal.jpg";
import cokeCola from "./pic/coke cola_2.png";
import snack from "./pic/snake.jpg";
import pekingDuck from "./pic/peking duck.jpg";
import chineseLiquor from "./pic/chinese_liqur.jpg";
import iceCream from "./pic/ice cream.png";
import littleCake from "./pic/little cake.jpg";
import beer from "./pic/beer_1.png";
import barbeque from "./pic/barbeque_1.jpg";

// special gifts 特殊礼物
import lipsStick from "./pic/lips stick.png";
import perfume from "./pic/perfume_1.png";
import braceletHeavy from "./pic/bracelet_3.png";
import lighterGoldBracelet from "./pic/lighter gold bracelet.png";
import braceletPlain from "./pic/bracelet_2.png";
import earrings from "./pic/earrings.png";
import necklace from "./pic/necklace.png";
import ring from "./pic/ring.png";

// dresses 服饰
import traditionalDress from "./pic/Chinese traditional.png";
import fancyDress from "./pic/fancy dress.png";
import heels from "./pic/heels.png";
import bikini from "./pic/bikini_1.png";
import fashionDress from "./pic/fashion dress.png";
import hat from "./pic/hat.png";

// live events 直播互动
import goHomeEarly from "./pic/go home early one hour.png";
import points30k from "./pic/30k.png";
import oneDayOff from "./pic/one day off.png";
import points80k from "./pic/80k queen battle points 女王PK值80k.jpg";
import points10k from "./pic/10k queen battle points 女王PK值10k.jpg";
import doorDance from "./pic/door dance.png";
import bouquet52 from "./pic/52 bouquet.jpg";
import bouquet99 from "./pic/99 bouquet.jpg";
import bouquet20 from "./pic/20 bouquet_1.jpg";
import gatlingDance from "./pic/gatling dance.png";
import wasabi from "./pic/one tube of wasabi.png";
import solo3min from "./pic/normal solo 3mins.png";
import oneBalutes from "./pic/one balutes.png";
import sofaDance from "./pic/sofa dance.png";
import solo1min from "./pic/normal solo 1min.png";
import facePainting from "./pic/face painting.png";
import halfDayOff from "./pic/half day off.png";
import chairDance from "./pic/chair_dance.jpg";
import testFood1 from "./pic/test.jpg";
import testFood2 from "./pic/test.jpg";

const IMAGE_MAP = {
  // food 食品类
  f1: milkTea,
  f2: water,
  f3: fruitPlate,
  f4: lunch,
  f5: noodles,
  f6: cake,
  f7: wineAndLiquors,
  f8: yogurt,
  f9: juice,
  f10: fancyMeal,
  f11: cokeCola,
  f12: snack,
  f13: pekingDuck,
  f14: chineseLiquor,
  f15: iceCream,
  f16: littleCake,
  f17: beer,
  f18: barbeque,
  f19: testFood1, 
  f20: testFood2, 
  // ⚠️ 原文件名被截断，请确认真实文件名一致
  // f19 breakfast、f20 pisa 没找到对应图片，暂时留空位用占位符

  // special gifts 特殊礼物
  gi1: lipsStick,
  gi2: perfume,
  gi3: braceletHeavy,        // ⚠️ 猜测：加重款金手镯，请确认图对不对
  gi4: lighterGoldBracelet,
  gi5: braceletPlain,        // ⚠️ 猜测：普通手链/手镯，请确认图对不对
  gi6: earrings,
  gi7: necklace,
  gi8: ring,

  // dresses 服饰
  d1: traditionalDress,
  d2: fancyDress,
  d3: heels,
  d4: bikini,
  d5: fashionDress,
  d6: hat,

  // live events 直播互动
  e1: goHomeEarly,
  e2: points30k,
  e3: oneDayOff,
  e4: points80k,   // ⚠️ 原文件名被截断，请确认真实文件名一致
  e5: points10k,   // ⚠️ 原文件名被截断，请确认真实文件名一致
  e6: doorDance,
  e7: bouquet52,
  // e8 33 bouquet 没找到对应图片
  e9: bouquet99,
  e10: bouquet20,
  e11: gatlingDance,
  e12: wasabi,
  e13: solo3min,
  // e14 traditional dance、e15 body painting、e16 play game one hour、e17 pole dance 没找到对应图片
  e18: oneBalutes,
  e19: sofaDance,
  e20: solo1min,
  e21: facePainting,
  e22: halfDayOff,
  e23: chairDance,
};

// 主播头像单独一张表，跟商品图片的 IMAGE_MAP 分开，
// 这样 STREAMERS 的 id (s1, s2...) 就不会跟 PRODUCTS 里的 id 撞车。
const AVATAR_MAP = {
  s1: star,   // star 主播头像
  s2: judy,   // judy 主播头像
};

const CATEGORIES = ["food 食品类", "special gifts 特殊礼物", "dresses 服饰", "live events 直播互动"];

// 1. 主播列表数据
const STREAMERS = [
  { id: "s1", name: "star", room: "Room 8888", status: "直播中 Live" },
  { id: "s2", name: "judy", room: "Room 6666", status: "直播中 Live" },
];

// 2. 57 件虚拟礼物商品
const PRODUCTS = [
  // food 食品类 (20件)
  { id: "f1", name: "milk tea 奶茶", category: "food 食品类", price: 50, salePrice: 45, art: "#D9A441" },
  { id: "f2", name: "water 水", category: "food 食品类", price: 10, salePrice: 9, art: "#3E6259" },
  { id: "f3", name: "fruit plate 水果拼盘", category: "food 食品类", price: 50, salePrice: 45, art: "#8C5E3C" },
  { id: "f4", name: "lunch 午餐", category: "food 食品类", price: 100, salePrice: 90, art: "#B24C3A" },
  { id: "f5", name: "noodles 面条", category: "food 食品类", price: 50, salePrice: 45, art: "#6B4E71" },
  { id: "f6", name: "cake 蛋糕", category: "food 食品类", price: 200, salePrice: 180, art: "#2B4747" },
  { id: "f7", name: "wine and liquors 红酒洋酒", category: "food 食品类", price: 300, salePrice: 270, art: "#C97B4A" },
  { id: "f8", name: "yogurt 酸奶", category: "food 食品类", price: 30, salePrice: 27, art: "#9C8B6E" },
  { id: "f9", name: "juice 果汁", category: "food 食品类", price: 30, salePrice: 27, art: "#5F574C" },
  { id: "f10", name: "fancy meal 豪华大餐", category: "food 食品类", price: 1000, salePrice: 900, art: "#D9A441" },
  { id: "f11", name: "coke cola 可乐", category: "food 食品类", price: 30, salePrice: 27, art: "#8C5E3C" },
  { id: "f12", name: "snack 零食", category: "food 食品类", price: 30, salePrice: 27, art: "#3E6259" },
  { id: "f13", name: "peking duck 北京烤鸭", category: "food 食品类", price: 100, salePrice: 90, art: "#B24C3A" },
  { id: "f14", name: "chinese liquor 白酒", category: "food 食品类", price: 100, salePrice: 90, art: "#6B4E71" },
  { id: "f15", name: "ice cream 冰淇淋", category: "food 食品类", price: 30, salePrice: 27, art: "#2B4747" },
  { id: "f16", name: "little cake 小蛋糕", category: "food 食品类", price: 50, salePrice: 45, art: "#C97B4A" },
  { id: "f17", name: "beer 啤酒", category: "food 食品类", price: 60, salePrice: 54, art: "#9C8B6E" },
  { id: "f18", name: "barbeque 烧烤", category: "food 食品类", price: 400, salePrice: 360, art: "#5F574C" },
  { id: "f19", name: "test food 1", category: "food 食品类", price: 200, salePrice: 1, art: "#D9A441" },
  { id: "f20", name: "test food 2", category: "food 食品类", price: 100, salePrice: 0.01, art: "#8C5E3C" },

  // special gifts 特殊礼物 (8件)
  { id: "gi1", name: "lips stick 口红", category: "special gifts 特殊礼物", price: 200, salePrice: 180, art: "#D9A441" },
  { id: "gi2", name: "perfume 香水", category: "special gifts 特殊礼物", price: 800, salePrice: 720, art: "#3E6259" },
  { id: "gi3", name: "heavier gold bracelet 加重款金手镯", category: "special gifts 特殊礼物", price: 8000, salePrice: 7000, art: "#B24C3A" },
  { id: "gi4", name: "lighter gold bracelet 轻款金手镯", category: "special gifts 特殊礼物", price: 4500, salePrice: 4000, art: "#2B4747" },
  { id: "gi5", name: "bracelet 手链/手镯", category: "special gifts 特殊礼物", price: 300, salePrice: 270, art: "#6B4E71" },
  { id: "gi6", name: "earrings 耳环", category: "special gifts 特殊礼物", price: 300, salePrice: 270, art: "#C97B4A" },
  { id: "gi7", name: "necklace 项链", category: "special gifts 特殊礼物", price: 300, salePrice: 270, art: "#9C8B6E" },
  { id: "gi8", name: "ring 戒指", category: "special gifts 特殊礼物", price: 500, salePrice: 450, art: "#5F574C" },

  // dresses 服饰 (6件)
  { id: "d1", name: "traditional dress 传统服饰", category: "dresses 服饰", price: 300, salePrice: 270, art: "#6B4E71" },
  { id: "d2", name: "fancy dress 华丽礼服", category: "dresses 服饰", price: 1000, salePrice: 900, art: "#B24C3A" },
  { id: "d3", name: "heels 高跟鞋", category: "dresses 服饰", price: 200, salePrice: 180, art: "#D9A441" },
  { id: "d4", name: "bikini 比基尼", category: "dresses 服饰", price: 200, salePrice: 180, art: "#3E6259" },
  { id: "d5", name: "fashion dress 时尚连衣裙", category: "dresses 服饰", price: 200, salePrice: 180, art: "#C97B4A" },
  { id: "d6", name: "hat 帽子", category: "dresses 服饰", price: 100, salePrice: 90, art: "#8C5E3C" },

  // live events 直播互动 (23件)
  { id: "e1", name: "go home early one hour 提前下播一小时", category: "live events 直播互动", price: 300, salePrice: 270, art: "#B24C3A" },
  { id: "e2", name: "30k queen battle points 女王PK值30k", category: "live events 直播互动", price: 300, salePrice: 270, art: "#D9A441" },
  { id: "e3", name: "one day off 请假一天", category: "live events 直播互动", price: 1200, salePrice: 1080, art: "#3E6259" },
  { id: "e4", name: "80k queen battle points 女王PK值80k", category: "live events 直播互动", price: 800, salePrice: 720, art: "#8C5E3C" },
  { id: "e5", name: "10k queen battle points 女王PK值10k", category: "live events 直播互动", price: 100, salePrice: 90, art: "#6B4E71" },
  { id: "e6", name: "door dance 门口热舞", category: "live events 直播互动", price: 50, salePrice: 45, art: "#C97B4A" },
  { id: "e7", name: "52 bouquet 52朵花束", category: "live events 直播互动", price: 520, salePrice: 468, art: "#2B4747" },
  // { id: "e8", name: "33 bouquet 33朵花束", category: "live events 直播互动", price: 330, salePrice: 297, art: "#9C8B6E" },
  { id: "e9", name: "99 bouquet 99朵花束", category: "live events 直播互动", price: 990, salePrice: 891, art: "#5F574C" },
  { id: "e10", name: "33 bouquet 33朵花束", category: "live events 直播互动", price: 200, salePrice: 180, art: "#D9A441" },
  { id: "e11", name: "gatling dance 机关枪热舞", category: "live events 直播互动", price: 10, salePrice: 9, art: "#B24C3A" },
  { id: "e12", name: "one tube of wasabi 一管芥末", category: "live events 直播互动", price: 300, salePrice: 270, art: "#3E6259" },
  { id: "e13", name: "normal solo dance 3mins 独舞3分钟", category: "live events 直播互动", price: 300, salePrice: 300, art: "#6B4E71" },
  // { id: "e14", name: "traditional dance 传统舞蹈", category: "live events 直播互动", price: 50, salePrice: 45, art: "#8C5E3C" },
  // { id: "e15", name: "body painting 人体彩绘", category: "live events 直播互动", price: 100, salePrice: 90, art: "#2B4747" },
  // { id: "e16", name: "solo dance 1min 独舞1分钟", category: "live events 直播互动", price: 200, salePrice: 180, art: "#C97B4A" },
  // { id: "e17", name: "pole dance 钢管舞", category: "live events 直播互动", price: 50, salePrice: 45, art: "#9C8B6E" },
  { id: "e18", name: "one balutes 一颗鸭仔蛋", category: "live events 直播互动", price: 100, salePrice: 90, art: "#5F574C" },
  { id: "e19", name: "sofa dance 沙发热舞", category: "live events 直播互动", price: 50, salePrice: 45, art: "#D9A441" },
  { id: "e20", name: "normal solo dance 1min 独舞1分钟", category: "live events 直播互动", price: 10, salePrice: 9, art: "#B24C3A" },
  { id: "e21", name: "face painting 面部彩绘", category: "live events 直播互动", price: 100, salePrice: 90, art: "#3E6259" },
  { id: "e22", name: "half day off 请假半天", category: "live events 直播互动", price: 800, salePrice: 720, art: "#6B4E71" },
  { id: "e23", name: "chair dance 椅子热舞", category: "live events 直播互动", price: 50, salePrice: 45, art: "#C97B4A" },
];

function Money({ value }) {
  return <span>${value.toFixed(2)}</span>;
}

// 占位块：没有在 IMAGE_MAP 里配图的商品会用这个彩色方块顶替
function ProductArtPlaceholder({ name, color }) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-sm flex flex-col items-center justify-center p-4 text-center"
      style={{ backgroundColor: color + "22", border: `1px solid ${color}44` }}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-2" style={{ backgroundColor: color, color: "#181614" }}>
        {name.slice(0, 1).toUpperCase()}
      </div>
      <span className="text-xs text-[#A79A87] italic">[可放置图片]</span>
      <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-[#D9A441]">
        虚拟特效
      </div>
    </div>
  );
}

// 真图组件：如果 IMAGE_MAP 里有这个商品的图，就显示真图；否则退回占位符
function ProductArt({ product }) {
  const image = IMAGE_MAP[product.id];

  if (image) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-[#2A2724]">
        <img src={image} alt={product.name} className="h-full w-full object-cover" />
        <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-[#D9A441]">
          虚拟特效
        </div>
      </div>
    );
  }

  return <ProductArtPlaceholder name={product.name} color={product.art} />;
}

// 单个商品卡片（包含 Receiver 可选）
function ProductCard({ product, onAdd }) {
  const [justAdded, setJustAdded] = useState(false);
  const [receiver, setReceiver] = useState(STREAMERS[0].name);
  const onSale = product.salePrice != null;

  const handleAdd = () => {
    onAdd(product, receiver);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  return (
    <div className="group flex flex-col justify-between rounded-sm border border-[#2A2724] bg-[#1F1C19] p-3 hover:border-[#443F3A] transition-all">
      <div>
        <ProductArt product={product} />
        <div className="mt-3">
          <p className="font-serif text-[15px] font-medium leading-snug text-[#F2E9DC]">{product.name}</p>
          <p className="mt-1 text-sm text-[#A79A87]">
            {onSale ? (
              <>
                <span className="text-[#D9A441]"><Money value={product.salePrice} /></span>{" "}
                <span className="line-through text-xs text-[#7A7064]">{"$" + product.price.toFixed(2)}</span>
              </>
            ) : (
              <Money value={product.price} />
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-[#2A2724] pt-3">
        {/* 选择受赠主播 Receiver */}
        <label className="block text-[11px] text-[#7A7064] mb-1">选择受赠主播 (Receiver):</label>
        <select
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="mb-3 w-full rounded-sm border border-[#443F3A] bg-[#181614] px-2 py-1 text-xs text-[#F2E9DC] focus:outline-none"
        >
          {STREAMERS.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          className={`w-full rounded-sm border py-1.5 text-xs tracking-wide transition-colors ${
            justAdded
              ? "border-[#D9A441] text-[#D9A441]"
              : "border-[#443F3A] text-[#F2E9DC] hover:border-[#D9A441] hover:text-[#D9A441]"
          }`}
        >
          {justAdded ? "Added ✓" : "赠送礼物 / Add"}
        </button>
      </div>
    </div>
  );
}

// PayPal 结算组
function PayPalCheckout({ total, onSuccess }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (total <= 0) return;
    if (!window.paypal) {
      console.warn("PayPal SDK 未加载，使用模拟支付按钮替代。");
      return;
    }

    containerRef.current.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: total.toFixed(2), currency_code: "USD" } }],
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        onSuccess(details);
      },
      onError: (err) => {
        console.error("PayPal Error:", err);
      },
    });

    buttons.render(containerRef.current);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [total]);

  return (
    <div className="mt-4">
      <div ref={containerRef} />
      {/* 若未接入标准PayPal SDK，提供简易测试支付入口 */}
      {!window.paypal && (
        <button
          onClick={() =>
            onSuccess({
              id: "SIM-" + Date.now(),
              payer: { name: { given_name: "Valued Supporter" } },
            })
          }
          className="mt-2 w-full rounded-sm bg-[#D9A441] py-2 text-xs font-semibold text-[#181614] hover:bg-[#b88a33]"
        >
          模拟 PayPal 快速支付 (<Money value={total} />)
        </button>
      )}
    </div>
  );
}

export default function XiuLiveStore() {
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);

  // 本地订单记录 State
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("xiu_orders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("xiu_orders", JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product, receiver) => {
    setCart((prev) => {
      const price = product.salePrice ?? product.price;
      const existing = prev.find((i) => i.id === product.id && i.receiver === receiver);
      if (existing) {
        return prev.map((i) => (i.id === product.id && i.receiver === receiver ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price, receiver, qty: 1 }];
    });
  };

  const removeFromCart = (id, receiver) =>
    setCart((prev) => prev.filter((i) => !(i.id === id && i.receiver === receiver)));

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  // 记录生成的完整订单
  const handlePaymentSuccess = (details) => {
    const newOrder = {
      orderId: details.id || "ORD-" + Date.now(),
      date: new Date().toLocaleString(),
      payer: details.payer?.name?.given_name || "Anonymous",
      items: [...cart],
      totalAmount: cartTotal,
      status: "COMPLETED",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCartOpen(false);
    setOrdersOpen(true);
    alert(`打赏成功！订单编号: ${newOrder.orderId}`);
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: PRODUCTS.filter((p) => p.category === cat),
  }));

  return (
    <div className="min-h-screen bg-[#181614] font-sans text-[#F2E9DC]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#2A2724] bg-[#181614]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-serif text-xl font-bold tracking-wide text-[#D9A441]">XIU-Live</span>
            <nav className="hidden gap-6 text-sm text-[#C9BCA8] md:flex">
              <a href="#streamers" className="text-[#D9A441] hover:underline">Streamers主播列表</a>
              {CATEGORIES.map((c) => (
                <a key={c} href={`#${c}`} className="hover:text-[#F2E9DC]">
                  {c}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5 text-sm text-[#C9BCA8]">
            <button onClick={() => setSearchOpen(true)} className="hover:text-[#F2E9DC]">
              搜索Search
            </button>

            <button onClick={() => setOrdersOpen(true)} className="hover:text-[#F2E9DC] relative">
              订单记录
              {orders.length > 0 && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#D9A441]"></span>
              )}
            </button>

            <button onClick={() => setCartOpen(true)} className="relative text-[#D9A441]">
              Shopping Cart购物车
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D9A441] text-[10px] font-semibold text-[#181614]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D9A441]">XIU-Live 虚拟礼物打赏平台</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#F2E9DC] md:text-4xl">
          支持喜爱的主播，解锁房间专属特效
        </h1>
      </section>

      {/* 新增: 主播列表 Showcase */}
      <section id="streamers" className="mx-auto max-w-6xl px-6 py-6 scroll-mt-20">
        <div className="rounded-sm border border-[#2A2724] bg-[#1F1C19] p-4">
          <h2 className="font-serif text-lg text-[#D9A441] mb-3">Streamers驻场主播列表 </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STREAMERS.map((s) => {
              const avatarImg = AVATAR_MAP[s.id];
              return (
                <div key={s.id} className="rounded border border-[#2A2724] bg-[#181614] p-3 text-center">
                  {avatarImg ? (
                    <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-[#2A2724]">
                      <img src={avatarImg} alt={s.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="relative aspect-square w-full flex items-center justify-center rounded-sm bg-[#D9A441]/20 text-[#D9A441] font-bold text-2xl">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="mt-3 text-sm font-medium text-[#F2E9DC]">{s.name}</p>
                  <p className="text-[11px] text-[#7A7064]">{s.room}</p>
                  <span
                    className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] ${
                      s.status.includes("Live") ? "bg-emerald-900/60 text-emerald-400" : "bg-[#2A2724] text-[#7A7064]"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 商品列表 */}
      <main className="mx-auto max-w-6xl px-6 pb-24">
        {grouped.map(({ category, items }) => (
          <section key={category} id={category} className="mb-14 scroll-mt-20">
            <div className="mb-6 flex items-baseline justify-between border-b border-[#2A2724] pb-3">
              <h2 className="font-serif text-2xl text-[#D9A441]">{category}</h2>
              <span className="text-sm text-[#7A7064]">{items.length} 件礼物</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* 侧边打赏清单 (Cart Drawer) */}
      <div className={`fixed inset-0 z-40 transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-full max-w-sm bg-[#1F1C19] p-6 shadow-2xl transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-[#D9A441]">打赏礼物清单</h3>
            <button onClick={() => setCartOpen(false)} className="text-sm text-[#7A7064]">关闭 ✕</button>
          </div>

          {cart.length === 0 ? (
            <p className="mt-10 text-sm text-[#7A7064]">尚未选择打赏礼物。</p>
          ) : (
            <div className="mt-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {cart.map((item) => (
                <div key={`${item.id}-${item.receiver}`} className="flex items-center justify-between border-b border-[#2A2724] pb-3 text-sm">
                  <div>
                    <p className="font-medium text-[#F2E9DC]">{item.name}</p>
                    <p className="text-xs text-[#D9A441]">受赠主播: {item.receiver}</p>
                    <p className="text-xs text-[#7A7064]">
                      数量 {item.qty} · <Money value={item.price} />
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.receiver)} className="text-xs text-[#7A7064] hover:text-[#D9A441]">
                    移除
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 font-serif text-lg">
                <span>合计打赏</span>
                <span className="text-[#D9A441]"><Money value={cartTotal} /></span>
              </div>
              <PayPalCheckout total={cartTotal} onSuccess={handlePaymentSuccess} />
            </div>
          )}
        </aside>
      </div>

      {/* 侧边订单历史记录 (Orders Drawer) */}
      <div className={`fixed inset-0 z-40 transition-opacity ${ordersOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setOrdersOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#1F1C19] p-6 shadow-2xl transition-transform ${ordersOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-[#2A2724] pb-4">
            <h3 className="font-serif text-xl text-[#D9A441]">历史打赏订单记录</h3>
            <button onClick={() => setOrdersOpen(false)} className="text-sm text-[#7A7064]">关闭 ✕</button>
          </div>

          {orders.length === 0 ? (
            <p className="mt-10 text-sm text-[#7A7064]">暂无历史打赏订单。</p>
          ) : (
            <div className="mt-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
              {orders.map((ord) => (
                <div key={ord.orderId} className="rounded border border-[#2A2724] bg-[#181614] p-3 text-xs">
                  <div className="flex justify-between text-[#7A7064] mb-2">
                    <span>订单号: {ord.orderId}</span>
                    <span className="text-emerald-400 font-semibold">{ord.status}</span>
                  </div>
                  <p className="text-[#A79A87] mb-2">时间: {ord.date}</p>
                  <div className="space-y-1.5 border-t border-[#2A2724] pt-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[#F2E9DC]">
                        <span>{it.name} (x{it.qty}) → <span className="text-[#D9A441]">{it.receiver}</span></span>
                        <span>${(it.price * it.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right border-t border-[#2A2724] pt-2 font-semibold text-[#D9A441]">
                    总付费: ${ord.totalAmount.toFixed(2)} USD
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-[#181614]/90 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto mt-24 w-full max-w-xl px-6" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索打赏礼物..."
              className="w-full border-b border-[#443F3A] bg-transparent pb-3 font-serif text-2xl text-[#F2E9DC] focus:outline-none"
            />
            <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-[#2A2724]">
                  <span>{p.name}</span>
                  <span className="text-[#D9A441]"><Money value={p.salePrice ?? p.price} /></span>
                </div>
              ))}
            </div>
            <button onClick={() => setSearchOpen(false)} className="mt-6 text-xs text-[#7A7064]">关闭 ✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
