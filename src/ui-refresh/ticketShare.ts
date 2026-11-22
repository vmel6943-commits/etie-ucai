import type {GameState} from '../game/model';
import {issueDate} from './ticketDetails';
import {ticketDesign} from './ticketDesign';
import {ticketPalette} from './ticketPalettes';
import {ticketLocomotive} from './ticketIllustration';

function loadTrainArt(): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = ticketLocomotive;
  });
}

/** The PNG is drawn from the same dynamic ticket fields and palette as the page. */
export async function createTicketShare(game: GameState, options: {hideName: boolean}): Promise<Blob> {
  const ticket = game.ticket;
  if (!ticket) throw new Error('尚未领取车票');
  const canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 720;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('图片生成暂不可用');
  const theme = ticketPalette(ticket.style);
  const serif = 'Georgia, "Songti SC", "SimSun", serif';
  const sans = '"Microsoft YaHei", "PingFang SC", sans-serif';
  const text = (value: string, x: number, y: number, size: number, color: string = theme.ink, weight = 'normal', font = sans, maxWidth?: number) => {
    c.fillStyle = color; c.font = `${weight} ${size}px ${font}`; c.fillText(value, x, y, maxWidth);
  };
  const rule = (x1: number, y1: number, x2: number, y2: number) => {c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();};

  // The shaped corners and perforation evoke the reference's collectible ticket.
  const ticketOutline = () => {
    c.beginPath(); c.moveTo(84, 26); c.lineTo(1094, 26);
    c.quadraticCurveTo(1101, 67, 1144, 67); c.quadraticCurveTo(1186, 67, 1193, 26);
    c.lineTo(1356, 26); c.quadraticCurveTo(1364, 66, 1414, 76);
    c.lineTo(1414, 644); c.quadraticCurveTo(1364, 654, 1356, 694);
    c.lineTo(1193, 694); c.quadraticCurveTo(1186, 653, 1144, 653);
    c.quadraticCurveTo(1101, 653, 1094, 694); c.lineTo(84, 694);
    c.quadraticCurveTo(76, 654, 26, 644); c.lineTo(26, 76); c.quadraticCurveTo(76, 66, 84, 26); c.closePath();
  };
  c.save(); ticketOutline(); c.clip();
  const paper = c.createLinearGradient(0, 0, 1000, 720);
  paper.addColorStop(0, theme.light); paper.addColorStop(.4, theme.paper); paper.addColorStop(1, theme.edge);
  c.fillStyle = paper; c.fillRect(0, 0, 1440, 720);
  const stub = c.createLinearGradient(1144, 0, 1440, 720);
  stub.addColorStop(0, theme.stubPaper); stub.addColorStop(1, theme.stubEdge);
  c.fillStyle = stub; c.fillRect(1144, 0, 296, 720);
  c.globalAlpha = .035; c.strokeStyle = ticket.style === 1 ? '#58452d' : '#fff0d2'; c.lineWidth = 1;
  for (let y = -720; y < 720; y += 7) {c.beginPath(); c.moveTo(0, y); c.lineTo(1440, y + 720); c.stroke();}
  c.globalAlpha = 1;
  c.restore();
  ticketOutline(); c.strokeStyle = theme.gold; c.lineWidth = 5; c.stroke();
  c.strokeStyle = theme.gold; c.lineWidth = 1.5;
  c.strokeRect(54, 52, 1332, 616);
  c.globalAlpha = .55; c.strokeRect(62, 60, 1316, 600); c.globalAlpha = 1;
  c.setLineDash([5, 11]); rule(1144, 76, 1144, 644); c.setLineDash([]);

  // The watch, postmark and title remain decorative; passenger data stays live.
  c.strokeStyle = theme.gold; c.lineWidth = 2;
  c.beginPath(); c.moveTo(117, 55); c.lineTo(125, 137); c.lineTo(134, 55); c.stroke();
  c.beginPath(); c.arc(125, 183, 43, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(125, 183, 36, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(125, 155); c.lineTo(125, 161); c.moveTo(125, 205); c.lineTo(125, 211);
  c.moveTo(97, 183); c.lineTo(103, 183); c.moveTo(147, 183); c.lineTo(153, 183);
  c.moveTo(125, 183); c.lineTo(115, 171); c.moveTo(125, 183); c.lineTo(141, 173); c.stroke();
  rule(247, 102, 365, 102); rule(832, 102, 936, 102);
  c.textAlign = 'center';
  text('ETIE UCAI', 599, 111, 24, theme.gold, 'bold', serif);
  text(ticketDesign.title, 600, 205, 86, theme.ink, 'bold', serif, 690);
  c.fillStyle = theme.ribbon;
  c.beginPath(); c.moveTo(322, 228); c.lineTo(878, 228); c.lineTo(862, 251); c.lineTo(878, 274); c.lineTo(322, 274); c.lineTo(338, 251); c.closePath(); c.fill();
  text(ticketDesign.subtitle, 600, 260, 25, theme.ribbonInk, 'bold', serif, 500);
  c.save(); c.translate(1004, 171); c.rotate(-.16); c.strokeStyle = theme.gold; c.lineWidth = 3;
  c.beginPath(); c.arc(0, 0, 58, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.3; c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.stroke();
  text('G-07', 0, 9, 30, theme.gold, 'bold', serif); c.restore();
  c.textAlign = 'left';

  c.fillStyle = theme.ribbon; c.beginPath(); c.moveTo(94, 309); c.lineTo(235, 309);
  c.quadraticCurveTo(253, 309, 253, 327.5); c.quadraticCurveTo(253, 346, 235, 346);
  c.lineTo(94, 346); c.quadraticCurveTo(76, 346, 76, 327.5); c.quadraticCurveTo(76, 309, 94, 309); c.fill();
  text(ticketDesign.originLabel, 94, 334, 18, theme.ribbonInk, 'bold', sans);
  text(ticketDesign.origin, 76, 400, 48, theme.ink, 'bold', serif, 450);
  text(ticketDesign.destinationLabel, 76, 445, 18, theme.muted, 'bold', sans);
  // The destination plaque is intentionally blank, before and after check-in.
  c.fillStyle = '#d8b87822'; c.fillRect(220, 417, 220, 40);
  c.strokeStyle = theme.gold; c.lineWidth = 1.5; c.strokeRect(220, 417, 220, 40);
  c.globalAlpha = .55; c.strokeRect(226, 423, 208, 28); c.globalAlpha = 1;
  const train = await loadTrainArt();
  if (train) {
    c.save();
    if (ticket.style === 1 && 'filter' in c) c.filter = 'brightness(.48) sepia(.25)';
    c.drawImage(train, 548, 277, 555, 226);
    c.restore();
  }
  c.strokeStyle = theme.gold; c.lineWidth = 1.5; rule(76, 500, 1102, 500);
  const labelY = 534, valueY = 574;
  text('旅客  PASSENGER', 76, labelY, 17, theme.muted, 'bold');
  text('车厢  CAR', 380, labelY, 17, theme.muted, 'bold');
  text('座位  SEAT', 545, labelY, 17, theme.muted, 'bold');
  text('票号  NO.', 722, labelY, 17, theme.muted, 'bold');
  text(options.hideName ? '匿名旅客' : ticket.nickname, 76, valueY, 32, theme.ink, 'bold', serif, 265);
  text(ticket.carriage, 380, valueY, 35, theme.ink, 'bold', serif);
  text(ticket.seat, 545, valueY, 35, theme.ink, 'bold', serif);
  text(ticket.id, 722, valueY, 30, theme.ink, 'bold', serif, 340);
  c.globalAlpha = .7; rule(355, 520, 355, 580); rule(520, 520, 520, 580); rule(698, 520, 698, 580); rule(76, 598, 1102, 598); c.globalAlpha = 1;
  text('▣  出票日期  ' + issueDate(ticket.issuedAt), 76, 638, 22, theme.muted);
  if (game.inventory.includes('seal')) text('✦  特邀纪念', 716, 638, 21, theme.gold);
  c.save(); c.translate(1049, 633); c.rotate(-.17); c.strokeStyle = theme.gold;
  c.beginPath(); c.arc(0, 0, 36, 0, Math.PI * 2); c.stroke();
  c.setLineDash([3, 4]); c.beginPath(); c.arc(0, 0, 30, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
  c.textAlign = 'center'; text(ticket.checked ? '已检票' : '待检票', 0, 7, 20, theme.gold, 'bold', serif); c.restore();

  c.textAlign = 'center';
  text('✦ G-07 ✦', 1279, 151, 41, theme.stubInk, 'bold', serif);
  c.strokeStyle = theme.stubInk; c.globalAlpha = .7;
  c.beginPath(); c.moveTo(1185, 245); c.quadraticCurveTo(1215, 212, 1235, 232); c.quadraticCurveTo(1265, 190, 1292, 224); c.quadraticCurveTo(1322, 211, 1370, 245); c.stroke();
  rule(1190, 253, 1368, 253); c.globalAlpha = 1;
  text('ETIE', 1279, 303, 19, theme.stubInk, 'bold', serif);
  text('UCAI', 1279, 331, 19, theme.stubInk, 'bold', serif);
  text('G-07', 1279, 359, 19, theme.stubInk, 'bold', serif);
  c.fillStyle = theme.stubInk;
  let x = 1200;
  for (let i = 0; i < 45; i++) {const width = i % 7 === 0 ? 4 : i % 3 === 0 ? 2 : 1; c.fillRect(x, 395, width, 87); x += width + (i % 4 === 0 ? 4 : 2);}
  text('❧  七日限定  ❧', 1279, 558, 23, theme.stubInk, 'bold', serif);

  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片导出失败')), 'image/png'));
}
