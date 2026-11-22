import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import App from './App';
import './styles.css';
import './story.css';
import './journey.css';
import './ui-refresh/vintage-ui.css';
import './ui-refresh/sunday-refresh.css';
import './ui-refresh/experience.css';
import './ui-refresh/typography.css';
import './ui-refresh/mobile-refresh.css';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<div className="recovery-page"><h1>列车暂时停靠。</h1><p>你的旅程存档仍保存在当前浏览器。刷新页面可以重新进入。</p><button onClick={()=>location.reload()}>重新进入旅程</button></div>:this.props.children;}}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><HashRouter><App/></HashRouter></ErrorBoundary></React.StrictMode>);
