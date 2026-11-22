import type {CSSProperties} from 'react';
import {art} from '../data/config';
import type {Ticket} from '../game/model';
import {issueDate} from './ticketDetails';
import {ticketDesign} from './ticketDesign';
import {ticketPalette} from './ticketPalettes';
import {ticketLocomotive} from './ticketIllustration';
import './vintage-ticket.css';

type TrainTicketProps = {
  ticket: Ticket;
  back?: boolean;
  completedAt: string | null;
  hasSpecialSeal: boolean;
};

/** Presentation only: the existing store continues to own the ticket and its status. */
export function TrainTicket({ticket, back = false, completedAt, hasSpecialSeal}: TrainTicketProps) {
  const palette = ticketPalette(ticket.style);
  const colors = {
    '--ticket-paper': palette.paper, '--ticket-edge': palette.edge, '--ticket-light': palette.light,
    '--ticket-ink': palette.ink, '--ticket-muted': palette.muted, '--ticket-gold': palette.gold, '--ticket-line': palette.line,
    '--stub-paper': palette.stubPaper, '--stub-edge': palette.stubEdge, '--stub-ink': palette.stubInk, '--stub-muted': palette.stubMuted,
    '--ribbon-paper': palette.ribbon, '--ribbon-ink': palette.ribbonInk,
  } as CSSProperties;
  return (
    <article className={`ui-ticket ui-ticket--${ticket.style} ${back ? 'ui-ticket--back' : ''} ${ticket.checked ? 'ui-ticket--checked' : ''}`} style={colors} aria-label={back ? '车票背面，七日纪念印章' : '鹅铁U彩专属车票'}>
      <div className="ui-ticket__body">
        {back ? (
          <div className="ui-ticket__reverse">
            <span className="ui-ticket__kicker">A WEEK OF LITTLE STORIES</span>
            <h3>七日旅程 · 纪念印章</h3>
            <p>每一站的相遇，都是值得收藏的风景。</p>
            <div className="ui-ticket__stamps" aria-label="七日纪念印章">
              {Array.from({length: 7}, (_, i) => (
                <span key={i} className={i === 0 && completedAt ? 'is-stamped' : ''}>
                  {i === 0 && completedAt ? <img src={art('mark5')} alt="周一已盖章"/> : `D${i + 1}`}
                </span>
              ))}
            </div>
            <small>{completedAt ? '第一日记录已收藏' : '七段旅程，等待逐一收藏。'}</small>
          </div>
        ) : (
          <>
            <div className="ui-ticket__heading">
              <svg className="ui-ticket__watch" viewBox="0 0 60 112" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 0c-3 14 4 22 9 30M40 0c3 14-4 22-9 30M26 31h8v7h-8z"/>
                  <circle cx="30" cy="68" r="27"/><circle cx="30" cy="68" r="23"/><circle cx="30" cy="68" r="2"/>
                  <path d="M30 48v4m0 32v4M10 68h4m32 0h4M30 68l-7-9m7 9 11-6M15 53l3 3m24 24 3 3m0-30-3 3M18 80l-3 3"/>
                </g>
              </svg>
              <div className="ui-ticket__heading-center">
                <div className="ui-ticket__masthead"><span>ETIE UCAI</span></div>
                <h3>{ticketDesign.title}</h3>
                <p className="ui-ticket__ribbon">{ticketDesign.subtitle}</p>
              </div>
              <div className="ui-ticket__postmark" aria-hidden="true"><span>G-07</span><i>≋</i></div>
            </div>
            <div className="ui-ticket__landscape" aria-label={`从${ticketDesign.origin}出发，终点尚未揭晓`}>
              <div className="ui-ticket__route">
                <div className="ui-ticket__origin"><small>{ticketDesign.originLabel}</small><strong>{ticketDesign.origin}</strong></div>
                <div className="ui-ticket__destination"><small>{ticketDesign.destinationLabel}</small><span className="ui-ticket__destination-plate" aria-hidden="true"/></div>
              </div>
              <div className="ui-ticket__title-art" aria-hidden="true"><img src={ticketLocomotive} alt=""/></div>
            </div>
            <div className="ui-ticket__details">
              <div className="ui-ticket__traveller"><small>旅客 <span>PASSENGER</span></small><strong>{ticket.nickname}</strong></div>
              <div><small>车厢 <span className="ui-ticket__short-en">CAR</span></small><strong>{ticket.carriage}</strong></div>
              <div><small>座位 <span className="ui-ticket__short-en">SEAT</span></small><strong>{ticket.seat}</strong></div>
              <div className="ui-ticket__serial"><small>票号 <span>NO.</span></small><strong>{ticket.id}</strong></div>
            </div>
            <div className="ui-ticket__bottom">
              <span className="ui-ticket__date">▣ <span>出票日期 {issueDate(ticket.issuedAt)}</span></span>
              {hasSpecialSeal && <span className="ui-ticket__seal">✦ 特邀纪念</span>}
              <span className={`ui-ticket__status ${ticket.checked ? 'is-checked' : ''}`}>{ticket.checked ? '已检票' : '待检票'}</span>
            </div>
          </>
        )}
      </div>
      <div className="ui-ticket__stub" aria-hidden="true">
        <strong>✦ G-07 ✦</strong>
        <svg className="ui-ticket__stub-mountain" viewBox="0 0 150 48"><path d="M3 38c16-5 22-19 35-12 11-18 20-17 30-7C79 3 89 10 97 19c15-4 25 11 50 19M4 42h142" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
        <small className="ui-ticket__stub-title">ETIE<br/>UCAI</small>
        <span className="ui-ticket__barcode"/>
        <span className="ui-ticket__stub-limited">❧ 七日限定 ❧</span>
      </div>
    </article>
  );
}
