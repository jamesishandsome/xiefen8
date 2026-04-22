# Dota 2 下分杯拍卖系统

一个基于 Apple 设计风格的 Dota 2 比赛拍卖选人系统。

## 功能特性

### 五个主要阶段

1. **队长选择** - 从所有选手中选择10名队长
2. **队员分配** - 通过拖拽将部分选手预先分配到队伍
3. **预算设置** - 为每个队伍设置拍卖预算
4. **拍卖环节** - 随机抽取选手进行拍卖，手动记录成交结果
5. **最终分配** - 按剩余预算从高到低依次选择剩余选手

### 设计特点

- Apple 风格的 UI 设计（基于 SF Pro 字体系统）
- Dota 2 主题配色（红、金、绿）
- 流畅的动画过渡效果
- 响应式布局，支持移动端

## 技术栈

- React 18
- Vite
- Framer Motion（动画）
- @dnd-kit（拖拽功能）
- XLSX（Excel 文件解析）

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

## Excel 文件格式

选手池 Excel 文件应包含以下列：

- 姓名/名字/选手/Name
- MMR/分数/Rating
- 位置/Position
- 胜率/Win Rate
- 英雄池/Hero Pool
- 备注/Notes

## 使用流程

1. 上传选手池 Excel 文件或使用默认选手池
2. 选择10名队长
3. （可选）预先分配部分队员到队伍
4. 设置每个队伍的拍卖预算
5. 进行拍卖，系统随机抽取选手，手动记录成交信息
6. 拍卖结束后，按剩余预算依次选择剩余选手
7. 查看最终队伍组成

## 项目结构

```
src/
├── components/          # React 组件
│   ├── CaptainSelection.jsx
│   ├── TeamAssignment.jsx
│   ├── BudgetSetup.jsx
│   ├── AuctionPhase.jsx
│   ├── FinalAllocation.jsx
│   └── PlayerCard.jsx
├── styles/             # 样式文件
│   └── global.css
├── utils/              # 工具函数
│   └── excelParser.js
├── App.jsx             # 主应用组件
└── main.jsx            # 入口文件
```

## 自定义配置

### 修改起拍价

在 `App.jsx` 中修改 `FinalAllocation` 组件的 `minPrice` 属性：

```jsx
<FinalAllocation
  players={players}
  teams={teams}
  minPrice={1000}  // 修改此值
/>
```

### 修改队长数量

在 `CaptainSelection.jsx` 中修改队长数量限制。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

MIT
