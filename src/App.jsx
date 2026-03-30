// ═══════════════════════════════════════════════════════════════════
// MARKETING INTELLIGENCE v3
// Supabase backend + bug fixes + blur template system
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { Camera, Sparkles, Calendar, Copy, ExternalLink, Eye, Trash2, ChevronLeft, Clock, Image as ImageIcon, Type, LayoutTemplate, RefreshCw, Check, X, Plus, Megaphone, ArrowRight, Edit3, Layers, Wand2, LogOut, Store, Upload, Zap, Shuffle, AlertCircle, Lock, Film, ImagePlus } from "lucide-react";
import { getSavedOwnerId, saveOwnerId, getSavedPin, savePin, logout as sbLogout, verifyPin, getOrCreateClient, checkInviteCode, claimOwnerId, setPin, saveMarketingPost, loadMarketingPosts, deleteMarketingPost, saveMarketingSchedule, loadMarketingSchedule } from "./supabase.js";

// ─── THEME ──────────────────────────────────────────────────────
const C={bg:"#060A13",card:"#0D1420",surface:"#111927",border:"#1A2540",borderLight:"#243352",text:"#F1F5F9",white:"#FFFFFF",muted:"#8494B2",dim:"#4A5A7A",amber:"#F59E0B",amberDim:"rgba(245,158,11,0.12)",green:"#10B981",greenDim:"rgba(16,185,129,0.12)",blue:"#3B6FD4",blueDim:"rgba(59,111,212,0.12)",red:"#EF4444",redDim:"rgba(239,68,68,0.12)",purple:"#A855F7",purpleDim:"rgba(168,85,247,0.12)",purpleGlow:"rgba(168,85,247,0.25)"};
const FONT="'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif";
const DISPLAY="'Fraunces',Georgia,serif";

// ─── CAPTION STYLES ─────────────────────────────────────────────
const CAPTION_STYLES=[
  {id:"hype_drop",label:"Hype Drop",emoji:"🔥",desc:"Viral energy, FOMO",best:"Trending items"},
  {id:"new_arrival",label:"New Arrival",emoji:"👀",desc:"Just landed",best:"New stock"},
  {id:"price_hero",label:"Price Hero",emoji:"💰",desc:"Lead with price",best:"Deals"},
  {id:"local_shoutout",label:"Local Shoutout",emoji:"📍",desc:"Community feel",best:"Regulars"},
  {id:"weekend_vibe",label:"Weekend Vibe",emoji:"🍻",desc:"Relaxed lifestyle",best:"Fri/Sat"},
  {id:"staff_pick",label:"Staff Pick",emoji:"⭐",desc:"Personal rec",best:"Differentiation"},
];

// ─── TEMPLATE TAGS (overlaid on blur — no solid frames) ─────────
function getSeasonalTag(){const m=new Date().getMonth();if(m===2||m===3)return{label:"🐣 Easter Deals",color:"#F59E0B"};if(m>=5&&m<=7)return{label:"☀️ Summer Vibes",color:"#10B981"};if(m===10||m===11)return{label:"🎄 Festive Deals",color:"#EF4444"};return{label:"🛒 In Store Now",color:"#F97316"};}
const TEMPLATE_TAGS=[
  {id:"new_in",label:"NEW IN",color:"#16A34A",style:"clean"},
  {id:"deal",label:"🔥 DEAL",color:"#EF4444",style:"bold"},
  {id:"weekend",label:"Weekend Vibes",color:"#F59E0B",style:"warm"},
  {id:"staff_pick",label:"⭐ Staff Pick",color:"#D97706",style:"personal"},
  {id:"viral",label:"🔥 DROP",color:"#A855F7",style:"hype"},
  {id:"seasonal",label:getSeasonalTag().label,color:getSeasonalTag().color,style:"seasonal"},
];

// ─── SMART DAILY PROMPT ─────────────────────────────────────────
function getTodayPrompt(){const day=new Date().getDay(),month=new Date().getMonth(),date=new Date().getDate();if((month===2&&date>=25)||(month===3&&date<=21))return{emoji:"🐣",text:"Easter is coming — push chocolate, eggs and seasonal treats today."};if(month===11&&date>=18)return{emoji:"🎄",text:"Christmas week — festive drinks, snacks and gifts."};const D={0:{emoji:"🛒",text:"Sunday — customers prepping for the week. Push meal deals and essentials."},1:{emoji:"☀️",text:"New week, fresh stock. Great day for a new arrival or staff pick."},2:{emoji:"🍫",text:"Tuesday slump — snacks and treats are your best posts today."},3:{emoji:"💰",text:"Mid-week — deal posts and price-hero content work well."},4:{emoji:"⚡",text:"Thursday — people thinking about the weekend. Push drinks and snacks."},5:{emoji:"🍺",text:"Friday — drinks, crisps, weekend treats. Your highest engagement day."},6:{emoji:"☀️",text:"Saturday — catch the weekend shoppers. Product display or new arrival."}};return D[day];}

// ─── AUTO-SCHEDULE ──────────────────────────────────────────────
const PREFERRED_DAYS=[0,2,4,5,1,3,6];
const POSTING_TIMES={0:"9:00am",1:"12:00pm",2:"9:00am",3:"6:00pm",4:"9:00am",5:"11:00am",6:"5:00pm"};
function autoSchedule(posts,existing={}){const sched={};const already=new Set(Object.values(existing).flat());const todo=posts.filter(p=>!already.has(p.id));todo.forEach((p,i)=>{const d=PREFERRED_DAYS[i%7];sched[d]=[...(sched[d]||[]),p.id];});const merged={...existing};Object.keys(sched).forEach(k=>{merged[k]=[...(merged[k]||[]),...sched[k]];});return merged;}

// ─── IMAGE ENHANCEMENT — BLUR BACKGROUND (Section: new template system) ──
function enhanceImage(src,price,storeName,tag){
  return new Promise(resolve=>{
    const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),img=new Image();
    img.onload=()=>{
      canvas.width=1080;canvas.height=1080;
      const size=Math.min(img.width,img.height);
      const sx=(img.width-size)/2,sy=(img.height-size)/2;
      // 1. Draw blurred background (full bleed)
      ctx.filter="blur(28px) brightness(0.6) saturate(1.3)";
      ctx.drawImage(img,sx,sy,size,size,-40,-40,1160,1160);
      ctx.filter="none";
      // 2. Draw sharp product centred (85% of canvas with rounded feel)
      const pad=70;const pSize=1080-pad*2;
      ctx.save();
      ctx.shadowColor="rgba(0,0,0,0.5)";ctx.shadowBlur=40;ctx.shadowOffsetY=8;
      ctx.beginPath();ctx.roundRect(pad,pad,pSize,pSize,20);ctx.clip();
      ctx.filter="brightness(1.06) contrast(1.08) saturate(1.05)";
      ctx.drawImage(img,sx,sy,size,size,pad,pad,pSize,pSize);
      ctx.filter="none";
      ctx.restore();
      // 3. Tag badge (top-left)
      if(tag){
        const t=tag.label||"NEW IN";const tc=tag.color||"#16A34A";
        ctx.font="bold 28px Arial";const tw=ctx.measureText(t).width;
        const bw=tw+32,bh=46,bx=pad+16,by=pad+16;
        ctx.fillStyle=tc;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();
        ctx.fillStyle="#fff";ctx.textAlign="left";ctx.textBaseline="middle";
        ctx.fillText(t,bx+16,by+bh/2);
      }
      // 4. Price badge (bottom-right)
      if(price){
        const pt=`£${price}`;ctx.font="bold 38px Arial";const pw=ctx.measureText(pt).width;
        const pbw=pw+36,pbh=60,pbx=1080-pad-16-pbw,pby=1080-pad-16-pbh;
        ctx.fillStyle="rgba(0,0,0,0.7)";ctx.beginPath();ctx.roundRect(pbx,pby,pbw,pbh,12);ctx.fill();
        ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(pt,pbx+pbw/2,pby+pbh/2);
      }
      // 5. Store watermark (bottom-left, subtle)
      if(storeName){
        ctx.fillStyle="rgba(255,255,255,0.5)";ctx.font="600 20px Arial";
        ctx.textAlign="left";ctx.textBaseline="bottom";
        ctx.fillText("📍 "+storeName,pad+16,1080-pad-16);
      }
      resolve(canvas.toDataURL("image/jpeg",0.92));
    };
    img.src=src;
  });
}

const DAYS_SHORT=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYS_FULL=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ═══ SHARED UI ══════════════════════════════════════════════════
function Card({children,style,onClick,className}){return<div onClick={onClick} className={className} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,transition:"border-color 0.25s",...style}}>{children}</div>;}
function Badge({children,color=C.purple,style}){return<span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",padding:"4px 10px",borderRadius:8,background:`${color}18`,color,...style}}>{children}</span>;}
function Btn({children,primary,small,danger,disabled,onClick,style}){const base={display:"inline-flex",alignItems:"center",gap:6,padding:small?"8px 14px":"12px 20px",borderRadius:10,border:"none",cursor:disabled?"default":"pointer",fontSize:small?12:13,fontWeight:700,fontFamily:FONT,transition:"all 0.2s ease",opacity:disabled?0.45:1};const v=primary?{background:C.purple,color:"#fff",boxShadow:`0 0 20px ${C.purpleGlow}`}:danger?{background:C.redDim,color:C.red,border:`1px solid ${C.red}33`}:{background:C.surface,color:C.muted,border:`1px solid ${C.border}`};return<button onClick={disabled?undefined:onClick} style={{...base,...v,...style}}>{children}</button>;}
function SectionLabel({children,icon,style}){return<div style={{fontSize:10,fontWeight:700,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,display:"flex",alignItems:"center",gap:6,...style}}>{icon} {children}</div>;}
function Toggle({value,onChange,label}){return<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}><span style={{fontSize:13,color:C.muted}}>{label}</span><button onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:value?C.purple:C.border,position:"relative",transition:"background 0.2s"}}><div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:value?23:3,transition:"left 0.2s"}}/></button></div>;}

// ─── TOAST ──────────────────────────────────────────────────────
function Toast({message,type="success",onDone}){useEffect(()=>{const t=setTimeout(onDone,2500);return()=>clearTimeout(t);},[onDone]);return<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",padding:"12px 20px",borderRadius:12,zIndex:9999,background:type==="success"?C.green:C.red,color:"#fff",fontSize:13,fontWeight:700,fontFamily:FONT,boxShadow:"0 8px 30px rgba(0,0,0,0.4)",animation:"fadeUp 0.3s ease",display:"flex",alignItems:"center",gap:8}}>{type==="success"?<Check size={14}/>:<AlertCircle size={14}/>}{message}</div>;}

// ─── DELETE CONFIRM MODAL ───────────────────────────────────────
function DeleteConfirm({postName,onConfirm,onCancel}){return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:24,maxWidth:340,width:"100%",textAlign:"center",fontFamily:FONT}}><div style={{fontSize:32,marginBottom:12}}>🗑️</div><div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:6}}>Delete this post?</div><div style={{fontSize:12,color:C.dim,marginBottom:20}}>"{postName}" will be permanently removed.</div><div style={{display:"flex",gap:8}}><Btn onClick={onCancel} style={{flex:1,justifyContent:"center"}}>Cancel</Btn><Btn danger onClick={onConfirm} style={{flex:1,justifyContent:"center"}}><Trash2 size={12}/> Delete</Btn></div></div></div>;}

// ─── SCHEDULE PROMPT MODAL ──────────────────────────────────────
function SchedulePromptModal({post,onAssign,onDismiss}){const today=new Date().getDay();const sug=PREFERRED_DAYS.find(d=>d>=(today===0?6:today-1))??0;return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:24,maxWidth:340,width:"100%",textAlign:"center",fontFamily:FONT}}><div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:6}}>Add to this week's schedule?</div><div style={{fontSize:12,color:C.dim,marginBottom:16}}>We suggest <strong style={{color:C.purple}}>{DAYS_FULL[sug]}</strong> at {POSTING_TIMES[sug]}</div><div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:16}}>{DAYS_SHORT.map((d,i)=><button key={d} onClick={()=>onAssign(i)} style={{padding:"8px 14px",borderRadius:8,border:i===sug?`2px solid ${C.purple}`:`1px solid ${C.border}`,background:i===sug?C.purpleDim:C.surface,color:i===sug?C.purple:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>{d}</button>)}</div><button onClick={onDismiss} style={{background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:FONT}}>Skip for now</button></div></div>;}


// ═══ AUTH SCREEN (matches Owner app pattern) ════════════════════
function AuthScreen({onAuth}){
  const[mode,setMode]=useState("landing");
  const[loginId,setLoginId]=useState(getSavedOwnerId()||"");
  const[loginPin,setLoginPin]=useState("");
  const[loginMsg,setLoginMsg]=useState(null);
  const[loggingIn,setLoggingIn]=useState(false);
  const[inviteCode,setInviteCode]=useState("");
  const[inviteMsg,setInviteMsg]=useState(null);
  const[checking,setChecking]=useState(false);
  const[ownerId,setOwnerId]=useState("");
  const[pin,setLocalPin]=useState("");
  const[pinConfirm,setPinConfirm]=useState("");
  const[idMsg,setIdMsg]=useState(null);
  const[saving,setSaving]=useState(false);

  const inp={width:"100%",padding:"14px 16px",borderRadius:12,background:C.surface,color:C.white,border:`1.5px solid ${C.border}`,fontSize:16,outline:"none",fontFamily:FONT,boxSizing:"border-box",marginBottom:12};
  const pinInp={...inp,letterSpacing:8,textAlign:"center",fontSize:22,fontWeight:800};

  const handleLogin=async()=>{if(!loginId.trim()||loginPin.length!==4)return;setLoggingIn(true);setLoginMsg(null);try{const client=await getOrCreateClient(loginId.trim().toLowerCase());if(!client){setLoginMsg("Business ID not found");setLoggingIn(false);return;}const ok=await verifyPin(client.id,loginPin);if(!ok){setLoginMsg("Wrong PIN");setLoggingIn(false);return;}saveOwnerId(loginId.trim().toLowerCase());savePin(loginId.trim().toLowerCase(),loginPin);onAuth(client.id,client.owner_name||client.name);}catch(e){setLoginMsg(e.message||"Login failed");}setLoggingIn(false);};

  const handleInvite=async()=>{const code=inviteCode.trim().toUpperCase();if(!code){setInviteMsg("Enter your invite code");return;}setChecking(true);setInviteMsg(null);try{const r=await checkInviteCode(code);if(r.valid)setMode("setup-id");else setInviteMsg(r.error);}catch(e){setInviteMsg(e.message);}setChecking(false);};

  const handleCreate=async()=>{const id=ownerId.trim().toLowerCase();if(!id){setIdMsg("Enter a business ID");return;}if(pin.length!==4){setIdMsg("PIN must be 4 digits");return;}if(pin!==pinConfirm){setIdMsg("PINs don't match");return;}setSaving(true);setIdMsg(null);try{await claimOwnerId(id,inviteCode.trim().toUpperCase());const client=await getOrCreateClient(id);if(client){await setPin(client.id,pin);saveOwnerId(id);savePin(id,pin);onAuth(client.id,client.owner_name||client.name);}else{setIdMsg("Account created but login failed — try logging in");}}catch(e){setIdMsg(e.message);}setSaving(false);};

  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{position:"fixed",top:"-20%",left:"30%",width:400,height:400,background:`radial-gradient(circle,${C.purpleGlow} 0%,transparent 70%)`,pointerEvents:"none",filter:"blur(60px)"}}/>
    <div style={{width:"100%",maxWidth:380,textAlign:"center",position:"relative"}}>
      <div className="fade-up d1" style={{width:72,height:72,borderRadius:20,margin:"0 auto 24px",background:`linear-gradient(135deg,${C.purple},#7C3AED)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 40px ${C.purpleGlow}`}}><Megaphone size={32} color="#fff" strokeWidth={2.2}/></div>
      <h1 className="fade-up d2" style={{fontFamily:DISPLAY,fontSize:28,fontWeight:800,color:C.white,marginBottom:6}}>Marketing <span style={{color:C.purple}}>Intelligence</span></h1>
      <p className="fade-up d3" style={{fontSize:13,color:C.dim,marginBottom:28,lineHeight:1.6}}>AI-powered social content for your store.</p>

      {/* Landing */}
      {mode==="landing"&&<div className="fade-up d4" style={{display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>setMode("login")} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:C.purple,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:FONT,boxShadow:`0 0 30px ${C.purpleGlow}`}}>Log In</button>
        <button onClick={()=>setMode("setup-code")} style={{width:"100%",padding:16,borderRadius:14,border:`1.5px solid ${C.border}`,background:C.card,color:C.muted,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Create Account</button>
      </div>}

      {/* Login */}
      {mode==="login"&&<div className="fade-up d4" style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,textAlign:"left"}}>
        <div style={{fontSize:16,fontWeight:700,color:C.white,marginBottom:16}}>Welcome back</div>
        <div style={{fontSize:12,fontWeight:700,color:C.dim,marginBottom:6,textTransform:"uppercase"}}>Business ID</div>
        <input style={inp} value={loginId} onChange={e=>{setLoginId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""));setLoginMsg(null);}} placeholder="e.g. londis-horden" autoFocus/>
        <div style={{fontSize:12,fontWeight:700,color:C.dim,marginBottom:6,textTransform:"uppercase"}}>PIN</div>
        <input type="tel" inputMode="numeric" maxLength={4} style={pinInp} value={loginPin} onChange={e=>{setLoginPin(e.target.value.replace(/\D/g,"").slice(0,4));setLoginMsg(null);}} onKeyDown={e=>{if(e.key==="Enter"&&loginPin.length===4)handleLogin();}} placeholder="• • • •"/>
        {loginMsg&&<div style={{fontSize:13,color:C.red,marginBottom:12}}>{loginMsg}</div>}
        <button onClick={handleLogin} disabled={loggingIn||!loginId.trim()||loginPin.length!==4} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:loginId.trim()&&loginPin.length===4?C.purple:C.surface,color:loginId.trim()&&loginPin.length===4?"#fff":C.dim,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT,marginBottom:12}}>{loggingIn?"Logging in...":"Log In"}</button>
        <button onClick={()=>{setMode("landing");setLoginMsg(null);}} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer",fontFamily:FONT}}>← Back</button>
      </div>}

      {/* Setup: invite code */}
      {mode==="setup-code"&&<div className="fade-up d4" style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,textAlign:"left"}}>
        <div style={{fontSize:16,fontWeight:700,color:C.white,marginBottom:6}}>Enter your invite code</div>
        <div style={{fontSize:13,color:C.dim,marginBottom:16,lineHeight:1.5}}>Each code can only be used once.</div>
        <input style={{...inp,textTransform:"uppercase",letterSpacing:2,fontWeight:700}} value={inviteCode} onChange={e=>{setInviteCode(e.target.value.toUpperCase());setInviteMsg(null);}} onKeyDown={e=>{if(e.key==="Enter")handleInvite();}} placeholder="e.g. HORDEN-2026" autoFocus/>
        {inviteMsg&&<div style={{fontSize:13,color:C.red,marginBottom:12}}>{inviteMsg}</div>}
        <button onClick={handleInvite} disabled={checking||!inviteCode.trim()} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:inviteCode.trim()?C.purple:C.surface,color:inviteCode.trim()?"#fff":C.dim,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT,marginBottom:12}}>{checking?"Checking...":"Continue →"}</button>
        <button onClick={()=>{setMode("landing");setInviteMsg(null);}} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer",fontFamily:FONT}}>← Back</button>
      </div>}

      {/* Setup: create account */}
      {mode==="setup-id"&&<div className="fade-up d4" style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,textAlign:"left"}}>
        <Badge color={C.green} style={{marginBottom:12}}>✓ Code accepted</Badge>
        <div style={{fontSize:16,fontWeight:700,color:C.white,marginBottom:16}}>Create your account</div>
        <div style={{fontSize:12,fontWeight:700,color:C.dim,marginBottom:6,textTransform:"uppercase"}}>Business ID</div>
        <input style={inp} value={ownerId} onChange={e=>{setOwnerId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""));setIdMsg(null);}} placeholder="e.g. londis-horden"/>
        <div style={{fontSize:12,fontWeight:700,color:C.dim,marginBottom:6,textTransform:"uppercase"}}>4-Digit PIN</div>
        <input type="tel" inputMode="numeric" maxLength={4} style={pinInp} value={pin} onChange={e=>setLocalPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="• • • •"/>
        <div style={{fontSize:12,fontWeight:700,color:C.dim,marginBottom:6,textTransform:"uppercase"}}>Confirm PIN</div>
        <input type="tel" inputMode="numeric" maxLength={4} style={pinInp} value={pinConfirm} onChange={e=>setPinConfirm(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>{if(e.key==="Enter"&&pin.length===4)handleCreate();}} placeholder="• • • •"/>
        {idMsg&&<div style={{fontSize:13,color:C.red,marginBottom:12}}>{idMsg}</div>}
        <button onClick={handleCreate} disabled={saving||!ownerId.trim()||pin.length!==4||pinConfirm.length!==4} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:ownerId.trim()&&pin.length===4?C.purple:C.surface,color:ownerId.trim()?"#fff":C.dim,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT,marginBottom:12}}>{saving?"Creating...":"Create Account →"}</button>
        <button onClick={()=>{setMode("setup-code");setIdMsg(null);}} style={{background:"none",border:"none",color:C.dim,fontSize:13,cursor:"pointer",fontFamily:FONT}}>← Back</button>
      </div>}

      <p className="fade-up d5" style={{fontSize:11,color:C.dim,marginTop:20}}>Part of <span style={{color:C.muted,fontWeight:600}}>Retail Intelligence</span></p>
    </div>
  </div>;
}


// ═══ APP SHELL ══════════════════════════════════════════════════
export default function App(){
  const[clientId,setClientId]=useState(null);
  const[storeName,setStoreName]=useState("");
  const[authenticated,setAuthenticated]=useState(false);
  const[loading,setLoading]=useState(true);
  const[view,setView]=useState("hub");
  const[posts,setPosts]=useState([]);
  const[schedule,setSchedule]=useState({});
  const[editingPost,setEditingPost]=useState(null);
  const[toast,setToast]=useState(null);
  const[schedulePrompt,setSchedulePrompt]=useState(null);
  const[deleteTarget,setDeleteTarget]=useState(null);

  const showToast=(msg,type="success")=>setToast({msg,type});

  // Auto-login from saved credentials
  useEffect(()=>{
    const id=getSavedOwnerId();const pin=getSavedPin();
    if(id&&pin){
      (async()=>{
        try{const client=await getOrCreateClient(id);
        if(client){const ok=await verifyPin(client.id,pin);
        if(ok){setClientId(client.id);setStoreName(client.owner_name||client.name);setAuthenticated(true);
          const[p,s]=await Promise.all([loadMarketingPosts(client.id),loadMarketingSchedule(client.id)]);
          setPosts(p);setSchedule(s);
        }}}catch(e){console.error("Auto-login failed:",e);}
        setLoading(false);
      })();
    } else { setLoading(false); }
  },[]);

  const handleAuth=async(cId,cName)=>{
    setClientId(cId);setStoreName(cName);setAuthenticated(true);setLoading(true);
    try{const[p,s]=await Promise.all([loadMarketingPosts(cId),loadMarketingSchedule(cId)]);setPosts(p);setSchedule(s);}catch(e){console.error("Load data:",e);}
    setLoading(false);
  };

  // Save post to Supabase
  const savePost=async(post)=>{
    try{
      if(editingPost)setPosts(prev=>prev.map(p=>p.id===post.id?post:p));
      else setPosts(prev=>[post,...prev]);
      if(clientId)await saveMarketingPost(clientId,post);
      showToast("Post saved ✅");
      setSchedulePrompt(post);setEditingPost(null);setView("hub");
    }catch(e){showToast("Save failed — "+e.message,"error");}
  };

  const saveBatch=async(newPosts,newSched)=>{
    try{
      setPosts(prev=>[...newPosts,...prev]);
      setSchedule(prev=>{const m={...prev};Object.keys(newSched).forEach(k=>{m[k]=[...(m[k]||[]),...newSched[k]];});return m;});
      if(clientId){for(const p of newPosts)await saveMarketingPost(clientId,p);await saveMarketingSchedule(clientId,{...schedule,...newSched});}
      showToast(`${newPosts.length} posts saved & scheduled ✅`);setView("hub");
    }catch(e){showToast("Save failed","error");}
  };

  const confirmDelete=async()=>{
    if(!deleteTarget)return;
    try{
      setPosts(prev=>prev.filter(p=>p.id!==deleteTarget.id));
      setSchedule(prev=>{const n={...prev};Object.keys(n).forEach(k=>{n[k]=n[k].filter(pid=>pid!==deleteTarget.id);});return n;});
      if(clientId)await deleteMarketingPost(deleteTarget.id);
      showToast("Post deleted");
    }catch(e){showToast("Delete failed","error");}
    setDeleteTarget(null);
  };

  const updateSchedule=async(newSched)=>{
    setSchedule(newSched);
    if(clientId)try{await saveMarketingSchedule(clientId,newSched);}catch(e){console.error("Schedule save:",e);}
  };

  const handleLogout=()=>{sbLogout();setAuthenticated(false);setClientId(null);setStoreName("");setPosts([]);setSchedule({});};

  if(loading)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT}}><div style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:12}}>📣</div><div style={{fontSize:15,color:C.white,fontWeight:600}}>Loading...</div><div style={{fontSize:12,color:C.dim,marginTop:4}}>Connecting to your account</div></div></div>;

  if(!authenticated)return<AuthScreen onAuth={handleAuth}/>;

  return<>
    {toast&&<Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    {deleteTarget&&<DeleteConfirm postName={deleteTarget.productName} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)}/>}
    {schedulePrompt&&view==="hub"&&<SchedulePromptModal post={schedulePrompt} onAssign={d=>{const ns={...schedule,[d]:[...(schedule[d]||[]),schedulePrompt.id]};updateSchedule(ns);showToast(`Added to ${DAYS_FULL[d]} ✅`);setSchedulePrompt(null);}} onDismiss={()=>setSchedulePrompt(null)}/>}
    {view==="hub"&&<HubView storeName={storeName} posts={posts} schedule={schedule} onCreateNew={()=>{setEditingPost(null);setView("create");}} onBatch={()=>setView("batch")} onEdit={p=>{setEditingPost(p);setView("create");}} onSchedule={()=>setView("schedule")} onDelete={p=>setDeleteTarget(p)} onLogout={handleLogout}/>}
    {view==="create"&&<CreateView post={editingPost} storeName={storeName} onSave={savePost} onBack={()=>{setEditingPost(null);setView("hub");}}/>}
    {view==="batch"&&<BatchView storeName={storeName} onSave={saveBatch} onBack={()=>setView("hub")}/>}
    {view==="schedule"&&<ScheduleView posts={posts} schedule={schedule} onUpdate={updateSchedule} onBack={()=>setView("hub")} showToast={showToast}/>}
  </>;
}


// ═══ HUB VIEW ═══════════════════════════════════════════════════
function HubView({storeName,posts,schedule,onCreateNew,onBatch,onEdit,onSchedule,onDelete,onLogout}){
  const sIds=Object.values(schedule).flat();const unsch=posts.filter(p=>!sIds.includes(p.id));const tp=getTodayPrompt();
  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,color:C.text}}>
    <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,background:`linear-gradient(180deg,${C.card} 0%,${C.bg} 100%)`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.purple},#7C3AED)`,display:"flex",alignItems:"center",justifyContent:"center"}}><Megaphone size={18} color="#fff"/></div><div><div style={{fontSize:16,fontWeight:800,color:C.white,fontFamily:DISPLAY}}>Marketing <span style={{color:C.purple}}>Intelligence</span></div><div style={{fontSize:11,color:C.dim,display:"flex",alignItems:"center",gap:4}}><Store size={10}/> {storeName}</div></div></div>
      <button onClick={onLogout} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",color:C.dim,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,fontFamily:FONT}}><LogOut size={12}/> Sign Out</button>
    </div>
    <div style={{padding:20,maxWidth:540,margin:"0 auto"}}>
      <Card className="fade-up d1" style={{marginBottom:16,background:`linear-gradient(135deg,${C.card},${C.surface})`,border:`1px solid ${C.purple}33`}}>
        <SectionLabel icon={<Calendar size={11} color={C.purple}/>}>What to post today</SectionLabel>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}><span style={{fontSize:28}}>{tp.emoji}</span><p style={{fontSize:13,color:C.text,lineHeight:1.6,margin:0}}>{tp.text}</p></div>
        <Btn small primary onClick={onCreateNew} style={{borderRadius:8}}>Post something today <ArrowRight size={12}/></Btn>
      </Card>
      <div className="fade-up d2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <Btn primary onClick={onBatch} style={{justifyContent:"center",padding:16,borderRadius:14,fontSize:13}}><Sparkles size={15}/> Plan My Week</Btn>
        <Btn onClick={onCreateNew} style={{justifyContent:"center",padding:16,borderRadius:14}}><Camera size={15}/> Create One Post</Btn>
      </div>
      <div className="fade-up d3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[{l:"Created",v:posts.length,c:C.purple,i:<Layers size={15}/>},{l:"Scheduled",v:sIds.length,c:C.green,i:<Calendar size={15}/>},{l:"Ready",v:unsch.length,c:C.amber,i:<Clock size={15}/>}].map(s=><Card key={s.l} style={{padding:14,textAlign:"center"}}><div style={{color:s.c,marginBottom:6}}>{s.i}</div><div style={{fontSize:24,fontWeight:800,color:C.white,fontFamily:DISPLAY}}>{s.v}</div><div style={{fontSize:9,color:C.dim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>{s.l}</div></Card>)}
      </div>
      <Card className="fade-up d4" style={{marginBottom:20,cursor:"pointer"}} onClick={onSchedule}>
        <SectionLabel icon={<Calendar size={11} color={C.purple}/>}>This Week</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
          {DAYS_SHORT.map((d,i)=>{const dp=(schedule[i]||[]).map(id=>posts.find(p=>p.id===id)).filter(Boolean);const has=dp.length>0;return<div key={d} style={{textAlign:"center"}}><div style={{fontSize:9,fontWeight:700,color:C.dim,marginBottom:5}}>{d}</div><div style={{width:38,height:38,borderRadius:10,margin:"0 auto",background:has?C.purpleDim:C.surface,border:`1.5px solid ${has?C.purple+"55":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:has?C.purple:C.dim}}>{has?dp.length:"—"}</div><div style={{fontSize:8,color:C.dim,marginTop:3}}>{POSTING_TIMES[i]}</div></div>;})}
        </div>
      </Card>
      {posts.length>0&&<Card className="fade-up d5"><SectionLabel icon={<Layers size={11} color={C.blue}/>}>Your Posts</SectionLabel><div style={{display:"flex",flexDirection:"column",gap:8}}>{posts.map(p=><PostCard key={p.id} post={p} isScheduled={sIds.includes(p.id)} onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/>)}</div></Card>}
      {posts.length===0&&<Card className="fade-up d5" style={{textAlign:"center",padding:48}}><div style={{fontSize:48,marginBottom:16}}>📸</div><div style={{fontSize:17,fontWeight:800,color:C.white,marginBottom:8,fontFamily:DISPLAY}}>Your week starts here</div><div style={{fontSize:13,color:C.dim,marginBottom:20,lineHeight:1.7,maxWidth:300,margin:"0 auto 20px"}}>Upload your products and we'll have your whole week sorted in minutes. No marketing team needed.</div><Btn primary onClick={onBatch} style={{marginBottom:10}}><Sparkles size={14}/> Plan My Week</Btn><div><button onClick={onCreateNew} style={{background:"none",border:"none",color:C.purple,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Or create a single post</button></div></Card>}
      <div style={{textAlign:"center",padding:"32px 0 20px",fontSize:11,color:C.dim}}>Part of <span style={{fontWeight:600,color:C.muted}}>Retail Intelligence</span> · Built in the UK</div>
    </div>
  </div>;
}

// ═══ POST CARD ══════════════════════════════════════════════════
function PostCard({post,isScheduled,onEdit,onDelete}){const[copied,setCopied]=useState(false);const cc=e=>{e.stopPropagation();navigator.clipboard.writeText(post.caption).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};const isVideo=post.mediaType==="video";return<div style={{background:C.surface,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}><div style={{display:"flex",gap:12,padding:12}}>{post.imageUrl&&<div style={{width:56,height:56,borderRadius:8,overflow:"hidden",flexShrink:0,background:C.card,position:"relative"}}>{isVideo?<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:C.card}}><Film size={20} color={C.purple}/></div>:<img src={post.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:3}}>{post.productName||"Untitled"}{isVideo&&<Badge color={C.purple} style={{fontSize:7,padding:"1px 5px",marginLeft:6}}>VIDEO</Badge>}</div><div style={{fontSize:11,color:C.dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:5}}>{post.caption?.slice(0,70)}…</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Badge color={C.green} style={{fontSize:8,padding:"2px 7px"}}>{CAPTION_STYLES.find(s=>s.id===post.style)?.label||post.style}</Badge>{isScheduled&&<Badge color={C.blue} style={{fontSize:8,padding:"2px 7px"}}>Scheduled</Badge>}</div></div></div><div style={{display:"flex",borderTop:`1px solid ${C.border}`}}>{[{icon:<Edit3 size={11}/>,label:"Edit",fn:onEdit,color:C.blue},{icon:copied?<Check size={11}/>:<Copy size={11}/>,label:copied?"Copied!":"Copy",fn:cc,color:C.green},{icon:<ExternalLink size={11}/>,label:"Facebook",fn:()=>{navigator.clipboard.writeText(post.caption);setTimeout(()=>window.open("https://www.facebook.com","_blank"),300);},color:C.blue},{icon:<Trash2 size={11}/>,label:"Delete",fn:e=>{e.stopPropagation();onDelete();},color:C.red}].map((a,idx)=><button key={a.label} onClick={a.fn} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"10px 0",background:"none",border:"none",borderRight:idx<3?`1px solid ${C.border}`:"none",color:a.color,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>{a.icon} {a.label}</button>)}</div></div>;}

// ═══ CREATE VIEW ════════════════════════════════════════════════
function CreateView({post:ep,storeName,onSave,onBack}){
  const[step,setStep]=useState(1);const cameraRef=useRef(null);const libraryRef=useRef(null);
  const[imageUrl,setImageUrl]=useState(ep?.imageUrl||null);
  const[enhancedUrl,setEnhancedUrl]=useState(null);
  const[productName,setProductName]=useState(ep?.productName||"");
  const[price,setPrice]=useState(ep?.price||"");
  const[tag,setTag]=useState(ep?.tag||TEMPLATE_TAGS[0]);
  const[style,setStyle]=useState(ep?.style||"new_arrival");
  const[caption,setCaption]=useState(ep?.caption||"");
  const[generating,setGenerating]=useState(false);
  const[showBranding,setShowBranding]=useState(ep?.showBranding!==false);
  const[mediaType,setMediaType]=useState(ep?.mediaType||"image");

  const handleFile=(e)=>{const f=e.target.files?.[0];if(!f)return;const isVid=f.type.startsWith("video/");setMediaType(isVid?"video":"image");if(isVid){setImageUrl(URL.createObjectURL(f));setEnhancedUrl(null);return;}const r=new FileReader();r.onload=ev=>{setImageUrl(ev.target.result);enhanceImage(ev.target.result,price,storeName,tag).then(setEnhancedUrl).catch(()=>setEnhancedUrl(ev.target.result));};r.readAsDataURL(f);};

  // Re-enhance when price/tag changes
  useEffect(()=>{if(imageUrl&&mediaType==="image"&&price)enhanceImage(imageUrl,price,storeName,tag).then(setEnhancedUrl).catch(()=>{});},[price,tag]);

  // Generate caption — accepts optional style override to avoid stale closure
  const genCaption=async(styleOverride)=>{const useStyle=styleOverride||style;setGenerating(true);try{const res=await fetch("/api/generate-caption",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productName,price,storeName,style:useStyle})});const data=await res.json();if(data.caption)setCaption(data.caption);else throw new Error();}catch{const t=storeName?`#${storeName.replace(/\s/g,"").toLowerCase()}`:"#localshop";setCaption(`${productName}${price?` — just £${price}`:""} 🔥\n\nIn store NOW. You know where we are 👀\n\n#ConvenienceStore #Deals ${t}`);}setGenerating(false);};

  // Select style AND auto-regenerate immediately with new value
  const selectStyle=(newStyle)=>{setStyle(newStyle);if(step===3)genCaption(newStyle);};

  const save=()=>onSave({id:ep?.id||`post_${Date.now()}`,imageUrl:enhancedUrl||imageUrl,productName,price,tag,style,caption,showBranding,mediaType,createdAt:ep?.createdAt||new Date().toISOString()});

  const steps=[{n:1,l:"Photo",i:<Camera size={11}/>},{n:2,l:"Style",i:<LayoutTemplate size={11}/>},{n:3,l:"Caption",i:<Type size={11}/>},{n:4,l:"Preview",i:<Eye size={11}/>}];
  const wc=caption.split(/\s+/).filter(Boolean).length;
  const img=enhancedUrl||imageUrl;

  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,color:C.text}}>
    <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4}}><ChevronLeft size={20}/></button><span style={{fontSize:15,fontWeight:700,color:C.white}}>{ep?"Edit Post":"Create Post"}</span></div>{step===4&&<Btn primary small onClick={save}><Check size={12}/> Save</Btn>}</div>
    <div style={{padding:"10px 20px",display:"flex",gap:2,justifyContent:"center",background:C.card,borderBottom:`1px solid ${C.border}`}}>{steps.map(s=><button key={s.n} onClick={()=>{if(s.n<step)setStep(s.n);}} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 16px",borderRadius:8,border:"none",background:step===s.n?C.purpleDim:"transparent",color:step===s.n?C.purple:step>s.n?C.green:C.dim,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>{step>s.n?<Check size={10} strokeWidth={3}/>:s.i}<span>{s.l}</span></button>)}</div>
    <div style={{padding:20,maxWidth:500,margin:"0 auto"}}>
      {/* STEP 1: Photo — camera vs library + video support */}
      {step===1&&<div className="fade-up">
        <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment" onChange={handleFile} style={{display:"none"}}/>
        <input ref={libraryRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{display:"none"}}/>
        {!imageUrl?<>
          <Card style={{textAlign:"center",padding:40,marginBottom:10}}>
            <div style={{width:72,height:72,borderRadius:18,margin:"0 auto 20px",background:C.purpleDim,display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={32} color={C.purple}/></div>
            <div style={{fontSize:16,fontWeight:800,color:C.white,marginBottom:6,fontFamily:DISPLAY}}>Add a product photo or video</div>
            <div style={{fontSize:12,color:C.dim,lineHeight:1.6,marginBottom:20}}>Photos auto-enhance to 1080×1080 with blurred background.</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <Btn primary onClick={()=>cameraRef.current?.click()} style={{borderRadius:12}}><Camera size={14}/> Take Photo</Btn>
              <Btn onClick={()=>libraryRef.current?.click()} style={{borderRadius:12}}><ImagePlus size={14}/> Choose from Library</Btn>
            </div>
          </Card>
          <div style={{textAlign:"center"}}><button onClick={()=>libraryRef.current?.click()} style={{background:"none",border:"none",color:C.purple,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:4,margin:"0 auto"}}><Film size={12}/> Or upload a video</button></div>
        </>:<>
          <Card style={{padding:0,overflow:"hidden",marginBottom:14}}><div style={{position:"relative"}}>
            {mediaType==="video"?<div style={{width:"100%",height:280,display:"flex",alignItems:"center",justifyContent:"center",background:C.surface}}><Film size={48} color={C.purple}/><div style={{position:"absolute",bottom:10,left:10}}><Badge color={C.purple}>VIDEO</Badge></div></div>:<img src={img} alt="" style={{width:"100%",maxHeight:280,objectFit:"cover",display:"block"}}/>}
            <button onClick={()=>{setImageUrl(null);setEnhancedUrl(null);}} style={{position:"absolute",top:10,right:10,width:32,height:32,borderRadius:8,background:"rgba(0,0,0,0.65)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14}/></button>
            <button onClick={()=>libraryRef.current?.click()} style={{position:"absolute",top:10,left:10,padding:"6px 12px",borderRadius:8,background:"rgba(0,0,0,0.65)",border:"none",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:FONT,display:"flex",alignItems:"center",gap:4}}><RefreshCw size={11}/> Change</button>
          </div></Card>
          <Card style={{marginBottom:14}}><SectionLabel>Product Details</SectionLabel>
            <input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Product name (e.g. Coca-Cola 2L)" style={{width:"100%",padding:"13px 14px",borderRadius:10,background:C.surface,color:C.white,border:`1px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:FONT,boxSizing:"border-box",marginBottom:8}}/>
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price — optional (e.g. 1.99)" style={{width:"100%",padding:"13px 14px",borderRadius:10,background:C.surface,color:C.white,border:`1px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:FONT,boxSizing:"border-box"}}/>
          </Card>
        </>}
        {imageUrl&&productName&&<Btn primary onClick={()=>setStep(2)} style={{width:"100%",justifyContent:"center",padding:16,borderRadius:14}}>Next: Choose Style <ArrowRight size={14}/></Btn>}
      </div>}

      {/* STEP 2: Tag selection (blur bg is automatic — just pick the overlay tag) */}
      {step===2&&<div className="fade-up">
        <SectionLabel style={{marginBottom:12}}>Choose a tag for your post</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
          {TEMPLATE_TAGS.map(t=><button key={t.id} onClick={()=>setTag(t)} style={{padding:"14px 8px",borderRadius:14,border:tag.id===t.id?`2.5px solid ${C.purple}`:`2px solid ${C.border}`,background:tag.id===t.id?C.purpleDim:C.surface,cursor:"pointer",textAlign:"center",transition:"all 0.2s",transform:tag.id===t.id?"scale(1.03)":"scale(1)"}}><div style={{fontSize:11,fontWeight:800,color:t.color,marginBottom:2}}>{t.label}</div><div style={{fontSize:8,color:C.dim}}>{t.style}</div></button>)}
        </div>
        <Card style={{marginBottom:14}}><SectionLabel>Options</SectionLabel><Toggle value={showBranding} onChange={setShowBranding} label="Show store branding"/></Card>
        {mediaType==="image"&&img&&<Card style={{marginBottom:18,padding:0,overflow:"hidden"}}><img src={img} alt="" style={{width:"100%",maxHeight:320,objectFit:"cover"}}/></Card>}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>setStep(1)} style={{padding:14,borderRadius:12}}><ChevronLeft size={14}/> Back</Btn>
          <Btn primary onClick={()=>{setStep(3);if(!caption)genCaption();}} style={{flex:1,justifyContent:"center",padding:16,borderRadius:14}}>Next: AI Caption <Sparkles size={14}/></Btn>
        </div>
      </div>}

      {/* STEP 3: Caption — tapping a style auto-regenerates */}
      {step===3&&<div className="fade-up">
        <SectionLabel style={{marginBottom:10}}>Caption style <span style={{fontWeight:400,color:C.dim,textTransform:"none",letterSpacing:0}}>— tap to regenerate</span></SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16}}>
          {CAPTION_STYLES.map(s=><button key={s.id} onClick={()=>selectStyle(s.id)} disabled={generating} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 8px",borderRadius:12,cursor:generating?"wait":"pointer",border:style===s.id?`1.5px solid ${C.purple}`:`1px solid ${C.border}`,background:style===s.id?C.purpleDim:C.surface,transition:"all 0.2s",opacity:generating&&style!==s.id?0.5:1}}><span style={{fontSize:16}}>{s.emoji}</span><div style={{fontSize:10,fontWeight:700,color:C.white}}>{s.label}</div><div style={{fontSize:8,color:C.dim}}>{s.best}</div></button>)}
        </div>
        {generating&&<div style={{textAlign:"center",padding:"8px 0 14px",fontSize:12,color:C.purple,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><RefreshCw size={12} style={{animation:"spin 1s linear infinite"}}/> Rewriting as {CAPTION_STYLES.find(s=>s.id===style)?.label}…</div>}
        {!generating&&<Btn onClick={()=>genCaption()} style={{width:"100%",justifyContent:"center",padding:14,borderRadius:12,background:C.purpleDim,color:C.purple,border:`1px solid ${C.purple}33`,marginBottom:14}}>
          <Wand2 size={14}/> {caption?"Regenerate":"Generate"}
        </Btn>}
        <div style={{position:"relative"}}><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Your AI caption will appear here — or write your own…" rows={8} style={{width:"100%",padding:16,borderRadius:14,background:C.surface,color:C.white,border:`1px solid ${C.border}`,fontSize:13,lineHeight:1.7,outline:"none",fontFamily:FONT,resize:"vertical",boxSizing:"border-box"}}/><div style={{position:"absolute",bottom:8,right:12,fontSize:10,color:wc>150?C.red:C.dim,fontWeight:600}}>{wc}/150 words</div></div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <Btn onClick={()=>setStep(2)} style={{padding:14,borderRadius:12}}><ChevronLeft size={14}/> Back</Btn>
          {caption&&!generating&&<Btn primary onClick={()=>setStep(4)} style={{flex:1,justifyContent:"center",padding:16,borderRadius:14}}>Preview Post <Eye size={14}/></Btn>}
        </div>
      </div>}

      {/* STEP 4: Preview */}
      {step===4&&<div className="fade-up">
        <Card style={{padding:0,overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}><div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},#7C3AED)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff"}}>{(storeName||"S").slice(0,2).toUpperCase()}</div><div><div style={{fontSize:14,fontWeight:700,color:C.white}}>{storeName||"Your Store"}</div><div style={{fontSize:11,color:C.dim}}>Just now · 🌍</div></div></div>
          <div style={{padding:"0 16px 14px",fontSize:13,color:C.text,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{caption}</div>
          {mediaType==="video"?<div style={{width:"100%",height:300,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><Film size={48} color={C.purple}/></div>:<img src={img} alt="" style={{width:"100%",objectFit:"cover"}}/>}
          <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.dim}}>👍 ❤️ 12</span><span style={{fontSize:12,color:C.dim}}>3 comments · 2 shares</span></div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <Btn primary onClick={()=>{navigator.clipboard.writeText(caption);setTimeout(()=>window.open("https://www.facebook.com","_blank"),600);}} style={{width:"100%",justifyContent:"center",padding:16,borderRadius:14}}><ExternalLink size={14}/> Copy Caption & Open Facebook</Btn>
          <div style={{textAlign:"center",fontSize:11,color:C.dim,marginTop:-4,marginBottom:4}}>Your caption is copied — just paste it when Facebook opens.</div>
          <Btn onClick={save} style={{width:"100%",justifyContent:"center",padding:14,borderRadius:12,background:C.greenDim,color:C.green,border:`1px solid ${C.green}33`}}><Check size={14}/> Save to Library</Btn>
          <Btn onClick={()=>setStep(3)} style={{width:"100%",justifyContent:"center",padding:12,borderRadius:12}}><ChevronLeft size={12}/> Back to Caption</Btn>
        </div>
      </div>}
    </div>
  </div>;
}

// ═══ BATCH VIEW ═════════════════════════════════════════════════
function BatchView({storeName,onSave,onBack}){
  const[step,setStep]=useState("upload");const[images,setImages]=useState([]);const[captions,setCaptions]=useState({});const[progress,setProgress]=useState(0);const fileRef=useRef(null);
  const handleFiles=e=>{const files=Array.from(e.target.files||[]).slice(0,7);Promise.all(files.map((f,i)=>{const id=`batch_${Date.now()}_${i}`;const isVid=f.type.startsWith("video/");return new Promise(resolve=>{if(isVid){resolve({id,rawUrl:URL.createObjectURL(f),name:"",price:"",mediaType:"video"});}else{const r=new FileReader();r.onload=ev=>resolve({id,rawUrl:ev.target.result,name:"",price:"",mediaType:"image"});r.readAsDataURL(f);}});})).then(imgs=>{setImages(imgs);setStep("name");});};
  const genAll=async()=>{setStep("generating");setProgress(0);const res={};for(let i=0;i<images.length;i++){const img=images[i];const sid=CAPTION_STYLES[i%CAPTION_STYLES.length].id;try{const r=await fetch("/api/generate-caption",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productName:img.name,price:img.price,storeName,style:sid})});const d=await r.json();res[img.id]=d.caption||fb(img,storeName);}catch{res[img.id]=fb(img,storeName);}setProgress(i+1);}setCaptions(res);setStep("review");};
  const saveAll=async()=>{const newPosts=[];for(const img of images){let enh=img.rawUrl;if(img.mediaType==="image")try{enh=await enhanceImage(img.rawUrl,img.price,storeName,TEMPLATE_TAGS[0]);}catch{}newPosts.push({id:img.id,imageUrl:enh,productName:img.name,price:img.price,tag:TEMPLATE_TAGS[0],style:CAPTION_STYLES[newPosts.length%CAPTION_STYLES.length].id,caption:captions[img.id]||"",showBranding:true,mediaType:img.mediaType,createdAt:new Date().toISOString()});}onSave(newPosts,autoSchedule(newPosts));};

  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,color:C.text}}>
    <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}><button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4}}><ChevronLeft size={20}/></button><div><div style={{fontSize:15,fontWeight:700,color:C.white}}>Plan My Week</div><div style={{fontSize:11,color:C.dim}}>Upload up to 7 products</div></div></div>
    <div style={{padding:20,maxWidth:500,margin:"0 auto"}}>
      {step==="upload"&&<div className="fade-up"><input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{display:"none"}}/><Card onClick={()=>fileRef.current?.click()} style={{textAlign:"center",padding:48,cursor:"pointer",border:`2px dashed ${C.borderLight}`,background:C.surface}}><div style={{width:72,height:72,borderRadius:18,margin:"0 auto 20px",background:C.purpleDim,display:"flex",alignItems:"center",justifyContent:"center"}}><Upload size={32} color={C.purple}/></div><div style={{fontSize:16,fontWeight:800,color:C.white,marginBottom:6,fontFamily:DISPLAY}}>Select your products</div><div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>Choose up to 7 photos or videos.<br/>One post per day, sorted for you.</div></Card></div>}
      {step==="name"&&<div className="fade-up"><SectionLabel>Name your products</SectionLabel><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>{images.map((img,i)=><Card key={img.id} style={{padding:12,display:"flex",gap:12,alignItems:"center"}}>{img.mediaType==="video"?<div style={{width:56,height:56,borderRadius:8,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Film size={20} color={C.purple}/></div>:<img src={img.rawUrl} alt="" style={{width:56,height:56,borderRadius:8,objectFit:"cover",flexShrink:0}}/>}<div style={{flex:1}}><input value={img.name} onChange={e=>{const n=[...images];n[i]={...img,name:e.target.value};setImages(n);}} placeholder="Product name" style={{width:"100%",padding:"8px 10px",borderRadius:8,background:C.surface,color:C.white,border:`1px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:FONT,boxSizing:"border-box",marginBottom:4}}/><input value={img.price} onChange={e=>{const n=[...images];n[i]={...img,price:e.target.value};setImages(n);}} placeholder="Price (optional)" style={{width:"100%",padding:"8px 10px",borderRadius:8,background:C.surface,color:C.white,border:`1px solid ${C.border}`,fontSize:12,outline:"none",fontFamily:FONT,boxSizing:"border-box"}}/></div><button onClick={()=>setImages(prev=>prev.filter(p=>p.id!==img.id))} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",padding:4}}><X size={14}/></button></Card>)}</div><div style={{display:"flex",gap:8}}><Btn onClick={()=>setStep("upload")} style={{padding:14,borderRadius:12}}><ChevronLeft size={14}/> Back</Btn><Btn primary onClick={genAll} disabled={images.some(i=>!i.name.trim())} style={{flex:1,justifyContent:"center",padding:16,borderRadius:14}}><Wand2 size={14}/> Generate My Week</Btn></div></div>}
      {step==="generating"&&<div className="fade-up" style={{textAlign:"center",padding:"60px 0"}}><div style={{width:64,height:64,borderRadius:16,margin:"0 auto 20px",background:C.purpleDim,display:"flex",alignItems:"center",justifyContent:"center"}}><RefreshCw size={28} color={C.purple} style={{animation:"spin 1.5s linear infinite"}}/></div><div style={{fontSize:16,fontWeight:800,color:C.white,marginBottom:8,fontFamily:DISPLAY}}>Writing your week…</div><div style={{fontSize:13,color:C.dim,marginBottom:20}}>{progress} of {images.length} captions done</div><div style={{width:"100%",height:6,borderRadius:3,background:C.surface,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:C.purple,transition:"width 0.4s",width:`${(progress/images.length)*100}%`}}/></div></div>}
      {step==="review"&&<div className="fade-up"><SectionLabel>Review your week</SectionLabel><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>{images.map((img,i)=>{const dayIdx=PREFERRED_DAYS[i%7];return<Card key={img.id} style={{padding:12}}><div style={{display:"flex",gap:10,marginBottom:8,alignItems:"center"}}>{img.mediaType==="video"?<div style={{width:48,height:48,borderRadius:8,background:C.card,display:"flex",alignItems:"center",justifyContent:"center"}}><Film size={16} color={C.purple}/></div>:<img src={img.rawUrl} alt="" style={{width:48,height:48,borderRadius:8,objectFit:"cover"}}/>}<div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.white}}>{img.name}</div><div style={{fontSize:10,color:C.dim}}>{DAYS_FULL[dayIdx]} at {POSTING_TIMES[dayIdx]}</div></div><Badge color={C.purple} style={{fontSize:8}}>{DAYS_SHORT[dayIdx]}</Badge></div><textarea value={captions[img.id]||""} onChange={e=>setCaptions(prev=>({...prev,[img.id]:e.target.value}))} rows={3} style={{width:"100%",padding:10,borderRadius:8,background:C.surface,color:C.text,border:`1px solid ${C.border}`,fontSize:11,lineHeight:1.6,outline:"none",fontFamily:FONT,resize:"vertical",boxSizing:"border-box"}}/></Card>;})}</div><div style={{display:"flex",gap:8}}><Btn onClick={()=>setStep("name")} style={{padding:14,borderRadius:12}}><ChevronLeft size={14}/> Back</Btn><Btn primary onClick={saveAll} style={{flex:1,justifyContent:"center",padding:18,borderRadius:14,fontSize:15}}><Check size={16}/> Your week is ready ✅</Btn></div></div>}
    </div>
  </div>;
}
function fb(img,sn){const t=sn?`#${sn.replace(/\s/g,"").toLowerCase()}`:"#localshop";return`${img.name}${img.price?` — just £${img.price}`:""} 🔥\n\nIn store NOW. Pop in and grab yours 👀\n\n#ConvenienceStore #Deals ${t}`;}

// ═══ SCHEDULE VIEW ══════════════════════════════════════════════
function ScheduleView({posts,schedule,onUpdate,onBack,showToast}){
  const[assigning,setAssigning]=useState(null);const sIds=Object.values(schedule).flat();const unsch=posts.filter(p=>!sIds.includes(p.id));
  const assign=d=>{if(!assigning)return;const cur=schedule[d]||[];if(cur.includes(assigning.id))return;onUpdate({...schedule,[d]:[...cur,assigning.id]});setAssigning(null);};
  const remove=(d,pid)=>onUpdate({...schedule,[d]:(schedule[d]||[]).filter(id=>id!==pid)});
  const autoArr=()=>{onUpdate(autoSchedule(posts));showToast("Auto-arranged ✅");};
  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,color:C.text}}>
    <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4}}><ChevronLeft size={20}/></button><div><div style={{fontSize:15,fontWeight:700,color:C.white}}>Weekly Schedule</div><div style={{fontSize:11,color:C.dim}}>Tap a post, then tap a day</div></div></div><Btn small onClick={autoArr} style={{background:C.purpleDim,color:C.purple,border:`1px solid ${C.purple}33`}}><Shuffle size={12}/> Auto-arrange</Btn></div>
    <div style={{padding:20,maxWidth:500,margin:"0 auto"}}>
      {assigning&&<div className="fade-in" style={{padding:"10px 14px",borderRadius:10,marginBottom:14,background:C.purpleDim,border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.purple,fontWeight:700}}><Zap size={11} style={{verticalAlign:"middle"}}/> Assigning: {assigning.productName}</span><button onClick={()=>setAssigning(null)} style={{background:"none",border:"none",color:C.purple,cursor:"pointer"}}><X size={14}/></button></div>}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
        {DAYS_FULL.map((day,i)=>{const dp=(schedule[i]||[]).map(id=>posts.find(p=>p.id===id)).filter(Boolean);return<Card key={day} onClick={()=>assigning&&assign(i)} style={{padding:14,cursor:assigning?"pointer":"default",border:assigning?`1.5px solid ${C.purple}44`:`1px solid ${C.border}`}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:dp.length?8:0}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:700,color:C.white}}>{day}</span><span style={{fontSize:10,color:C.dim}}>{POSTING_TIMES[i]}</span></div><Badge color={dp.length?C.purple:C.dim} style={{fontSize:9}}>{dp.length} post{dp.length!==1?"s":""}</Badge></div>{dp.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:C.surface,borderRadius:8,marginBottom:4}}>{p.imageUrl&&<img src={p.imageUrl} alt="" style={{width:28,height:28,borderRadius:5,objectFit:"cover"}}/>}<span style={{fontSize:11,color:C.text,flex:1,fontWeight:500}}>{p.productName}</span><button onClick={e=>{e.stopPropagation();remove(i,p.id);}} style={{background:"none",border:"none",color:C.red,cursor:"pointer",padding:2}}><X size={12}/></button></div>)}{!dp.length&&!assigning&&<div style={{fontSize:11,color:C.dim,fontStyle:"italic"}}>Nothing posted {day} — tap to add</div>}{assigning&&!dp.find(p=>p.id===assigning.id)&&<div style={{fontSize:11,color:C.purple,fontWeight:700,marginTop:4}}>+ Tap to assign here</div>}</Card>;})}
      </div>
      {unsch.length>0&&<Card><SectionLabel icon={<Layers size={11} color={C.amber}/>}>Unscheduled ({unsch.length})</SectionLabel><div style={{display:"flex",flexDirection:"column",gap:6}}>{unsch.map(p=><button key={p.id} onClick={()=>setAssigning(p)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:assigning?.id===p.id?C.purpleDim:C.surface,border:assigning?.id===p.id?`1.5px solid ${C.purple}`:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",width:"100%",textAlign:"left"}}>{p.imageUrl&&<img src={p.imageUrl} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>}<div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.white}}>{p.productName}</div><div style={{fontSize:10,color:C.dim}}>{CAPTION_STYLES.find(s=>s.id===p.style)?.label||"—"}</div></div><ArrowRight size={12} color={C.purple}/></button>)}</div></Card>}
    </div>
  </div>;
}
