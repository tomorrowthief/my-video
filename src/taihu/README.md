# 杭州出发 · 1.5 天环太湖

当前版本为 1920×1080、30 fps、123 秒的浏览器实时播放视频。地图采用固定斜俯视机位。此前的一日版 MP4 保留在 outputs/taihu/，不代表当前版本。

## 建议行程

- D1：07:00 杭州 → 08:30 湖州月亮湾 → 10:30 长兴 → 13:00 宜兴周铁午餐 → 16:00 无锡马山入住。
- D2：08:00 马山出发 → 08:30 十八湾 → 10:00–12:00 渔洋山麓开放步道休闲徒步 → 12:00–12:30 茶歇 → 13:40–14:30 七都大闸蟹午餐 → 16:00 预计回杭州。
- 酒店：马山拈花客栈。露营备选：常州太湖湾露营谷，需额外住宿支线；未计入主线约 440 km。
- 时间为建议安排，不含实时交通；未指定停车场或预订餐厅、酒店、营位。徒步按现场开放步道选择往返段，未绘制未经验证的徒步 GPS 路线。

## 画面与音乐

征召 → 极氪 7X → 伙伴与装备准备 → 彩色手绘太湖 LET’S GO → 固定机位卫星导航 → 酒店/露营选择 → 徒步 Tooltip → 蟹宴图片 Tooltip → 返杭。

征召、汽车和准备镜头共用模糊、压暗的最终导航背景。人物数量不固定。车辆为极氪官网展示图；手绘太湖与蟹宴图片为 AI 插画/示意。133 秒原创轻音乐由 scripts/generate-taihu-bgm.py 合成，前后渐入渐出，AAC 文件 public/taihu/roadtrip-bgm.m4a 用于整片播放。

## 预览

- Remotion：TaihuDayDrive；其余单镜合成见 TaihuComposition。
- 网站：/?tab=travel&video=taihu-drive，“出游”分类。章节来自 timing.json。
- 页面实时渲染，不依赖 MP4。BGM 需用户点击播放后开始。

## 来源

- 卫星：https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer
- 道路：© OpenStreetMap contributors / OSRM，原始轨迹 public/taihu/route.json。
- 极氪：https://www.zeekrlife.com/global/vehicles/7x
- 酒店：https://www.taihutour.com/hotel.asp?plt=16
- 露营：https://www.wj.gov.cn/index.php?a=show&c=phone&catid=41415&id=536633
- 七都太湖蟹：https://www.suzhou.gov.cn/szsrmzf/qxkx/202506/fc35a291940d427b91c903b9bad6b41b.shtml
- 渔洋山麓步道背景：https://www.thepaper.cn/newsDetail_forward_24825321

LET’S GO 镜头最新要求：仅彩色手绘太湖画面及单行“LET’S GO!”；无副标题、署名、角标、按钮，字母水平及垂直居中。保持原有淡出衔接。

本地导出版调整：LET’S GO! 为白色单行居中；准备分镜由 12 秒缩为 6 秒，后续场景前移 6 秒，整片 127 秒，BGM 在片尾重新渐出。

节奏更新：LET’S GO 镜头 4 秒（原 8 秒），入场 0.2 秒、淡出 0.35 秒，导航提前 4 秒开始；整片 123 秒。
