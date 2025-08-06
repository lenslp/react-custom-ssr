/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,jsx,ts,html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 品牌色
        brand: "var(--color-brand)",
        // 辅助色-深蓝紫
        blue: "var(--color-blue)",
        // 辅助色-火焰红
        red: "var(--color-red)",
        // 辅助色-浅冰蓝
        secondary: "var(--color-secondary)",
        // 用于大标题、重要的字，弹窗，icon
        title: "var(--color-title)",
        // 二级标题、正文、输入框内文字
        "sub-title": "var(--color-sub-title)",
        // 三级标题、表头
        descreption: "var(--color-descreption)",
        // 提示
        hint: "var(--color-hint)",
        // 列表、板块区分
        line: "var(--color-line)",
        // 列表、板块区分
        outline: "var(--color-outline)",
        // 局部背景色、按钮禁用
        disable: "var(--color-disable)",
        // 页面背景色 、卡片布局时，卡片的颜色
        primary: "var(--color-primary)",
        // 页面背景色 、卡片布局时，卡片的颜色
        frontground: "var(--color-frontground)",
        // 灰色模块/卡片布局时灰色背景
        background: "var(--color-background)",
        // 灰色模块/卡片布局时灰色背景
        "background-2": "var(--color-background-2)",
        // 按钮默认
        // 'brand-nomal': 'var(--color-brand-nomal)',
        // 按钮悬停
        "brand-hover": "var(--color-brand-hover)",
        // 按钮点击
        "brand-press": "var(--color-brand-press)",
        // 页面背景色 、卡片布局时，卡片的颜色
        light: "var(--color-light)",
        // 页面背景色 、卡片布局时，卡片的颜色
        orange: "var(--color-orange)",
      },
      screens: {
        phone: { min: "320px", max: "767px" },
        pad: { min: "768px", max: "1200px" },
        pc: { min: "1200" },
      },
    },
  },
  plugins: [],
};
