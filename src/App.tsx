import {useEffect,useLayoutEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {Briefcase, Sparkles, Ticket, TrainFront,Map,Users,BookOpen,Backpack,Settings as SettingsIcon,Volume2,VolumeX,Lightbulb,Check,Save,X,ChevronLeft} from 'lucide-react';
import {useGame,saveUnavailable} from './game/store';
import {has,task,type SceneId} from './game/model';
import {scenes,art,itemData,navigation,characters} from './data/config';
import {dialogues,type DialogueSpec} from './data/dialogues';
import {Dialogue} from './components/Dialogue';
import {Button,Modal} from './components/ui';
import {Inventory,JourneyMap,Characters,Journal,Sharing,Settings,HistoryPanel} from './components/Systems';
import {Invitation,TicketBuilder,TicketView,CheckIn} from './scenes/Boarding';
import {Report,Suitcase} from './scenes/Investigation';
import {MemoryRecord,Cooking,BroadcastCorner,Telescope,OldPhoto,Cabinet,FinishDay} from './scenes/Exploration';
import {sound,unlockAudio,configureSound} from './utils/audio';
import {Music,MusicStatus,useMusic} from './components/Music';
import {boardingAction,previousScene,dialogueBelongsToScene,type DialogueContext} from './game/presentation';
import type {ShareKind} from './utils/share';
import {crewCredit,journeyTitle,trainNumber} from './data/identity';
import {objectIcons,primaryObject} from './components/SceneGuidance';
import {CokeMaterial,CokeMaterialTray,cokeHotspots,cokeMaterialDone,type CokeMaterialId} from './scenes/CokeMaterials';
import {CokeVote} from './scenes/CokeVote';
import {MysterySignal} from './scenes/MysterySignal';
import {canReflect,canExplore,canReceiveHiddenPhoto} from './game/investigation';
import {informantAction,platformAction,workbenchAction,reportCloseTarget,needsExplorationIntro,INVESTIGATION_COMPLETE} from './game/flow';
type Panel='cokeMaterial'|'letter'|'machine'|'ticketBuilder'|'ticket'|'check'|'map'|'inventory'|'characters'|'journal'|'settings'|'history'|'report'|'suitcase'|'voteFinal'|'cassette'|'memory'|'cook'|'radio'|'telescope'|'photo'|'cabinet'|'finish'|'share';
const panelNames:Record<Panel,string>={cokeMaterial:'皮箱里的情报',letter:'事务局来信',machine:'黄铜机械出票机',ticketBuilder:'定制你的专属车票',ticket:'我的七日旅程车票',check:'正式检票',map:'七日旅途地图',inventory:'我的行囊',characters:'神秘乘客与列车伙伴',journal:'第一日旅行手账',settings:'旅程设置',history:'旅途对话记录',report:'列车专报',suitcase:'神秘情报贩子的情报皮箱',voteFinal:'调查后的判断',cassette:'旧式录音磁带',memory:'记录首日见闻',cook:'夜行餐车制作台',radio:'听听列车广播',telescope:'望远镜',photo:'一张列车旧照片',cabinet:'观景走廊的纪念柜',finish:'完成第一日记录',share:'印制旅程纪念卡'};
interface StageProps {
  sceneId: SceneId;
  onHotspot: (id:string) => void;
  hints: boolean;
  locked: boolean;
  onGuide: () => void;
  guideLabel: string | null;
}

function SceneStage({sceneId,onHotspot,hints,locked,onGuide,guideLabel}: StageProps) {
  const game=useGame(state=>state.game);
  const scene=scenes[sceneId];
  const target=primaryObject(game);
  const box=useRef<HTMLDivElement>(null);
  const [mobile,setMobile]=useState(matchMedia('(max-width: 700px)').matches);
  const [size,setSize]=useState({width:0,height:0});
  const [assetError,setAssetError]=useState(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>setAssetError(false),[sceneId,mobile]);

  useEffect(()=>{
    const query=matchMedia('(max-width: 700px)');
    const update=()=>setMobile(query.matches);
    query.addEventListener('change',update);
    const observer=new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;
      setSize({width,height});
    });
    if(box.current) observer.observe(box.current);
    return ()=>{
      observer.disconnect();
      query.removeEventListener('change',update);
    };
  },[]);

  function recorded(id:string) {
    if(sceneId==='workbench') return cokeMaterialDone(game,cokeHotspots[id]?.id);
    if(sceneId==='carriage') return id==='route'&&has(game,'map-seen')||id==='journal'&&game.inventory.includes('notebook');
    if(sceneId==='desk') return id==='envelope'&&has(game,'letter');
    if(sceneId==='dining') return id==='cook'&&game.meals.length>0||id==='memory'&&!!game.memory||id==='menu'&&game.inventory.includes('menu');
    if(sceneId==='radio') return id==='radio'&&has(game,'broadcast');
    return has(game,'explored:'+sceneId+':'+id);
  }

  const imageKey=scene.art+(mobile?'Mobile':'');
  const ratio=mobile?9/16:16/9;
  const width=Math.min(size.width,size.height*ratio);
  const height=width/ratio;
  return (
    <div className={`scene-stage scene-${sceneId} act-${scene.act} ${locked?'stage-locked':''} ${hints?'show-hints':''}`} ref={box}>
      <div className="scene-blur" style={{backgroundImage:`url(${art(imageKey)})`}}/>
      <div className="art-board" style={{width:width||'100%',height:height||'100%'}}>
        <img key={imageKey} className="scene-art" src={art(imageKey)+(attempt?'?retry='+attempt:'')} onError={()=>setAssetError(true)} onLoad={()=>setAssetError(false)} alt={scene.title} fetchPriority="high" draggable={false}/>
        {assetError&&<div className="scene-load-error" role="status"><p>这幅旅途风景暂时没有加载完成。</p><Button onClick={()=>{setAssetError(false);setAttempt(value=>value+1);}}>重新加载场景</Button></div>}
        <div className="scene-atmosphere"/>
        <div className="scene-vignette"/>
        <div className="scene-frame" aria-hidden="true"><i/><i/><i/><i/></div>
        {!locked && scene.hotspots.filter(spot=>!(sceneId==='workbench'&&spot.id==='evidence')).map(spot=>{
          const main=target===spot.id && !!guideLabel;
          const seen=recorded(spot.id);
          const Icon=objectIcons[spot.id] || (spot.id==='spy'&&sceneId==='carriage'?Briefcase:undefined);
          const position={left:(mobile?spot.mx:spot.x)+'%',top:(mobile?spot.my:spot.y)+'%'} as CSSProperties;
          const spotLabel=sceneId==='workbench'?cokeHotspots[spot.id]?.label||spot.label:spot.label;
          return (
            <button
              key={spot.id}
              type="button"
              className={`hotspot hotspot-${spot.id} ${main?'hotspot-primary':''} ${(mobile?spot.mx:spot.x)>75?'hotspot-edge-right':''} ${(mobile?spot.mx:spot.x)<23?'hotspot-edge-left':''} ${seen&&!main?'hotspot-done':''}`}
              style={position}
              onClick={main?onGuide:()=>onHotspot(spot.id)}
              aria-label={spotLabel} aria-description={seen?'已记录':undefined}
            >
              <span className="hotspot-ring">
                {seen&&!main?<Check size={13}/>:Icon?<Icon size={main?18:15}/>:<span/>}
              </span>
              <span className="hotspot-label">{spotLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App(){
 const g=useGame(s=>s.game);const navigate=useNavigate(),location=useLocation();const sceneId=scenes[g.scene]?g.scene:'desk';const scene=scenes[sceneId];
 const [overlay,setOverlay]=useState<{panel:Panel;scene:SceneId}|null>(null),[dialogue,setDialogue]=useState<({spec:DialogueSpec;after?:()=>void}&DialogueContext)|null>(null),[toast,setToast]=useState(''),[hints,setHints]=useState(false),[back,setBack]=useState(false),[shareKind,setShareKind]=useState<ShareKind>('ticket'),[storageError,setStorageError]=useState(saveUnavailable());
 const [coverPreview,setCoverPreview]=useState(false);
 const worldRef=useRef<HTMLElement>(null), controlsRef=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const controls=controlsRef.current, world=worldRef.current;
  if(!controls||!world)return;
  const measure=()=>world.style.setProperty('--scene-dock', controls.children.length ? `${controls.getBoundingClientRect().height+24}px` : '0px');
  const observer=new ResizeObserver(measure);
  observer.observe(controls);measure();
  return()=>observer.disconnect();
 },[g.scene,coverPreview,g.started,overlay,dialogue]);
 const [cokeMaterial,setCokeMaterial]=useState<CokeMaterialId>('film');
 const showCover=!g.started||coverPreview;
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),epoch=useRef(0);const music=useMusic();
 const panel=overlay?.scene===sceneId?overlay.panel:null;
 const activeDialogue=dialogueBelongsToScene(dialogue,sceneId,epoch.current)?dialogue:null;
 function setPanel(value:Panel|null){setOverlay(value?{panel:value,scene:useGame.getState().game.scene}:null);}
 /** 只收起对白，不执行它带的后继（画内返回、换场景时使用） */
 function closeDialogue(){epoch.current++;setDialogue(null);}
 /**
  * 结束一段对白。finish 与“跳过”都走这里，保证「收起对白」不会吞掉后续衔接：
  * 以前点 X 只是关掉文字，于是开场不会自动弹邀请函、大厅不会自动接下一步。
  */
 function endDialogue(runAfter:boolean){
  const current=dialogue;
  if(!current)return;
  if(!dialogueBelongsToScene(current,useGame.getState().game.scene,epoch.current)){setDialogue(null);return;}
  epoch.current++;
  setDialogue(null);
  if(runAfter)current.after?.();
 }
 function dismissDialogue(){endDialogue(true);}

 const notify=(message:string)=>{setToast(message);clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),Math.min(15000,Math.max(5600,message.length*110)));};
 function go(id:SceneId){if(scenes[id].act===3&&!canExplore(useGame.getState().game)){notify('先完成五项情报任务并收好最终判断，再继续夜行。');return;}setCoverPreview(false);epoch.current++;setOverlay(null);setDialogue(null);setToast('');useGame.getState().go(id);navigate('/scene/'+id);sound('paper');}
 const close=()=>setPanel(null);
 function talk(id:string,after?:()=>void,override?:Partial<DialogueSpec>){const original=dialogues[id];setPanel(null);setDialogue({spec:{...original,...override},after,scene:useGame.getState().game.scene,epoch:epoch.current});}
 function share(kind:ShareKind){setShareKind(kind);setPanel('share');}
 function openCokeMaterial(id:CokeMaterialId){setCokeMaterial(id);setPanel('cokeMaterial');}
 const remember=(id:string,text:string,achievement?:string)=>{useGame.getState().collect(id,achievement);notify(text);};
 useEffect(()=>{const requested=location.pathname.split('/scene/')[1] as SceneId;const current=useGame.getState().game;
  if((scenes[requested]?.act===3||scenes[current.scene]?.act===3)&&!canExplore(current)){const target=has(current,'boarded')?'workbench':'desk';epoch.current++;setOverlay(null);setDialogue(null);useGame.getState().go(target);navigate('/scene/'+target,{replace:true});return;}
  if(requested&&scenes[requested]&&(current.unlocked.includes(requested)||canExplore(current)&&navigation.some(n=>n.id===requested))){
   if(requested!==current.scene){epoch.current++;setOverlay(null);setDialogue(null);setToast('');useGame.getState().go(requested);}
  }else if(location.pathname!=='/scene/'+current.scene)navigate('/scene/'+current.scene,{replace:true});
 },[location.pathname]);
 useEffect(()=>{setDialogue(current=>current&&current.scene!==sceneId?null:current);setOverlay(current=>current&&current.scene!==sceneId?null:current);},[sceneId]);
 useEffect(()=>{const current=useGame.getState().game;if(!has(current,'story-v2'))useGame.getState().update(g=>({flags:[...g.flags,'story-v2'],settings:{...g.settings,muted:g.choices['sound-user-choice']==='muted',volume:g.settings.volume===.35?.55:g.settings.volume}}));},[]);
 useEffect(()=>{const fn=()=>setStorageError(true);window.addEventListener('save-error',fn);return()=>window.removeEventListener('save-error',fn);},[]);
 useEffect(()=>{const next={desk:'station',station:'hall',hall:'machine',machine:'platform',gate:'platform',platform:'carriage',carriage:'informant',informant:'workbench',workbench:'passenger',passenger:'dining',corridor:'radio',dining:'journal',radio:'journal',journal:'journal',end:'journal'}[sceneId];const img=new Image();img.src=art(next+(matchMedia('(max-width: 700px)').matches?'Mobile':''));},[sceneId]);
 function openMap(){if(!has(g,'boarded')){notify('登车后，七日路线图会为你展开。');return;}setPanel('map');}
 function begin(){unlockAudio();if(g.started){setCoverPreview(false);return;}useGame.getState().update(()=>({started:true}));talk('welcome',()=>setPanel('letter'),{endLabel:'拆开邀请函'});}
 function openTicket(){useGame.getState().flag('briefed');useGame.getState().flag('machine');go('machine');setPanel(useGame.getState().game.ticket?'ticket':'ticketBuilder');}
 function introduceAttendant(){const current=useGame.getState().game;talk('attendant',()=>{useGame.getState().flag('briefed');if(!useGame.getState().game.ticket)openTicket();},{endLabel:current.ticket?'继续旅程':'领取我的车票'});}
 function meetInformant(){go('informant');const current=useGame.getState().game;talk('spy',()=>setPanel('report'),{endLabel:'打开列车专报',...(current.inventory.includes('tag')?{lines:['你已经看过我的行李牌了？看来，我们早就打过照面。我是神秘情报贩子。',...dialogues.spy.lines.slice(1)]}:{})});}
 function guidedContinue(){unlockAudio();switch(sceneId){
  case 'desk':if(has(g,'letter'))go('station');else setPanel('letter');break;
  case 'station':talk('welcome',()=>{go('hall');introduceAttendant();},{id:'station-broadcast',lines:['前往七日旅程的旅客请注意，G-07列车即将启程。','大厅里的乘务员已经替你留好了位置。欢迎搭乘鹅铁U彩。'],endLabel:'走进大厅'});break;
  case 'hall':if(!has(g,'briefed'))introduceAttendant();else if(!g.ticket)openTicket();else if(g.ticket.checked)go('platform');else{go('gate');setPanel('check');}break;
  case 'machine':if(g.ticket){go('gate');setPanel('check');}else openTicket();break;
  case 'gate':if(!g.ticket)openTicket();else if(g.ticket.checked)go('platform');else setPanel('check');break;
  case 'platform':{const action=platformAction(g);
   if(action==='check'){go('gate');setPanel('check');break;}
   if(action==='carriage'){go('carriage');break;}
   useGame.getState().flag('boarded');useGame.getState().collect('notebook');go('carriage');
   talk('boarded',()=>{useGame.getState().flag('map-seen');setPanel('map');},{endLabel:'展开旅途地图'});break;}
  case 'carriage':if(!has(g,'map-seen')){useGame.getState().flag('map-seen');openMap();}else meetInformant();break;
  case 'informant':{const informant=informantAction(g);
   if(informant==='report')setPanel('report');
   else if(informant==='suitcase')setPanel('suitcase');
   else go('workbench');break;}
  case 'workbench':enterAttendantScene();break;
  case 'journal':setPanel('finish');break;
  default:go('journal');setPanel('journal');break;
 }}
 function goBack(){closeDialogue();setOverlay(null);setToast('');if(previousScene[sceneId])go(previousScene[sceneId]!);else if(scene.act===3)go('passenger');}

 function startExploring(){
  const current=useGame.getState().game;
  if(!canExplore(current)){close();notify('五项任务和最终判断收好后，就能继续夜行。');return;}
  // 已经走过一次收尾：直接回夜行车厢，不再重播迎接对白，也不重复领取调查记录。
  if(!needsExplorationIntro(current)){go('passenger');return;}
  useGame.getState().collect('investigation','列车调查员');
  useGame.getState().collect('notebook');
  useGame.getState().flag(INVESTIGATION_COMPLETE);
  talk('afterInvestigation',()=>{go('passenger');talk('nightWelcome',undefined,{endLabel:'自由逛逛列车'});},{endLabel:'去见夜行车厢的乘务员'});
 }

 function enterAttendantScene(){
  const current=useGame.getState().game;
  const action=workbenchAction(current);
  if(action==='explore'){startExploring();return;}
  if(action==='vote'){setPanel('voteFinal');return;}
  if(action==='report'){setPanel('report');notify('请先在可口可乐专报中补记判断，再回来收尾。');return;}
  notify('五项情报任务可以按任意顺序完成，全部完成后再进入下一场景。');
 }
 function hot(id:string){
  if(!g.started){begin();return;}if(activeDialogue)return;unlockAudio();sound(id==='bell'?'bell':'click');useGame.getState().flag('explored:'+sceneId+':'+id);
  switch(sceneId){
   case 'desk':if(id==='envelope')setPanel('letter');else if(id==='watch')remember('watch','怀表停在23:47。离发车，还有一刻钟。');else if(id==='paper')notify('报纸露出半行标题：“一支圣诞广告，怎么传成了全面停用AI？” 登车后，也许能找到更完整的消息。');break;
   case 'station':if(id==='door')guidedContinue();else if(id==='sign')notify('G-07 列车站。站房的灯正为你亮着。');else if(id==='clock')notify('时钟指向23:47。列车会等每一位受邀的旅客。');else notify('远处的车门边，有一道提着巨大皮箱的人影。');break;
   case 'hall':if(id==='bell'){
    const count=Number(g.choices.bell||0)+1;useGame.getState().choose('bell',String(count));if(count===3)remember('fragment','“再敲一次，我就要把铃铛借给你了。” 获得「铃铛召唤师」纪念。','铃铛召唤师');
    if(!has(g,'briefed'))introduceAttendant();else talk('attendant',undefined,{id:'attendant-return',lines:[g.ticket?`${g.ticket.nickname}，你的座位在${g.ticket.carriage}车厢${g.ticket.seat}。收好车票，沿着灯光走，就能看见站台。`:'位置已经替你留好了。给车票写上一个喜欢的名字，随时可以出发。'],endLabel:g.ticket?'继续旅程':'去领取车票',choices:undefined});
   }else if(id==='machine')openTicket();else if(id==='bench')remember('fragment','小册子里夹着一页手账：“有些消息，需要翻过一页再读。”');else if(id==='luggage')remember('tag','行李牌上写着：神秘情报贩子。箱子里，似乎有纸张和旧机器碰撞的声音。');else if(id==='route')notify('七条线路的轮廓里，周一这一站亮着。登车后，路线图会为你展开。');else if(id==='gate'){if(!g.ticket)openTicket();else{go('gate');setPanel('check');}}break;
   case 'machine':if(id==='back')go('hall');else if(id==='handle')remember('receipt','你轻轻拉了一下手柄，机器送出一句留言：“欢迎好奇的人登车。”','机械好奇心');else openTicket();break;
   case 'gate':if(id==='back')go('hall');else if(!g.ticket)openTicket();else setPanel('check');break;
   case 'platform':if(id==='board')guidedContinue();else if(id==='lookback')notify('候车大厅的灯仍然亮着。你的座位已经在车上等你。');else notify(g.inventory.includes('tag')?'你认出了行李牌的主人：神秘情报贩子。':'一位戴礼帽的旅客提着巨大的皮箱，转身走进车厢。');break;
   case 'carriage':if(id==='route'){useGame.getState().flag('map-seen');openMap();}else if(id==='journal'){useGame.getState().collect('notebook');talk('journal',()=>setPanel('journal'));}else meetInformant();break;
   case 'informant':if(id==='talk')talk('spy',undefined,g.inventory.includes('tag')?{lines:['从候车大厅的行李牌，就追到我这里了？请坐，老相识。',...dialogues.spy.lines.slice(1)]}:undefined);else if(id==='report')setPanel('report');else if(id==='case'){const action=informantAction(g);if(action==='report'){notify('先读《列车专报》中的可口可乐情报，留下初次判断并展开完整消息。');return;}if(action==='suitcase')setPanel('suitcase');else go('workbench');}else setPanel('cassette');break;
   case 'workbench':{const item=cokeHotspots[id];if(item)openCokeMaterial(item.id);break;}   case 'passenger':if(id==='seat')notify(`${g.ticket?.nickname}，欢迎回到${g.ticket?.carriage}车厢${g.ticket?.seat}。${g.ticket?.seat.includes('W')?'这是你选的靠窗座，月光落在小桌板上。':g.ticket?.seat.includes('S')?'这是你的惊喜座，桌上多了一张欢迎卡。':'过道很安静，餐车的香气正飘过来。'}`);else if(id==='light'){useGame.getState().choose('light',g.choices.light==='off'?'on':'off');notify(g.choices.light==='off'?'阅读灯重新亮起。':'阅读灯暗了下来，窗外的月光更清楚了。');}else if(id==='rack')remember('broadcastTag','行李架上找到广播识别牌：频道 G-07，清晰频率在94附近。');else if(id==='table')notify(g.flags.includes('tracking-done')?'神秘情报贩子的留言：“你把四份消息都读完了，也给自己的判断留出了时间。”':'旅客留言：“你今天愿意带走一个答案，还是一个更好的问题？”');else if(id==='oldticket')remember('oldticket','座位下，有张没有姓名的旧车票。带到餐车给乘务鹅看看吧。');else if(id==='gramophone'){if(!g.inventory.includes('needle'))notify('留声机缺少唱针。试着去观景走廊的窗台看看。');else{remember('record','你安装了唱针，旧录音响起：“列车收藏的是相遇与倾听。”','列车往事');sound('success');}}break;
   case 'corridor':if(id==='telescope')setPanel('telescope');else if(id==='photo')setPanel('photo');else if(id==='cabinet')setPanel('cabinet');else if(id==='needle')remember('needle','窗台上，一根旧唱针静静反光。可以安装到乘客车厢的留声机。');else{remember('postcard','隧道里的暗影过去了，一条月光照亮的河流重新出现。已收藏夜间风景明信片。','夜景收藏家');useGame.getState().flag('tunnel');}break;
   case 'dining':if(id==='memory')setPanel('memory');else if(id==='cook')setPanel('cook');else if(id==='menu')remember('menu','你发现了一本秘密菜单，乘务鹅私藏款已解锁。','餐车寻味家');else if(id==='oldticket'){
    if(!g.inventory.includes('oldticket'))notify('乘务鹅说：“有人在座位下发现过旧车票，也许你可以去看看。”');else{useGame.getState().flag('oldticket-shown');talk('attendant',undefined,{id:'oldticket',lines:['这张票没有名字，却被一个人收藏了很久。','也许他想把位置留给下一位愿意听故事的人。你可以把它好好收进手账。'],choices:undefined});}
   }break;
   case 'radio':if(id==='radio')setPanel('radio');else if(id==='manual')notify('设备手册：频道与列车编号一致。频率94附近最清晰。三段广播都可以直接点开，不用排列顺序。');else talk('spy',undefined,{id:'spy-hidden',lines:[has(g,'broadcast')?'你已经听过广播了？下一站的旅客，也有一件想和大家讨论的事。':'收音机已经接好了 G-07 频道，三段预告都可以直接听。',canReceiveHiddenPhoto(g)?'你查阅了四份新闻，也收好了神秘电波。这张旧照片，送给愿意听完整故事的人。':'皮箱里还有没打开的档案。明天，会有新的消息。'],choices:[{label:'以后还能遇见你吗？',response:'只要有人愿意把不同的材料放在一起看，我想我们总会再见。'},{label:'皮箱里还有什么？',response:'一些旧票、几段录音，还有暂时不着急讲完的故事。'}]});if(id==='spy'&&canReceiveHiddenPhoto(g)){useGame.getState().collect('photo','情报贩子的信任');useGame.getState().flag('hidden-photo-gift');}break;
   case 'journal':if(id==='stamp')setPanel('finish');else setPanel('journal');break;
   case 'end':if(id==='share')share('day');else setPanel('journal');break;
  }
 }
 function finishDialogue(){const current=dialogue;if(!current)return;useGame.getState().flag('read:'+current.spec.id);endDialogue(true);}
 function showHint(){setHints(v=>!v);if(!hints)notify(task(g));}
 function contents():ReactNode{
  switch(panel){
   case 'letter':return <Invitation onDepart={()=>go('station')} notify={notify}/>;
   case 'machine':return <TicketBuilder onIssued={()=>setPanel('ticket')}/>;
   case 'ticketBuilder':return <TicketBuilder onIssued={()=>{sound('success');setPanel('ticket');notify('你的车票已经印好。让乘务员盖一枚章，就能登车了。');}}/>;
   case 'ticket':return <div className="center"><div className="ticket-reveal"><TicketView back={back}/></div><div className="actions"><Button secondary onClick={()=>setBack(v=>!v)}>翻看{back?'正面':'背面'}</Button><Button secondary onClick={()=>share('ticket')}>保存车票图片</Button>{!g.ticket?.checked&&<Button onClick={()=>{go('gate');setPanel('check');}}>前往检票口</Button>}</div></div>;
   case 'check':return <CheckIn onChecked={()=>go('platform')} notify={notify}/>;
   case 'report':return <Report onClose={(topicId)=>{if(reportCloseTarget(useGame.getState().game,topicId)==='suitcase')setPanel('suitcase');else close();}}/>;
   case 'suitcase':return <Suitcase cokeMode onOpen={()=>{const coke=has(useGame.getState().game,'coke-truth-revealed');go('workbench');if(!coke)notify('神秘情报贩子打开了皮箱。想先看哪一份材料，由你决定。');}} notify={notify}/>;
   case 'cokeMaterial':return <CokeMaterial id={cokeMaterial} onClose={close}/>;
   case 'voteFinal':return <CokeVote mode="final" onDone={()=>{if(canExplore(useGame.getState().game))startExploring();else close();}}/>;
   case 'cassette':return <MysterySignal/>;
   case 'memory':return <MemoryRecord onDone={()=>{setPanel('cook');notify('首日见闻已写入手账。现在可以制作一款专属美食。');}}/>;
   case 'cook':return <Cooking onShare={()=>share('food')} notify={notify}/>;
   case 'radio':return <BroadcastCorner notify={notify}/>;
   case 'telescope':return <Telescope notify={notify}/>;
   case 'photo':return <OldPhoto/>;
   case 'cabinet':return <Cabinet notify={notify}/>;
   case 'finish':return <FinishDay onFinish={()=>talk('ending',()=>go('end'))}/>;
   case 'inventory':return <Inventory onTicket={()=>setPanel('ticket')} notify={notify}/>;
   case 'map':return <JourneyMap go={go} onClose={close}/>;
   case 'characters':return <Characters/>;
   case 'journal':return <Journal onShare={share} onFinish={()=>setPanel('finish')}/>;
   case 'share':return <Sharing kind={shareKind} notify={notify}/>;
   case 'settings':return <Settings notify={notify} onCover={()=>{close();closeDialogue();setCoverPreview(true);}} onReset={()=>{epoch.current++;setDialogue(null);useGame.getState().reset();close();navigate('/scene/desk');setToast('');}}/>;
   case 'history':return <HistoryPanel/>;
   default:return null;
  }
 }
 const navUnlocked=has(g,'boarded');
 const informantGuide=informantAction(g)==='report'?'阅读可口可乐专报':informantAction(g)==='suitcase'?'请神秘情报贩子打开皮箱':'去情报工作台翻阅材料';
 const guideLabel=boardingAction(g)||(sceneId==='informant'?informantGuide:sceneId==='workbench'?(canExplore(g)?'去列车里逛逛':canReflect(g)?'记录最终判断':null):sceneId==='journal'&&!g.completedAt?'把今晚收藏进手账':null);
 return <main className={`game ${panel?'has-panel':''} ${g.settings.reducedMotion?'reduced-motion':''} ${activeDialogue?'has-dialogue':''} ${guideLabel?'guide-available':''} ${g.choices.light==='off'&&sceneId==='passenger'?'lights-off':''} ${has(g,'tunnel')&&sceneId==='corridor'?'tunnel-passed':''}`} onPointerDownCapture={()=>{if(g.started)unlockAudio();}}><Music scene={showCover?'desk':sceneId} dialogue={!!activeDialogue}/>
  <header className="topbar" inert={!!panel}><button className="brand" onClick={()=>{if(navUnlocked)openMap();else notify(`《${journeyTitle}》 · ${crewCredit}`);}} aria-label={journeyTitle}><span className="brand-emblem"><TrainFront aria-hidden="true"/></span><span className="brand-name">{journeyTitle}<small>{trainNumber} · ETIE UCAI</small></span></button><div className="chapter-marker"><span>{['第一幕','第二幕','第三幕'][scene.act-1]}</span><i/>{['午夜发车前','皮箱里的热点情报','夜行列车奇遇记'][scene.act-1]}</div><div className="header-actions"><MusicStatus/><span className={`saved-status ${storageError?'save-warning':''}`} title={storageError?'保存不可用，请导出存档':'进度自动保存'}><Save size={13}/><span>{storageError?'请导出存档':'已保存'}</span></span><button className="icon-button" aria-label="我的行囊" onClick={()=>setPanel('inventory')}><Backpack/><span className="item-count">{g.inventory.length}</span></button><button className="icon-button" aria-label={g.settings.muted?'开启配乐':'静音配乐'} title={g.settings.muted?'开启场景配乐':'关闭场景配乐'} onClick={()=>{const muted=!g.settings.muted;useGame.getState().choose('sound-user-choice',muted?'muted':'enabled');useGame.getState().update(g=>({settings:{...g.settings,muted}}));configureSound(muted,g.settings.volume);if(!muted)unlockAudio();}}>{g.settings.muted?<VolumeX/>:<Volume2/>}</button><button className="icon-button" aria-label="旅程设置" onClick={()=>setPanel('settings')}><SettingsIcon/></button></div></header>
  <section inert={!!panel} ref={worldRef} className={`world ${showCover?'world-cover':''} ${sceneId==='workbench'?'world-investigation':''} ${sceneId==='workbench'&&!showCover?'world-with-tray':''}`}>
    <SceneStage sceneId={showCover?'desk':sceneId} onHotspot={hot} hints={hints} locked={!!activeDialogue||!!panel||showCover} onGuide={guidedContinue} guideLabel={guideLabel}/>
    <div className="world-shade"/>
    {!showCover&&!activeDialogue&&
      <div className={`scene-caption ${previousScene[sceneId]?'caption-after-back':''}`}>
        <span className="eyebrow"><i aria-hidden="true"/>{['启程','调查','夜行'][scene.act-1]} · {trainNumber}</span>
        <h1>{scene.title}</h1>
        {sceneId!=='workbench'&&<p>{scene.subtitle}</p>}
      </div>
    }
    {showCover&&
      <div className="opening">
        <p className="opening-credit">{crewCredit} 呈现</p>
        <h1 aria-label={journeyTitle}>{journeyTitle}</h1>
        <div className="opening-route" aria-label="从周一开往周日"><span>周一</span><i aria-hidden="true"/><span>周日</span></div>
        <p className="opening-copy">午夜发车，开往一周的最后一天。<br/>桌上那封盖着火漆的信，是为你留下的。</p>
        <button type="button" className="cover-ticket" onClick={begin}>
          <Ticket size={23} aria-hidden="true"/>
          <span>{g.started?'继续我的旅程':'开启旅程'}</span>
          <b>{trainNumber}</b>
        </button>
      </div>
    }
  {!showCover&&sceneId==='end'&&!activeDialogue&&<div className="ending-card"><span className="eyebrow">DAY 01 / COLLECTED</span><h2>今夜，值得收藏。</h2><p>{g.ticket?.nickname}，你的第一日旅程已盖章。<br/>下一站的故事，等待揭晓。</p><div className="actions"><Button onClick={()=>share('day')}>分享今日旅程</Button><Button secondary onClick={()=>go('passenger')}>回到列车继续探索</Button></div></div>}
  {!showCover&&previousScene[sceneId]&&!panel&&<button className="scene-back" onClick={goBack} aria-label="返回上一场景"><ChevronLeft size={16}/><span>返回</span></button>}
  <div ref={controlsRef} className="scene-controls">
  {!showCover&&guideLabel&&sceneId!=='workbench'&&!activeDialogue&&!panel&&
    <div className="journey-cue">
      <div className="journey-cue-copy"><Sparkles size={17} aria-hidden="true"/><p>{task(g)}</p></div>
      <button type="button" className="story-guide" onClick={guidedContinue}>
        <span><small>下一步</small><strong>{guideLabel}</strong></span>
        <Ticket size={21} aria-hidden="true"/>
      </button>
    </div>
  }
  {!showCover&&sceneId==='workbench'&&!activeDialogue&&!panel&&<CokeMaterialTray game={g} onOpen={openCokeMaterial} onNext={enterAttendantScene} onBack={()=>{go('informant');setPanel('suitcase');}}/>}

  {!showCover&&canExplore(g)&&!activeDialogue&&!panel&&scene.act===3&&sceneId!=='end'&&<><p className="exploration-help">点击发光物件，自由探索</p><div className="compartment-nav" aria-label="自由探索车厢">{navigation.map(n=><button key={n.id} className={sceneId===n.id?'active':''} onClick={()=>go(n.id)}><span>{n.name}</span>{g.visited.includes(n.id)&&<Check size={12}/>}</button>)}</div></>}
  </div>
  {activeDialogue&&<Dialogue key={activeDialogue.spec.id+':'+activeDialogue.epoch} spec={activeDialogue.spec} onEnd={finishDialogue} onHistory={()=>setPanel('history')} onDismiss={dismissDialogue} paused={!!panel}/>}
  </section>
  <footer className="bottom-bar" inert={!!panel}><nav aria-label="旅程导航"><button className={scene.act===1?'active':''} onClick={()=>go(g.unlocked.includes('hall')?'hall':g.unlocked.includes('station')?'station':'desk')}><TrainFront/><span>登车大厅</span></button><button className={panel==='map'?'active':''} disabled={!navUnlocked} onClick={openMap}><Map/><span>旅途地图</span>{!navUnlocked&&<LockTiny/>}</button><button className={panel==='characters'?'active':''} disabled={!navUnlocked} onClick={()=>setPanel('characters')}><Users/><span>神秘乘客</span></button><button className={panel==='journal'?'active':''} disabled={!g.inventory.includes('notebook')} onClick={()=>setPanel('journal')}><BookOpen/><span>旅行手账</span></button></nav><div className="journey-progress"><span>{g.ticket?g.ticket.nickname:'受邀旅客'}</span><span className="route-track"><i className={scene.act>=1?'active':''}/><i className={scene.act>=2?'active':''}/><i className={scene.act>=3?'active':''}/></span><small>{g.completedAt?'首日旅程已收藏':`周一 · ${scene.act}/3 幕`}</small></div><button className={`hint-button ${hints?'active':''}`} aria-label="看看四周的可互动物件" aria-pressed={hints} onClick={showHint}><Lightbulb size={18}/><span>看看四周</span></button></footer>
  {panel&&<Modal key={panel+':'+(panel==='cokeMaterial'?cokeMaterial:'')} title={panel==='cokeMaterial'?(cokeMaterial==='opinion'?'个人观点':cokeMaterial==='spread'?'查看最新信息':cokeMaterial==='film'?'列车广告放映室':cokeMaterial==='report'?'情报拼图室':cokeMaterial==='response'?'舆情急救室':panelNames[panel]):panel==='cassette'?'神秘电波':panelNames[panel]} eyebrow={panel==='report'?'情报追踪与传播模拟':panel==='voteFinal'?'可口可乐 · 调查后的判断':`${trainNumber} · ${journeyTitle}`} onClose={close} wide={['cook','map','journal','evidence','share','report','letter'].includes(panel)}>{contents()}</Modal>}
  {toast&&<div className="toast" role="status" aria-live="polite"><span>{toast}</span><button aria-label="关闭提示" onClick={()=>setToast('')}><X size={16}/></button></div>}
 </main>;
}
function LockTiny(){return <span className="locked-dot" aria-label="登车后解锁"/>;}
