import {useState} from 'react';
import {TrainFront,Ticket as TicketIcon,RotateCcw} from 'lucide-react';
import {TrainTicket} from '../ui-refresh/TrainTicket';
import {createTicketId} from '../ui-refresh/ticketDetails';
import {useGame} from '../game/store';
import {art} from '../data/config';
import {letter} from '../data/dialogues';
import {Button,Hint,Complete} from '../components/ui';
import {sound} from '../utils/audio';
export function Invitation({onDepart,notify}:{onDepart:()=>void;notify:(s:string)=>void}){
 const game=useGame(s=>s.game);const stage=game.flags.includes('letter')?3:game.flags.includes('wax')?2:game.flags.includes('lifted')?1:0;const [back,setBack]=useState(false);const [chosen,setChosen]=useState(game.choices.letter||'');
 const choose=(label:string,response:string)=>{useGame.getState().choose('letter',label);setChosen(label);notify(response);};
 return <div className="invitation"><div className={`letter-object ${stage>1?'opened':''}`}><button className="envelope-object" onClick={()=>{sound('paper');if(stage===0)useGame.getState().flag('lifted');else if(stage===1)useGame.getState().flag('wax');else{useGame.getState().flag('letter');useGame.getState().collect('invitation');}}} aria-label={stage===0?'抬起信封':stage===1?'揭开火漆':'展开信纸'}><img src={art(back?'seal':'envelope')} alt={back?'信封背面的旧式印章':'带火漆的邀请信封'}/></button>{back&&<div className="envelope-back">G-07<br/><small>列车事务局 · 七日特邀</small><Complete>已收藏「旧式邀请印章」</Complete></div>}<button className="text-button" onClick={()=>{setBack(v=>!v);if(!back)useGame.getState().collect('seal','细节观察员');}}><RotateCcw size={16}/> 翻看信封{back?'正面':'背面'}</button></div>{stage<3?<div className="letter-instruction"><h3>{['有人把一封信，留在了这里。','火漆上，刻着一辆列车。','信封已经打开。'][stage]}</h3><p>{['点击信封，将它轻轻抬起。','再次点击信封，揭开火漆。','再点一下，展开信纸。'][stage]}</p><Button onClick={()=>{if(stage===0)useGame.getState().flag('lifted');else if(stage===1)useGame.getState().flag('wax');else{useGame.getState().flag('letter');useGame.getState().collect('invitation');}}}>{['拿起邀请函','揭开火漆','展开信纸'][stage]}</Button></div>:<div className="letter-paper"><p className="preline">{letter}</p><div className="choice-stack">{[{label:'仔细检查信封。',response:'你发现了背面的 G-07 编号，还有一枚旧式印章。'},{label:'既然列车在等我，那就出发。',response:'窗外，一声汽笛正好响起。'},{label:'这真的是一场恶作剧吗？',response:'你把怀疑一起装进了行李。或许旅途中会有答案。'}].map(c=><button key={c.label} className={chosen===c.label?'selected':''} onClick={()=>{choose(c.label,c.response);if(c.label.startsWith('仔细')){setBack(true);useGame.getState().collect('seal','细节观察员');}}}>{c.label}</button>)}</div><Button onClick={()=>{if(!chosen)useGame.getState().choose('letter','立即出发');onDepart();}}>收好邀请函，前往车站</Button></div>}</div>;
}
export function TicketView({back=false}:{back?:boolean}) {
 const game=useGame(s=>s.game);
 if(!game.ticket)return null;
 return <TrainTicket ticket={game.ticket} back={back} completedAt={game.completedAt} hasSpecialSeal={game.inventory.includes('seal')}/>;
}
export function TicketBuilder({onIssued}:{onIssued:()=>void}){
 const existing=useGame(s=>s.game.ticket);const [nickname,setNickname]=useState(''),[carriage,setCarriage]=useState<'A'|'B'|'C'>('A'),[seat,setSeat]=useState('01W'),[style,setStyle]=useState(0),[printing,setPrinting]=useState(false);
 if(existing)return <TicketView/>;
 return <div className="ticket-builder guided-ticket"><div className="ticket-welcome"><TrainFront/><div><h3>位置已经替你留好了。</h3><p>写上一个喜欢的名字，带着车票出发。</p></div></div><label className="nickname-label">车票上的名字<input autoComplete="nickname" value={nickname} maxLength={12} placeholder="鹅鹅旅客" onChange={e=>setNickname(e.target.value)}/></label><div className="ticket-prefs"><span>你想坐在</span>{[{id:'01W',name:'靠窗，看看沿途'},{id:'02A',name:'过道，听听故事'},{id:'03S',name:'惊喜座，随旅程安排'}].map((p,i)=><button key={p.id} className={seat===p.id?'selected':''} aria-pressed={seat===p.id} onClick={()=>{setSeat(p.id);setCarriage((['A','B','C']as const)[i]);}}>{p.name}</button>)}</div><details className="ticket-custom"><summary>再挑一个喜欢的票面</summary><div className="ticket-styles">{['午夜蓝','复古羊皮纸','余晖红棕'].map((name,i)=><button key={name} className={`theme-${i} ${style===i?'selected':''}`} aria-pressed={style===i} onClick={()=>setStyle(i)}><TicketIcon/><span>{name}</span></button>)}</div></details><Button disabled={printing} onClick={()=>{setPrinting(true);sound('success');useGame.getState().issue({nickname:nickname.trim()||'鹅鹅旅客',carriage,seat,style,id:createTicketId(),checked:false,issuedAt:new Date().toISOString()});onIssued();}}>{printing?'正在印制你的车票':'领取我的专属车票'}</Button><p className="ticket-note">G-07 · 七日特别旅程 · 一张属于你的纪念</p></div>;
}
export function CheckIn({onChecked,notify}:{onChecked:()=>void;notify:(s:string)=>void}) {
 const game=useGame(s=>s.game);
 const [selected,setSelected]=useState(true);
 const checkTicket=()=>{sound('stamp');useGame.getState().check();notify('');};
 return <div className="check-in guided-check">{game.ticket?<>
  <p className="ui-check-instructions">{game.ticket.checked?'车票已经盖好章，请收好随身携带。':'车票已为你准备好。点击检票按钮，或将车票拖至检票处。'}</p>
  <div className="ui-check-ticket" draggable onDragStart={e=>{e.dataTransfer.setData('text/plain','ticket');setSelected(true);}}><TicketView/></div>
  {game.ticket.checked?<>
   <div className="ui-check-result" role="status" aria-live="polite"><strong>✓ 检票成功 · 欢迎登车</strong><span>乘务员已盖下启程印章，站台就在前方。</span></div>
   <Button className="ui-check-continue" onClick={onChecked}>收好车票，走向站台</Button>
  </>:<>
   <button type="button" className={`button secondary ui-check-selection ${selected?'selected':''}`} aria-pressed={selected} onClick={()=>setSelected(v=>!v)}>{selected?'✓ 车票已准备好':'选择我的车票'}</button>
   <button type="button" className="machine-slot ticket-slot" onClick={()=>{if(!selected){notify('先选择车票，再点击检票按钮。');return;}checkTicket();}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(e.dataTransfer.getData('text/plain')==='ticket')checkTicket();}}>递上车票，请乘务员盖章</button>
   <Hint hints={['车票已经替你准备好。','直接点下方按钮，也可以将车票拖过去。','乘务员会替你盖下启程的印章。']} onSolve={checkTicket}/>
  </>}
 </>:<p>请先前往出票机领取车票。</p>}</div>;
}
