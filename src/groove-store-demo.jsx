import { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query as fsQuery, orderBy, serverTimestamp } from "firebase/firestore";

// ---------------------------------------------------------------------------
// XIU-Live — 虚拟直播打赏商城 (含主播列表 & 订单历史记录 & 中英文切换)
// ---------------------------------------------------------------------------

// ===========================================================================
// 图片映射表 (IMAGE MAP)
// 这是你唯一需要维护的地方！想换图片，只改这里，不用碰下面的商品列表。
// 左边是商品的 id（对照 PRODUCTS 数组里的 id），右边是导入的图片变量。
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
import hamburger from "./pic/hamburger.png";
import breakfast from "./pic/breakfast.png";
import hotpot from "./pic/hotpot.jpeg";
import lolipop from "./pic/lolipop.png";
import chocolate from "./pic/chocolate.webp";
import milk from "./pic/milk.png";

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
import stocking from "./pic/stocking.png";

// live events 直播互动
import goHomeEarly from "./pic/go home early one hour.png";
import oneDayOff from "./pic/one day off.png";
import bouquet52 from "./pic/52 bouquet.jpg";
import gatlingDance from "./pic/gatling dance.png";
import wasabi from "./pic/one tube of wasabi.png";
import solo3min from "./pic/normal solo 3mins.png";
import oneBalutes from "./pic/one balutes.png";
import solo1min from "./pic/normal solo 1min.png";
import facePainting from "./pic/face painting.png";
import halfDayOff from "./pic/half day off.png";
import chairDance from "./pic/chair_dance.jpg";
import boyfriendPOV from "./pic/boyfrined_POV.jpg";
import blackEgg from "./pic/blackegg.png";
import testFood1 from "./pic/test.jpg";
import testFood2 from "./pic/test.jpg";

// punishment 惩罚游戏
import turnOffFilter from "./pic/turn_off_filter.jpg";
import turnOffFilterMany from "./pic/turn_off_filter_many.jpg";
import uglyDance from "./pic/ugly_dance.jpg";
import chili from "./pic/chili.jpg";
import wasabi4All from "./pic/wasabi_4_all.jpg";
import mixTogether4 from "./pic/4_mix_together.jpg";

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
  f21: wineAndLiquors,
  f22: milk,
  f23: hamburger,
  f24: breakfast,
  f25: hotpot,
  f26: lolipop,
  f27: chocolate,

  // special gifts 特殊礼物
  gi1: lipsStick,
  gi2: perfume,
  gi3: braceletHeavy,
  gi4: lighterGoldBracelet,
  gi5: braceletPlain,
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
  d7: stocking,

  // live events 直播互动
  e1: goHomeEarly,
  e3: oneDayOff,
  e6: boyfriendPOV,
  e7: bouquet52,
  e11: gatlingDance,
  e12: wasabi,
  e13: solo3min,
  e14: blackEgg,
  e18: oneBalutes,
  e20: solo1min,
  e21: facePainting,
  e22: halfDayOff,
  e23: chairDance,

  // punishment 惩罚游戏
  p1: turnOffFilter,
  p2: turnOffFilterMany,
  p3: uglyDance,
  p4: chili,
  p5: wasabi4All,
  p6: mixTogether4,
};

// 主播头像单独一张表
const AVATAR_MAP = {
  s1: star,
  s2: judy,
};

// ===========================================================================
// 语言 (LANGUAGE)
// 所有界面文字集中放在这里。要改文案，就改这两份对应的文字。
// ===========================================================================
const UI_TEXT = {
  zh: {
    streamersNav: "主播列表",
    streamersTitle: "驻场主播列表",
    search: "搜索",
    orders: "订单记录",
    cart: "购物车",
    bannerTag: "XIU-Live 虚拟礼物打赏平台",
    bannerTitle: "支持喜爱的主播，解锁房间专属特效",
    giftsCount: (n) => `${n} 件礼物`,
    receiverLabel: "选择受赠主播 (Receiver):",
    addButton: "赠送礼物",
    added: "已添加 ✓",
    cartTitle: "打赏礼物清单",
    emptyCart: "尚未选择打赏礼物。",
    qty: "数量",
    remove: "移除",
    total: "合计打赏",
    simPayButton: (total) => `模拟 PayPal 快速支付 (${total})`,
    paySuccess: (id) => `打赏成功！订单编号: ${id}`,
    ordersTitle: "历史打赏订单记录",
    noOrders: "暂无历史打赏订单。",
    orderIdLabel: "订单号",
    timeLabel: "时间",
    totalPaidLabel: "总付费",
    searchPlaceholder: "搜索打赏礼物...",
    close: "关闭 ✕",
    live: "直播中",
    off: "休息中",
    buyerNameLabel: "你的名字 (购买人):",
    buyerNamePlaceholder: "请输入你的名字",
    nameRequiredAlert: "请先填写你的名字，再进行支付",
    buyerLabel: "购买人",
    loadingOrders: "订单加载中...",
  },
  en: {
    streamersNav: "Streamers",
    streamersTitle: "Streamers",
    search: "Search",
    orders: "Order History",
    cart: "Shopping Cart",
    bannerTag: "XIU-Live Virtual Gift Platform",
    bannerTitle: "Support your favorite streamers, unlock exclusive room effects",
    giftsCount: (n) => `${n} gifts`,
    receiverLabel: "Choose Receiver:",
    addButton: "Add Gift",
    added: "Added ✓",
    cartTitle: "Gift Cart",
    emptyCart: "No gifts selected yet.",
    qty: "Qty",
    remove: "Remove",
    total: "Total",
    simPayButton: (total) => `Simulated PayPal Payment (${total})`,
    paySuccess: (id) => `Payment successful! Order ID: ${id}`,
    ordersTitle: "Order History",
    noOrders: "No orders yet.",
    orderIdLabel: "Order ID",
    timeLabel: "Time",
    totalPaidLabel: "Total Paid",
    searchPlaceholder: "Search gifts...",
    close: "Close ✕",
    live: "Live",
    off: "Offline",
    buyerNameLabel: "Your Name (Buyer):",
    buyerNamePlaceholder: "Enter your name",
    nameRequiredAlert: "Please enter your name before paying",
    buyerLabel: "Buyer",
    loadingOrders: "Loading orders...",
  },
};

const LangContext = createContext({ lang: "zh", t: UI_TEXT.zh });

function useLang() {
  return useContext(LangContext);
}

const CATEGORIES = [
  { id: "food", zh: "食品类", en: "Food" },
  { id: "gifts", zh: "特殊礼物", en: "Special Gifts" },
  { id: "dresses", zh: "服饰", en: "Dresses" },
  { id: "events", zh: "直播互动", en: "Live Events" },
  { id: "punishment", zh: "惩罚游戏", en: "Punishment Games" },
];

// 1. 主播列表数据
const STREAMERS = [
  { id: "s1", name: "star", room: "sirens520", live: true },
  { id: "s2", name: "judy", room: "sirens520", live: true },
];

// 2. 虚拟礼物商品
// nameZh / nameEn 分别是中文名和英文名，切换语言时会自动显示对应的那一份。
const PRODUCTS = [
  // food 食品类
  { id: "f1", nameZh: "奶茶", nameEn: "Milk Tea", category: "food", price: 50, salePrice: 45, art: "#D9A441" },
  { id: "f2", nameZh: "水", nameEn: "Water", category: "food", price: 10, salePrice: 9, art: "#3E6259" },
  { id: "f3", nameZh: "水果拼盘", nameEn: "Fruit Plate", category: "food", price: 50, salePrice: 45, art: "#8C5E3C" },
  { id: "f4", nameZh: "午餐", nameEn: "Lunch", category: "food", price: 100, salePrice: 90, art: "#B24C3A" },
  { id: "f5", nameZh: "面条", nameEn: "Noodles", category: "food", price: 50, salePrice: 45, art: "#6B4E71" },
  { id: "f6", nameZh: "蛋糕", nameEn: "Cake", category: "food", price: 200, salePrice: 180, art: "#2B4747" },
  { id: "f7", nameZh: "红酒", nameEn: "Red Wine", category: "food", price: 180, salePrice: 180, art: "#C97B4A" },
  { id: "f8", nameZh: "酸奶", nameEn: "Yogurt", category: "food", price: 18, salePrice: 18, art: "#9C8B6E" },
  { id: "f9", nameZh: "果汁", nameEn: "Juice", category: "food", price: 30, salePrice: 27, art: "#5F574C" },
  { id: "f10", nameZh: "团队聚餐（1 team together）", nameEn: "Fancy Meal (1 Team Together)", category: "food", price: 1000, salePrice: 900, art: "#D9A441" },
  { id: "f11", nameZh: "可乐", nameEn: "Coca-Cola", category: "food", price: 30, salePrice: 27, art: "#8C5E3C" },
  { id: "f12", nameZh: "零食", nameEn: "Snack", category: "food", price: 18, salePrice: 18, art: "#3E6259" },
  { id: "f13", nameZh: "北京烤鸭", nameEn: "Peking Duck", category: "food", price: 100, salePrice: 90, art: "#B24C3A" },
  { id: "f14", nameZh: "白酒", nameEn: "Chinese Liquor", category: "food", price: 100, salePrice: 90, art: "#6B4E71" },
  { id: "f15", nameZh: "冰淇淋", nameEn: "Ice Cream", category: "food", price: 18, salePrice: 18, art: "#2B4747" },
  { id: "f16", nameZh: "小蛋糕", nameEn: "Little Cake", category: "food", price: 50, salePrice: 45, art: "#C97B4A" },
  { id: "f17", nameZh: "啤酒", nameEn: "Beer", category: "food", price: 48, salePrice: 48, art: "#9C8B6E" },
  { id: "f18", nameZh: "烧烤", nameEn: "Barbeque", category: "food", price: 400, salePrice: 360, art: "#5F574C" },
  { id: "f19", nameZh: "测试食物 1", nameEn: "Test Food 1", category: "food", price: 200, salePrice: 1, art: "#D9A441" },
  { id: "f20", nameZh: "测试食物 2", nameEn: "Test Food 2", category: "food", price: 100, salePrice: 0.01, art: "#8C5E3C" },
  { id: "f21", nameZh: "洋酒", nameEn: "Liquor", category: "food", price: 180, salePrice: 180, art: "#8C5E3C" },
  { id: "f22", nameZh: "牛奶", nameEn: "Milk", category: "food", price: 18, salePrice: 18, art: "#F2E9DC" },
  { id: "f23", nameZh: "汉堡", nameEn: "Hamburger", category: "food", price: 40, salePrice: 40, art: "#B24C3A" },
  { id: "f24", nameZh: "早餐", nameEn: "Breakfast", category: "food", price: 40, salePrice: 40, art: "#D9A441" },
  { id: "f25", nameZh: "火锅", nameEn: "Hotpot", category: "food", price: 360, salePrice: 360, art: "#B24C3A" },
  { id: "f26", nameZh: "棒棒糖", nameEn: "Lollipop", category: "food", price: 9, salePrice: 9, art: "#C97B4A" },
  { id: "f27", nameZh: "巧克力", nameEn: "Chocolate", category: "food", price: 100, salePrice: 100, art: "#5F574C" },

  // special gifts 特殊礼物
  { id: "gi1", nameZh: "口红", nameEn: "Lipstick", category: "gifts", price: 200, salePrice: 180, art: "#D9A441" },
  { id: "gi2", nameZh: "香水", nameEn: "Perfume", category: "gifts", price: 800, salePrice: 720, art: "#3E6259" },
  { id: "gi3", nameZh: "加重款金手镯", nameEn: "Heavy Gold Bracelet", category: "gifts", price: 8000, salePrice: 7000, art: "#B24C3A" },
  { id: "gi4", nameZh: "轻款金手镯", nameEn: "Light Gold Bracelet", category: "gifts", price: 4500, salePrice: 4000, art: "#2B4747" },
  { id: "gi5", nameZh: "手链/手镯", nameEn: "Bracelet", category: "gifts", price: 300, salePrice: 270, art: "#6B4E71" },
  { id: "gi6", nameZh: "耳环", nameEn: "Earrings", category: "gifts", price: 300, salePrice: 270, art: "#C97B4A" },
  { id: "gi7", nameZh: "项链", nameEn: "Necklace", category: "gifts", price: 300, salePrice: 270, art: "#9C8B6E" },
  { id: "gi8", nameZh: "戒指", nameEn: "Ring", category: "gifts", price: 500, salePrice: 450, art: "#5F574C" },

  // dresses 服饰
  { id: "d1", nameZh: "传统服饰", nameEn: "Traditional Dress", category: "dresses", price: 300, salePrice: 270, art: "#6B4E71" },
  { id: "d2", nameZh: "华丽礼服", nameEn: "Fancy Dress", category: "dresses", price: 1000, salePrice: 900, art: "#B24C3A" },
  { id: "d3", nameZh: "高跟鞋", nameEn: "Heels", category: "dresses", price: 200, salePrice: 180, art: "#D9A441" },
  { id: "d4", nameZh: "比基尼", nameEn: "Bikini", category: "dresses", price: 200, salePrice: 180, art: "#3E6259" },
  { id: "d5", nameZh: "时尚连衣裙", nameEn: "Fashion Dress", category: "dresses", price: 200, salePrice: 180, art: "#C97B4A" },
  { id: "d6", nameZh: "帽子", nameEn: "Hat", category: "dresses", price: 100, salePrice: 90, art: "#8C5E3C" },
  { id: "d7", nameZh: "丝袜", nameEn: "Stockings", category: "dresses", price: 50, salePrice: 50, art: "#6B4E71" },

  // live events 直播互动
  { id: "e1", nameZh: "提前下播一小时", nameEn: "Go Home 1 Hour Early", category: "events", price: 300, salePrice: 270, art: "#B24C3A" },
  { id: "e3", nameZh: "请假一天", nameEn: "One Day Off", category: "events", price: 900, salePrice: 900, art: "#3E6259" },
  { id: "e6", nameZh: "男友视角舞蹈", nameEn: "Boyfriend POV Dance", category: "events", price: 50, salePrice: 50, art: "#D9A441" },
  { id: "e7", nameZh: "玫瑰花束（9朵）", nameEn: "Rose Bouquet (9 Roses)", category: "events", price: 100, salePrice: 100, art: "#B24C3A" },
  { id: "e11", nameZh: "机关枪热舞", nameEn: "Gatling Dance", category: "events", price: 10, salePrice: 9, art: "#B24C3A" },
  { id: "e12", nameZh: "一管芥末", nameEn: "One Tube of Wasabi", category: "events", price: 300, salePrice: 270, art: "#3E6259" },
  { id: "e13", nameZh: "独舞 3 分钟", nameEn: "Solo Dance (3 min)", category: "events", price: 300, salePrice: 300, art: "#6B4E71" },
  { id: "e14", nameZh: "黑蛋", nameEn: "Black Egg", category: "events", price: 90, salePrice: 90, art: "#2B4747" },
  { id: "e18", nameZh: "活珠子", nameEn: "Balut (Live Egg)", category: "events", price: 50, salePrice: 50, art: "#5F574C" },
  { id: "e20", nameZh: "独舞 1 分钟", nameEn: "Solo Dance (1 min)", category: "events", price: 10, salePrice: 9, art: "#B24C3A" },
  { id: "e21", nameZh: "面部彩绘", nameEn: "Face Painting", category: "events", price: 100, salePrice: 90, art: "#3E6259" },
  { id: "e22", nameZh: "请假半天", nameEn: "Half Day Off", category: "events", price: 450, salePrice: 450, art: "#6B4E71" },
  { id: "e23", nameZh: "椅子热舞", nameEn: "Chair Dance", category: "events", price: 50, salePrice: 45, art: "#C97B4A" },

  // punishment 惩罚游戏
  { id: "p1", nameZh: "关美颜（单个）", nameEn: "Turn Off Beauty Filter (One)", category: "punishment", price: 50, salePrice: 50, art: "#5F574C" },
  { id: "p2", nameZh: "全场关美颜", nameEn: "Turn Off All Filters", category: "punishment", price: 200, salePrice: 200, art: "#2B4747" },
  { id: "p3", nameZh: "丑舞", nameEn: "Ugly Dance", category: "punishment", price: 30, salePrice: 30, art: "#8C5E3C" },
  { id: "p4", nameZh: "辣椒", nameEn: "Chili Pepper", category: "punishment", price: 48, salePrice: 48, art: "#B24C3A" },
  { id: "p5", nameZh: "一口（醋/酱油/牙膏，任选一个）", nameEn: "One Bite (Vinegar / Soy Sauce / Toothpaste, pick one)", category: "punishment", price: 28, salePrice: 28, art: "#3E6259" },
  { id: "p6", nameZh: "芥末+醋+酱油+牙膏 混在一起", nameEn: "All Four Combined (Wasabi + Vinegar + Soy Sauce + Toothpaste)", category: "punishment", price: 100, salePrice: 100, art: "#D9A441" },
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
      <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-[#D9A441]">
        虚拟特效
      </div>
    </div>
  );
}

// 真图组件：如果 IMAGE_MAP 里有这个商品的图，就显示真图；否则退回占位符
function ProductArt({ product, displayName }) {
  const image = IMAGE_MAP[product.id];

  if (image) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-[#2A2724]">
        <img src={image} alt={displayName} className="h-full w-full object-cover" />
        <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-[#D9A441]">
          虚拟特效
        </div>
      </div>
    );
  }

  return <ProductArtPlaceholder name={displayName} color={product.art} />;
}

// 单个商品卡片（包含 Receiver 可选）
function ProductCard({ product, onAdd }) {
  const { lang, t } = useLang();
  const [justAdded, setJustAdded] = useState(false);
  const [receiver, setReceiver] = useState(STREAMERS[0].name);
  const onSale = product.salePrice != null;
  const displayName = lang === "zh" ? product.nameZh : product.nameEn;

  const handleAdd = () => {
    onAdd(product, receiver, displayName);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  return (
    <div className="group flex flex-col justify-between rounded-sm border border-[#2A2724] bg-[#1F1C19] p-3 hover:border-[#443F3A] transition-all">
      <div>
        <ProductArt product={product} displayName={displayName} />
        <div className="mt-3">
          <p className="font-serif text-[15px] font-medium leading-snug text-[#F2E9DC]">{displayName}</p>
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
        <label className="block text-[11px] text-[#7A7064] mb-1">{t.receiverLabel}</label>
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
          {justAdded ? t.added : t.addButton}
        </button>
      </div>
    </div>
  );
}

// PayPal 结算组
function PayPalCheckout({ total, buyerName, onSuccess }) {
  const { t } = useLang();
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
        if (!buyerName.trim()) {
          alert(t.nameRequiredAlert);
          throw new Error("buyer name required");
        }
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
  }, [total, buyerName]);

  return (
    <div className="mt-4">
      <div ref={containerRef} />
      {!window.paypal && (
        <button
          onClick={() => {
            if (!buyerName.trim()) {
              alert(t.nameRequiredAlert);
              return;
            }
            onSuccess({
              id: "SIM-" + Date.now(),
              payer: { name: { given_name: buyerName.trim() } },
            });
          }}
          className="mt-2 w-full rounded-sm bg-[#D9A441] py-2 text-xs font-semibold text-[#181614] hover:bg-[#b88a33]"
        >
          {t.simPayButton(`$${total.toFixed(2)}`)}
        </button>
      )}
    </div>
  );
}

function StoreContent() {
  const { lang, t } = useLang();
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [buyerName, setBuyerName] = useState("");

  // 订单记录：现在从 Firebase 实时读取，所有访问者看到的是同一份数据
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const q = fsQuery(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() })));
        setOrdersLoading(false);
      },
      (err) => {
        console.error("Firestore 读取订单失败:", err);
        setOrdersLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const addToCart = (product, receiver, displayName) => {
    setCart((prev) => {
      const price = product.salePrice ?? product.price;
      const existing = prev.find((i) => i.id === product.id && i.receiver === receiver);
      if (existing) {
        return prev.map((i) => (i.id === product.id && i.receiver === receiver ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: displayName, price, receiver, qty: 1 }];
    });
  };

  const removeFromCart = (id, receiver) =>
    setCart((prev) => prev.filter((i) => !(i.id === id && i.receiver === receiver)));

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handlePaymentSuccess = async (details) => {
    const newOrder = {
      orderId: details.id || "ORD-" + Date.now(),
      date: new Date().toLocaleString(),
      buyerName: buyerName.trim(),
      payer: details.payer?.name?.given_name || buyerName.trim() || "Anonymous",
      items: [...cart],
      totalAmount: cartTotal,
      status: "COMPLETED",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "orders"), newOrder);
    } catch (err) {
      console.error("保存订单到 Firebase 失败:", err);
      alert("订单保存失败，请检查网络或 Firebase 配置后重试。");
      return;
    }

    setCart([]);
    setCartOpen(false);
    setOrdersOpen(true);
    alert(t.paySuccess(newOrder.orderId));
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter((p) => {
      const name = lang === "zh" ? p.nameZh : p.nameEn;
      return name.toLowerCase().includes(q);
    });
  }, [query, lang]);

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: PRODUCTS.filter((p) => p.category === cat.id),
  }));

  return (
    <div className="min-h-screen bg-[#181614] font-sans text-[#F2E9DC]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#2A2724] bg-[#181614]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-serif text-xl font-bold tracking-wide text-[#D9A441]">XIU-Live</span>
            <nav className="hidden gap-6 text-sm text-[#C9BCA8] md:flex">
              <a href="#streamers" className="text-[#D9A441] hover:underline">{t.streamersNav}</a>
              {CATEGORIES.map((c) => (
                <a key={c.id} href={`#${c.id}`} className="hover:text-[#F2E9DC]">
                  {lang === "zh" ? c.zh : c.en}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5 text-sm text-[#C9BCA8]">
            <LangToggle />

            <button onClick={() => setSearchOpen(true)} className="hover:text-[#F2E9DC]">
              {t.search}
            </button>

            <button onClick={() => setOrdersOpen(true)} className="hover:text-[#F2E9DC] relative">
              {t.orders}
              {orders.length > 0 && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#D9A441]"></span>
              )}
            </button>

            <button onClick={() => setCartOpen(true)} className="relative text-[#D9A441]">
              {t.cart}
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
        <p className="text-xs uppercase tracking-[0.2em] text-[#D9A441]">{t.bannerTag}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#F2E9DC] md:text-4xl">
          {t.bannerTitle}
        </h1>
      </section>

      {/* 主播列表 Showcase */}
      <section id="streamers" className="mx-auto max-w-6xl px-6 py-6 scroll-mt-20">
        <div className="rounded-sm border border-[#2A2724] bg-[#1F1C19] p-4">
          <h2 className="font-serif text-lg text-[#D9A441] mb-3">{t.streamersTitle}</h2>
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
                      s.live ? "bg-emerald-900/60 text-emerald-400" : "bg-[#2A2724] text-[#7A7064]"
                    }`}
                  >
                    {s.live ? t.live : t.off}
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
          <section key={category.id} id={category.id} className="mb-14 scroll-mt-20">
            <div className="mb-6 flex items-baseline justify-between border-b border-[#2A2724] pb-3">
              <h2 className="font-serif text-2xl text-[#D9A441]">{lang === "zh" ? category.zh : category.en}</h2>
              <span className="text-sm text-[#7A7064]">{t.giftsCount(items.length)}</span>
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
            <h3 className="font-serif text-xl text-[#D9A441]">{t.cartTitle}</h3>
            <button onClick={() => setCartOpen(false)} className="text-sm text-[#7A7064]">{t.close}</button>
          </div>

          {cart.length === 0 ? (
            <p className="mt-10 text-sm text-[#7A7064]">{t.emptyCart}</p>
          ) : (
            <div className="mt-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {cart.map((item) => (
                <div key={`${item.id}-${item.receiver}`} className="flex items-center justify-between border-b border-[#2A2724] pb-3 text-sm">
                  <div>
                    <p className="font-medium text-[#F2E9DC]">{item.name}</p>
                    <p className="text-xs text-[#D9A441]">→ {item.receiver}</p>
                    <p className="text-xs text-[#7A7064]">
                      {t.qty} {item.qty} · <Money value={item.price} />
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.receiver)} className="text-xs text-[#7A7064] hover:text-[#D9A441]">
                    {t.remove}
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 font-serif text-lg">
                <span>{t.total}</span>
                <span className="text-[#D9A441]"><Money value={cartTotal} /></span>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] text-[#7A7064] mb-1">{t.buyerNameLabel}</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder={t.buyerNamePlaceholder}
                  className="w-full rounded-sm border border-[#443F3A] bg-[#181614] px-2 py-1.5 text-sm text-[#F2E9DC] focus:outline-none focus:border-[#D9A441]"
                />
              </div>

              <PayPalCheckout total={cartTotal} buyerName={buyerName} onSuccess={handlePaymentSuccess} />
            </div>
          )}
        </aside>
      </div>

      {/* 侧边订单历史记录 (Orders Drawer) */}
      <div className={`fixed inset-0 z-40 transition-opacity ${ordersOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setOrdersOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#1F1C19] p-6 shadow-2xl transition-transform ${ordersOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-[#2A2724] pb-4">
            <h3 className="font-serif text-xl text-[#D9A441]">{t.ordersTitle}</h3>
            <button onClick={() => setOrdersOpen(false)} className="text-sm text-[#7A7064]">{t.close}</button>
          </div>

          {ordersLoading ? (
            <p className="mt-10 text-sm text-[#7A7064]">{t.loadingOrders}</p>
          ) : orders.length === 0 ? (
            <p className="mt-10 text-sm text-[#7A7064]">{t.noOrders}</p>
          ) : (
            <div className="mt-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
              {orders.map((ord) => (
                <div key={ord.docId || ord.orderId} className="rounded border border-[#2A2724] bg-[#181614] p-3 text-xs">
                  <div className="flex justify-between text-[#7A7064] mb-2">
                    <span>{t.orderIdLabel}: {ord.orderId}</span>
                    <span className="text-emerald-400 font-semibold">{ord.status}</span>
                  </div>
                  {ord.buyerName && (
                    <p className="text-[#D9A441] mb-1">{t.buyerLabel}: {ord.buyerName}</p>
                  )}
                  <p className="text-[#A79A87] mb-2">{t.timeLabel}: {ord.date}</p>
                  <div className="space-y-1.5 border-t border-[#2A2724] pt-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[#F2E9DC]">
                        <span>{it.name} (x{it.qty}) → <span className="text-[#D9A441]">{it.receiver}</span></span>
                        <span>${(it.price * it.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right border-t border-[#2A2724] pt-2 font-semibold text-[#D9A441]">
                    {t.totalPaidLabel}: ${ord.totalAmount.toFixed(2)} USD
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
              placeholder={t.searchPlaceholder}
              className="w-full border-b border-[#443F3A] bg-transparent pb-3 font-serif text-2xl text-[#F2E9DC] focus:outline-none"
            />
            <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-[#2A2724]">
                  <span>{lang === "zh" ? p.nameZh : p.nameEn}</span>
                  <span className="text-[#D9A441]"><Money value={p.salePrice ?? p.price} /></span>
                </div>
              ))}
            </div>
            <button onClick={() => setSearchOpen(false)} className="mt-6 text-xs text-[#7A7064]">{t.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 右上角的语言切换按钮：显示的是"切换到哪个语言"，点一下就换。
function LangToggle() {
  const { lang, setLang } = useContext(LangContext);
  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className="rounded-sm border border-[#443F3A] px-2.5 py-1 text-xs font-semibold text-[#D9A441] hover:border-[#D9A441] transition-colors"
    >
      {lang === "zh" ? "EN" : "中文"}
    </button>
  );
}

export default function XiuLiveStore() {
  const [lang, setLang] = useState("zh");
  const value = useMemo(() => ({ lang, setLang, t: UI_TEXT[lang] }), [lang]);

  return (
    <LangContext.Provider value={value}>
      <StoreContent />
    </LangContext.Provider>
  );
}
