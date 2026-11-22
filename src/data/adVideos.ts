/**
 * 情报工作台 · 广告档案（列车广告放映室）
 * -----------------------------------------------------------------------------
 * 使用视频平台的官方 iframe 嵌入，不依赖任何本地视频文件。
 *
 * 每支视频的「可嵌入」状态是实测出来的，不是假设：
 *   2026-11-22 用真实浏览器渲染四个 iframe 逐一确认。
 *
 *  01 可口可乐 2024  https://www.youtube.com/embed/4RSTupbfGog
 *      → 渲染结果是「这是私享视频 / This video is private」，不可嵌入。
 *        oEmbed 接口同样返回 403。因此标记 embeddable: false，
 *        页面显示「当前视频暂不支持站内播放」并提供原视频入口，不显示假的播放按钮。
 *
 *  02 可口可乐 2025  https://www.youtube.com/embed/Yy6fByUmPuE
 *      → 正常显示 Coca-Cola | Holidays Are Coming 与播放按钮，可嵌入。
 *
 *  03 可口可乐 2026  https://www.youtube.com/embed/DqV0bcaIzNc
 *      → 正常显示 Coca-Cola | Enjoy Joy :30 与播放按钮，可嵌入。
 *
 *  04 名创优品        https://v.qq.com/txp/iframe/player.html?vid=e3375e2npn9
 *      → 腾讯官方播放器加载成功，可嵌入。
 */

export type AdVideo = {
  id: string;
  no: string;
  /** 卡片短名 */
  card: string;
  year: string;
  /** 弹窗内大标题 */
  title: string;
  /** 影片原名 */
  film: string;
  desc: string;
  /** 官方嵌入地址；embeddable 为 false 时可为空 */
  embed?: string;
  /** 是否实测可嵌入 */
  embeddable: boolean;
  /** 不可嵌入时的原因说明 */
  unavailableNote?: string;
  /** 原视频观看入口 */
  watch: string;
  watchLabel: string;
  /** 封面：本地素材优先 */
  cover?: string;
  /** 网络缩略图（可能失效，失败时显示胶片占位） */
  coverNetwork?: string;
};

export const adVideos: AdVideo[] = [
  {
    id: 'coke-2025',
    no: '01',
    card: '2025 可口可乐AI广告',
    year: '2025',
    title: '2025｜AI广告再次升级',
    film: 'Holidays Are Coming',
    desc: '可口可乐继续运用AI制作圣诞广告，尝试改善视觉细节、画面连贯性和角色表现。',
    embed: 'https://www.youtube.com/embed/Yy6fByUmPuE?rel=0',
    embeddable: true,
    watch: 'https://www.youtube.com/watch?v=Yy6fByUmPuE',
    watchLabel: '前往 YouTube 观看',
    coverNetwork: 'https://i.ytimg.com/vi/Yy6fByUmPuE/hqdefault.jpg',
  },
  {
    id: 'coke-2026',
    no: '02',
    card: '2026 可口可乐真人广告',
    year: '2026',
    title: '2026｜重新拥抱真人拍摄',
    film: 'Enjoy Joy',
    desc: '可口可乐美国版圣诞广告重新选择真人实拍，展现家庭聚会、朋友相伴等温馨的节日场景。',
    embed: 'https://www.youtube.com/embed/DqV0bcaIzNc?rel=0',
    embeddable: true,
    watch: 'https://www.youtube.com/watch?v=DqV0bcaIzNc',
    watchLabel: '前往 YouTube 观看',
    cover: './assets/enjoy-joy-official.png',
  },
  {
    id: 'miniso-2026',
    no: '03',
    card: '名创优品「不扫兴的友情」',
    year: '2026',
    title: '名创优品｜不扫兴的友情',
    film: '不扫兴的友情',
    desc: '名创优品通过「友情提醒」趣味短片，把朋友之间的闲逛、猜价格、试玩玩具等日常互动变成一份不扫兴的友情指南。',
    embed: 'https://v.qq.com/txp/iframe/player.html?vid=e3375e2npn9',
    embeddable: true,
    watch: 'https://socialbeta.com/campaign/29044',
    watchLabel: '前往原平台查看',
    cover: './assets/miniso-friends.webp',
  },
];
