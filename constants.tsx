
import React from 'react';
import { 
  CircleDollarSign, 
  Utensils, 
  Users, 
  Home, 
  Gamepad2, 
  PlusCircle, 
  MinusCircle,
  Menu,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2,
  Edit2
} from 'lucide-react';

export const CATEGORIES: Record<string, string[]> = {
  "收": ["薪水", "獎金", "投資盈餘", "中獎", "利息", "禮金人情", "其他"],
  "食": ["三餐外食", "水果零食", "茶飲酒類", "食材", "健康食品", "幼兒食品", "其他"],
  "人": ["保險", "尊親捐款", "醫療藥品", "紅白包", "稅款罰款", "投資", "送禮", "其他"],
  "行": ["租車加油", "公共運輸", "保養維修", "停車過路", "其他"],
  "住": ["房租房貸", "電視網路", "水電瓦斯", "生活用品", "手機通訊", "清潔用品", "電器用品", "家具修繕", "幼兒用品", "其他"],
  "育": ["運動健身", "文具用品", "教育學費", "其他"],
  "樂": ["寵物", "電影音樂", "休覽玩樂", "遊戲3C", "幼兒玩具", "其他"],
  "衣": ["治裝配件", "美妝保養", "幼兒衣物", "其他"]
};

export const CATEGORY_COLORS: Record<string, string> = {
  "收": "#A3B18A", // 鼠尾草綠
  "食": "#E6BEB3", // 杏桃粉
  "人": "#BDBDBD", // 莫蘭迪暖灰
  "行": "#8ECAE6", // 天空灰藍
  "住": "#D4A373", // 亞麻棕
  "育": "#98B4AA", // 莫蘭迪湖水綠
  "樂": "#E9C46A", // 莫蘭迪暖黃 (Updated)
  "衣": "#D8A7B1"  // 莫蘭迪乾燥玫瑰色
};

export const COMMON_TAGS = [
  "羅", "朱", "晚餐", "早餐", "午餐", "刷卡", "固定支出", "分期", 
  "水泥車", "中油捷利卡", "屁洋", "朱機車", "mini", "tiida", 
  "全聯", "捐款", "嘿來"
];

export const ICONS = {
  Menu,
  Calendar,
  PlusCircle,
  MinusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2,
  Edit2
};
