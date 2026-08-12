import React, { useState, useEffect } from "react";
import {
  Activity, User, Users, ClipboardList, TrendingDown, Share2, DollarSign,
  Zap, Hexagon, ChevronRight, Plus, Check, Radio, Download, Home,
  Calendar, Settings, Search, Bell, MessageCircle, PanelLeft, Sparkles, Filter,
  UserPlus, X, Trash2
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from "recharts";
import { storage } from "./storage.js";

/* ============================================================
   DADOS MOCK
============================================================ */

const DIAGNOSTICOS = {
  "Tendinopatia do manguito rotador": {
    escala: "SPADI",
    criterioAlta: "Escore SPADI ≤ 20 e ADM completa sem dor",
    fases: {
      Aguda: [
        { nome: "Pêndulo de Codman", dose: "3×30s" },
        { nome: "Isométrico em rotação neutra", dose: "4×20s" },
        { nome: "Mobilização passiva assistida", dose: "3×10" },
      ],
      Subaguda: [
        { nome: "Rotação externa com elástico", dose: "3×15" },
        { nome: "Elevação escapular", dose: "3×12" },
        { nome: "Isométrico em cadeia fechada", dose: "4×30s" },
      ],
      Retorno: [
        { nome: "Press militar com halteres leves", dose: "3×10" },
        { nome: "Padrão diagonal PNF", dose: "3×12" },
        { nome: "Pliometria de arremesso leve", dose: "3×8" },
      ],
    },
  },
  "Pós-operatório de LCA": {
    escala: "LEFS",
    criterioAlta: "LSI ≥ 90% e LEFS ≥ 70/80",
    fases: {
      Aguda: [
        { nome: "Bombeamento de tornozelo", dose: "3×20" },
        { nome: "Isometria de quadríceps", dose: "4×15" },
        { nome: "Mobilização patelar", dose: "2×10" },
      ],
      Subaguda: [
        { nome: "Leg press parcial", dose: "3×12" },
        { nome: "Cadeia fechada em step", dose: "3×10" },
        { nome: "Propriocepção unipodal", dose: "3×30s" },
      ],
      Retorno: [
        { nome: "Agachamento unilateral", dose: "3×10" },
        { nome: "Salto horizontal controlado", dose: "3×6" },
        { nome: "Mudança de direção submáxima", dose: "4×8" },
      ],
    },
  },
  "Lombalgia mecânica crônica": {
    escala: "ODI",
    criterioAlta: "ODI ≤ 10% e retorno funcional pleno",
    fases: {
      Aguda: [
        { nome: "Báscula pélvica", dose: "3×15" },
        { nome: "Prancha isométrica curta", dose: "3×15s" },
        { nome: "Mobilização segmentar", dose: "2×10" },
      ],
      Subaguda: [
        { nome: "Bird-dog", dose: "3×10" },
        { nome: "Ponte com carga", dose: "3×12" },
        { nome: "Deadlift com bastão", dose: "3×10" },
      ],
      Retorno: [
        { nome: "Deadlift progressivo", dose: "4×8" },
        { nome: "Carregamento unilateral", dose: "3×10" },
        { nome: "Circuito funcional", dose: "3 voltas" },
      ],
    },
  },
};

const FASES_OPCOES = ["Aguda", "Subaguda", "Retorno"];

const PACIENTES_INICIAL = [
  {
    id: "p1",
    nome: "Maria Antunes",
    diagnostico: "Tendinopatia do manguito rotador",
    fase: "Subaguda",
    adm: 108,
    plano: { nome: "Particular · 12x", status: "em-dia", diasRestantes: 9 },
    sessoes: [
      { s: 1, escore: 78, adm: 62, dor: 8 },
      { s: 2, escore: 70, adm: 71, dor: 7 },
      { s: 3, escore: 58, adm: 84, dor: 5 },
      { s: 4, escore: 40, adm: 96, dor: 4 },
      { s: 5, escore: 26, adm: 102, dor: 2 },
      { s: 6, escore: 15, adm: 108, dor: 1 },
    ],
  },
  {
    id: "p2",
    nome: "Julio Villa Pires",
    diagnostico: "Pós-operatório de LCA",
    fase: "Retorno",
    adm: 132,
    plano: { nome: "Convênio · Unimed", status: "glosa", diasRestantes: null },
    sessoes: [
      { s: 1, escore: 32, adm: 88, dor: 6 },
      { s: 2, escore: 45, adm: 100, dor: 4 },
      { s: 3, escore: 58, adm: 112, dor: 3 },
      { s: 4, escore: 68, adm: 122, dor: 2 },
      { s: 5, escore: 76, adm: 132, dor: 1 },
    ],
  },
  {
    id: "p3",
    nome: "Paulo Cesar Kugnharski",
    diagnostico: "Lombalgia mecânica crônica",
    fase: "Aguda",
    adm: 40,
    plano: { nome: "Particular · 8x", status: "vence", diasRestantes: 2 },
    sessoes: [
      { s: 1, escore: 42, adm: 28, dor: 7 },
      { s: 2, escore: 38, adm: 34, dor: 6 },
      { s: 3, escore: 33, adm: 40, dor: 5 },
    ],
  },
];

const ADESAO_SEMANA = [
  { dia: "Ter", treinos: 2 },
  { dia: "Qua", treinos: 3 },
  { dia: "Qui", treinos: 1 },
  { dia: "Sex", treinos: 4 },
  { dia: "Sáb", treinos: 0 },
  { dia: "Dom", treinos: 0 },
];

const NOTIFICACOES = [
  { texto: "Maria Antunes atingiu o critério de alta do protocolo de ombro.", tempo: "há 2h" },
  { texto: "Protocolo de Julio Villa Pires avançou automaticamente para a fase Retorno.", tempo: "há 1d" },
  { texto: "Plano de Paulo Cesar vence em 2 dias.", tempo: "há 1d" },
];

/* ============================================================
   ESTILOS
============================================================ */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

    :root{
      --bg:#04070d;
      --bg-alt:#070d18;
      --sidebar:#060a13;
      --panel:#0a1220;
      --panel-alt:#0e1a2c;
      --line:#1b2c40;
      --line-soft:#132030;
      --cyan:#4ff2e0;
      --cyan-dim:#2a8a82;
      --violet:#9c7bff;
      --magenta:#ff4d94;
      --text:#dff5f2;
      --muted:#5f7d90;
      --warn:#ffb84d;
    }
    *{box-sizing:border-box;}
    .amp-shell{
      display:flex;
      background:
        radial-gradient(ellipse 900px 500px at 15% -10%, rgba(79,242,224,0.08), transparent 60%),
        radial-gradient(ellipse 700px 500px at 100% 0%, rgba(156,123,255,0.07), transparent 60%),
        var(--bg);
      color:var(--text);
      font-family:'Space Grotesk',sans-serif;
      min-height:100vh;
      position:relative;
    }
    .amp-scan{
      position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.45;
      background-image:
        linear-gradient(rgba(79,242,224,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(79,242,224,0.03) 1px, transparent 1px);
      background-size:38px 38px;
    }
    .mono{font-family:'JetBrains Mono',monospace;}
    .disp{font-family:'Orbitron',sans-serif;}

    /* ---------- sidebar ---------- */
    .amp-sidebar{
      width:236px; flex-shrink:0; background:var(--sidebar); border-right:1px solid var(--line-soft);
      display:flex; flex-direction:column; padding:18px 14px; position:relative; z-index:2;
      min-height:100vh;
    }
    .amp-brand{ display:flex; align-items:center; gap:10px; padding:6px 6px 22px; }
    .amp-brand-mark{
      width:32px; height:32px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
      background:linear-gradient(145deg, rgba(79,242,224,0.16), rgba(156,123,255,0.12));
      border:1px solid var(--cyan-dim); clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
      color:var(--cyan);
    }
    .amp-brand-name{ font-family:'Orbitron',sans-serif; font-weight:700; font-size:1.02rem; letter-spacing:0.04em; }
    .amp-brand-sub{ font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; }

    .amp-navgroup-label{ font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); padding:14px 10px 8px; }
    .amp-navitem{
      display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:4px; cursor:pointer;
      font-size:0.85rem; color:var(--muted); margin-bottom:2px; position:relative; transition:all .15s ease;
    }
    .amp-navitem:hover{ color:var(--text); background:rgba(79,242,224,0.05); }
    .amp-navitem.active{ color:var(--cyan); background:rgba(79,242,224,0.08); }
    .amp-navitem.active::before{ content:""; position:absolute; left:-14px; top:8px; bottom:8px; width:2px; background:var(--cyan); box-shadow:0 0 8px var(--cyan); }

    .amp-sidebar-footer{ margin-top:auto; padding-top:16px; border-top:1px solid var(--line-soft); display:flex; align-items:center; gap:10px; }
    .amp-avatar{
      width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, var(--cyan-dim), var(--violet));
      display:flex; align-items:center; justify-content:center; font-family:'Orbitron',sans-serif; font-size:11px; color:var(--bg); font-weight:700; flex-shrink:0;
    }
    .amp-user-name{ font-size:0.78rem; font-weight:600; }
    .amp-user-sub{ font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--muted); }

    /* ---------- main / topbar ---------- */
    .amp-main{ flex:1; position:relative; z-index:1; min-width:0; }
    .amp-topbar{
      display:flex; align-items:center; justify-content:space-between; gap:14px;
      padding:16px 26px; border-bottom:1px solid var(--line-soft);
    }
    .amp-searchbox{
      display:flex; align-items:center; gap:8px; background:var(--panel); border:1px solid var(--line-soft);
      border-radius:4px; padding:8px 12px; width:260px; color:var(--muted); font-family:'JetBrains Mono',monospace; font-size:11.5px;
    }
    .amp-topicons{ display:flex; align-items:center; gap:8px; }
    .amp-icon-btn{
      width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:4px;
      background:var(--panel); border:1px solid var(--line-soft); color:var(--muted); cursor:pointer;
    }
    .amp-icon-btn:hover{ color:var(--cyan); border-color:var(--cyan-dim); }

    .amp-content{ padding:24px 26px 70px; max-width:1080px; }

    /* ---------- banner / welcome ---------- */
    .amp-banner{
      display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;
      background:rgba(79,242,224,0.06); border:1px solid var(--cyan-dim); border-radius:5px; padding:13px 18px; margin-bottom:16px;
    }
    .amp-banner-text{ font-size:0.85rem; display:flex; align-items:center; gap:10px; }
    .amp-banner-text b{ color:var(--cyan); }

    .amp-welcome{
      background:linear-gradient(120deg, rgba(156,123,255,0.07), rgba(79,242,224,0.05));
      border:1px solid var(--line); border-radius:6px; padding:20px 22px; margin-bottom:18px;
      display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
    }
    .amp-welcome-title{ font-family:'Orbitron',sans-serif; font-size:1rem; margin-bottom:6px; }
    .amp-welcome-sub{ font-size:0.83rem; color:var(--muted); max-width:460px; }

    /* ---------- stat cards ---------- */
    .amp-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; }
    @media (max-width:760px){ .amp-stats{ grid-template-columns:1fr; } }
    .amp-stat{ background:var(--panel); border:1px solid var(--line); border-radius:5px; padding:16px 18px; }
    .amp-stat-label{ font-size:0.82rem; color:var(--muted); margin-bottom:10px; }
    .amp-stat-value{ font-family:'Orbitron',sans-serif; font-size:1.8rem; font-weight:700; }
    .amp-stat-link{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--cyan); }

    .amp-widgets-head{ display:flex; align-items:center; justify-content:space-between; margin:6px 0 12px; }
    .amp-widgets-title{ font-weight:600; font-size:0.92rem; }

    .amp-widget-grid{ display:grid; grid-template-columns:1.3fr 1fr; gap:14px; margin-bottom:14px; }
    @media (max-width:760px){ .amp-widget-grid{ grid-template-columns:1fr; } }

    .amp-panel{ background:var(--panel); border:1px solid var(--line); border-radius:4px; padding:20px; position:relative; }
    .amp-panel::before{ content:""; position:absolute; top:0; left:0; width:20px; height:2px; background:var(--cyan); opacity:0.7; }
    .amp-panel + .amp-panel{ margin-top:14px; }
    .amp-panel-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px; }
    .amp-panel-title{ font-family:'Orbitron',sans-serif; font-size:0.88rem; letter-spacing:0.03em; color:var(--text); display:flex; align-items:center; gap:8px; }
    .amp-eyebrow{ font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:var(--cyan-dim); margin-bottom:4px; }

    .notif-item{ display:flex; align-items:flex-start; gap:10px; padding:9px 0; border-bottom:1px solid var(--line-soft); font-size:0.8rem; }
    .notif-item:last-child{ border-bottom:none; }
    .notif-dot{ width:6px; height:6px; border-radius:50%; background:var(--cyan); margin-top:6px; flex-shrink:0; box-shadow:0 0 6px var(--cyan); }
    .notif-time{ font-family:'JetBrains Mono',monospace; font-size:9.5px; color:var(--muted); white-space:nowrap; }

    .amp-grid-2{ display:grid; grid-template-columns:280px 1fr; gap:18px; }
    @media (max-width:760px){ .amp-grid-2{ grid-template-columns:1fr; } }

    .amp-plist{ display:flex; flex-direction:column; gap:8px; }
    .amp-pcard{
      display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:12px 14px; background:var(--panel-alt); border:1px solid var(--line-soft); border-radius:3px;
      cursor:pointer; transition:all .15s ease;
    }
    .amp-pcard:hover{ border-color:var(--cyan-dim); }
    .amp-pcard.active{ border-color:var(--cyan); box-shadow:0 0 14px rgba(79,242,224,0.25) inset; }
    .amp-pname{ font-size:0.85rem; font-weight:600; }
    .amp-pdiag{ font-family:'JetBrains Mono',monospace; font-size:9.5px; color:var(--muted); margin-top:2px; }

    .tag{
      font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:0.04em; text-transform:uppercase;
      padding:3px 8px; border-radius:2px; border:1px solid var(--line-soft); color:var(--muted); white-space:nowrap;
    }
    .tag.cyan{ color:var(--cyan); border-color:var(--cyan-dim); background:rgba(79,242,224,0.06); }
    .tag.warn{ color:var(--warn); border-color:rgba(255,184,77,0.4); background:rgba(255,184,77,0.06); }
    .tag.mag{ color:var(--magenta); border-color:rgba(255,77,148,0.4); background:rgba(255,77,148,0.06); }

    .row{ display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid var(--line-soft); font-size:0.85rem; }
    .row:last-child{ border-bottom:none; }
    .row-label{ color:var(--muted); font-size:0.8rem; }

    .btn{
      font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.05em; text-transform:uppercase;
      background:transparent; border:1px solid var(--cyan-dim); color:var(--cyan);
      padding:9px 16px; border-radius:2px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
      transition:all .15s ease; clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
    }
    .btn:hover{ background:rgba(79,242,224,0.1); box-shadow:0 0 14px rgba(79,242,224,0.25); }
    .btn.solid{ background:var(--cyan); color:var(--bg); font-weight:700; }
    .btn.solid:hover{ box-shadow:0 0 20px rgba(79,242,224,0.55); }
    .btn.ghost{ border-color:var(--line-soft); color:var(--muted); }
    .btn.pill{ border-radius:20px; clip-path:none; }

    input[type="number"], input[type="text"], select{
      background:var(--bg-alt); border:1px solid var(--line-soft); color:var(--text);
      font-family:'JetBrains Mono',monospace; font-size:12px; padding:8px 10px; border-radius:2px; width:100%;
    }
    input:focus, select:focus{ outline:none; border-color:var(--cyan); }
    label.field{ display:block; font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin-bottom:5px; }

    .scanner-wrap{ display:flex; flex-direction:column; align-items:center; padding:10px 0 4px; }
    .scanner-readout{ font-family:'Orbitron',sans-serif; font-size:2.1rem; font-weight:700; color:var(--text); margin-top:6px; text-shadow:0 0 18px rgba(79,242,224,0.5); }
    .scanner-readout span{ color:var(--cyan); }
    .scanner-caption{ font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); }

    .ex-row{ display:grid; grid-template-columns:1fr 110px; gap:10px; align-items:center; padding:10px 0; border-bottom:1px dashed var(--line-soft); }
    .ex-row:last-child{ border-bottom:none; }
    .ex-name{ font-size:0.85rem; }
    .ex-name .idx{ color:var(--cyan); font-family:'JetBrains Mono',monospace; font-size:10px; margin-right:8px; }

    .perf-card{
      background:linear-gradient(160deg, #071019 0%, #0a1830 100%); border:1px solid var(--cyan-dim); border-radius:6px;
      padding:26px; position:relative; overflow:hidden; max-width:380px; margin:0 auto; box-shadow:0 0 40px rgba(79,242,224,0.12);
    }
    .perf-card::before{
      content:""; position:absolute; inset:0;
      background-image:linear-gradient(rgba(79,242,224,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,242,224,0.05) 1px, transparent 1px);
      background-size:20px 20px; opacity:0.6;
    }
    .perf-inner{ position:relative; z-index:1; }
    .perf-brand{ display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
    .perf-brand span{ font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:0.14em; color:var(--cyan); text-transform:uppercase; }
    .perf-metric{ font-family:'Orbitron',sans-serif; font-size:2.6rem; font-weight:800; line-height:1; color:var(--text); text-shadow:0 0 20px rgba(79,242,224,0.4); }
    .perf-metric-label{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--muted); margin-top:6px; letter-spacing:0.06em; }
    .perf-footer{ display:flex; justify-content:space-between; align-items:flex-end; margin-top:26px; }
    .perf-name{ font-family:'Orbitron',sans-serif; font-size:0.85rem; color:var(--cyan); }
    .perf-hex{ width:26px; height:26px; border:1px solid var(--cyan-dim); clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); }

    .empty{ color:var(--muted); font-size:0.85rem; font-family:'JetBrains Mono',monospace; text-align:center; padding:30px 0; }
    .milestone-banner{
      display:flex; align-items:center; gap:10px; padding:12px 16px; margin-bottom:16px;
      background:rgba(79,242,224,0.06); border:1px solid var(--cyan-dim); border-radius:3px; font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--cyan);
    }
  `}</style>
);

/* ============================================================
   SCANNER
============================================================ */

function Scanner({ deg = 0, label = "ADM" }) {
  const clamped = Math.max(0, Math.min(180, deg));
  return (
    <div className="scanner-wrap">
      <svg viewBox="0 0 260 150" width="200">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {[0, 30, 60, 90, 120, 150, 180].map((t) => {
          const a = (Math.PI * (180 - t)) / 180;
          const x1 = 130 + 100 * Math.cos(a);
          const y1 = 135 - 100 * Math.sin(a);
          const x2 = 130 + 112 * Math.cos(a);
          const y2 = 135 - 112 * Math.sin(a);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a8a82" strokeWidth="1.5" opacity="0.6" />;
        })}
        <path d="M 20 135 A 110 110 0 0 1 240 135" fill="none" stroke="#1b2c40" strokeWidth="1.5" />
        <path
          d={`M 20 135 A 110 110 0 0 1 ${130 + 110 * Math.cos((Math.PI * (180 - clamped)) / 180)} ${135 - 110 * Math.sin((Math.PI * (180 - clamped)) / 180)}`}
          fill="none" stroke="#4ff2e0" strokeWidth="2.5" filter="url(#glow)"
        />
        <circle cx="130" cy="135" r="3" fill="#4ff2e0" />
        <line
          x1="130" y1="135"
          x2={130 + 95 * Math.cos((Math.PI * (180 - clamped)) / 180)}
          y2={135 - 95 * Math.sin((Math.PI * (180 - clamped)) / 180)}
          stroke="#9c7bff" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)"
        />
      </svg>
      <div className="scanner-readout mono">{label} <span>{clamped}°</span></div>
      <div className="scanner-caption">amplitude de movimento · leitura em tempo real</div>
    </div>
  );
}

/* ============================================================
   PÁGINA · RESUMO (home dashboard, estrutura inspirada em SaaS de gestão)
============================================================ */

function PaginaResumo({ pacientes }) {
  const protocolosAtivos = pacientes.length;
  return (
    <>
      <div className="amp-banner">
        <div className="amp-banner-text mono">
          <Sparkles size={15} color="var(--cyan)" /> <b>3</b> pacientes ativos monitorados pela IA de progressão esta semana
        </div>
        <button className="btn solid pill">Ver protocolos</button>
      </div>

      <div className="amp-welcome">
        <div>
          <div className="amp-welcome-title disp">Pronto para escalar seu atendimento?</div>
          <div className="amp-welcome-sub">Desbloqueie relatórios avançados de alta, cartões de performance ilimitados e conciliação automática de convênio.</div>
        </div>
        <button className="btn solid pill">Conheça os planos</button>
      </div>

      <div className="amp-stats">
        <div className="amp-stat">
          <div className="amp-stat-label">Pacientes ativos</div>
          <div className="amp-stat-value">{pacientes.length}</div>
        </div>
        <div className="amp-stat">
          <div className="amp-stat-label">Protocolos ativos</div>
          <div className="amp-stat-value">{protocolosAtivos}</div>
        </div>
        <div className="amp-stat">
          <div className="amp-stat-label">Financeiro</div>
          <div className="amp-stat-link mono">Configurar recebimentos para ver saldo →</div>
        </div>
      </div>

      <div className="amp-widgets-head">
        <div className="amp-widgets-title">Seus widgets</div>
        <button className="btn ghost">Personalizar</button>
      </div>

      <div className="amp-widget-grid">
        <div className="amp-panel">
          <div className="amp-panel-head">
            <div className="amp-panel-title"><Activity size={15} color="var(--cyan)" /> Adesão</div>
          </div>
          <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 2 }}>
            {ADESAO_SEMANA.reduce((a, d) => a + d.treinos, 0)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 8 }}>sessões concluídas esta semana</div>
          <div style={{ width: "100%", height: 130 }}>
            <ResponsiveContainer>
              <BarChart data={ADESAO_SEMANA}>
                <XAxis dataKey="dia" stroke="#5f7d90" tick={{ fontSize: 10.5, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Bar dataKey="treinos" radius={[3, 3, 0, 0]} fill="#4ff2e0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="amp-panel">
          <div className="amp-panel-head">
            <div className="amp-panel-title"><Calendar size={15} color="var(--cyan)" /> Sessões hoje</div>
          </div>
          <div className="empty" style={{ padding: "22px 0" }}>Nenhuma sessão agendada para hoje.</div>
        </div>
      </div>

      <div className="amp-panel">
        <div className="amp-panel-head">
          <div className="amp-panel-title"><Bell size={15} color="var(--cyan)" /> Notificações</div>
          <Filter size={14} color="var(--muted)" />
        </div>
        {NOTIFICACOES.map((n, i) => (
          <div className="notif-item" key={i}>
            <div className="notif-dot" />
            <div style={{ flex: 1 }}>{n.texto}</div>
            <div className="notif-time">{n.tempo}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   PÁGINA · PRONTUÁRIO
============================================================ */

function PaginaProntuario({ pacientes, selecionadoId, onSelecionar, onAdicionar, onExcluir }) {
  const p = pacientes.find((x) => x.id === selecionadoId);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [diagnostico, setDiagnostico] = useState(Object.keys(DIAGNOSTICOS)[0]);
  const [fase, setFase] = useState("Aguda");
  const [planoNome, setPlanoNome] = useState("Particular · 12x");
  const [escoreInicial, setEscoreInicial] = useState("");
  const [admInicial, setAdmInicial] = useState("");
  const [dorInicial, setDorInicial] = useState("");

  const limparESalvar = () => {
    if (!nome.trim() || escoreInicial === "" || admInicial === "") return;
    onAdicionar({
      nome: nome.trim(),
      diagnostico,
      fase,
      plano: { nome: planoNome || "Particular", status: "em-dia", diasRestantes: null },
      sessaoInicial: { escore: Number(escoreInicial), adm: Number(admInicial), dor: Number(dorInicial || 0) },
    });
    setNome(""); setEscoreInicial(""); setAdmInicial(""); setDorInicial(""); setPlanoNome("Particular · 12x");
    setDiagnostico(Object.keys(DIAGNOSTICOS)[0]); setFase("Aguda");
    setMostrarForm(false);
  };

  return (
    <div className="amp-grid-2">
      <div className="amp-panel">
        <div className="amp-panel-head">
          <div className="amp-panel-title"><Users size={16} color="var(--cyan)" /> Pacientes</div>
          <button className="btn ghost" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? <X size={13} /> : <UserPlus size={13} />} {mostrarForm ? "Cancelar" : "Novo"}
          </button>
        </div>

        {mostrarForm && (
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--line-soft)" }}>
            <label className="field">Nome do paciente</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: Ana Souza" style={{ marginBottom: 10 }} />

            <label className="field">Diagnóstico</label>
            <select value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} style={{ marginBottom: 10 }}>
              {Object.keys(DIAGNOSTICOS).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <label className="field">Fase inicial</label>
            <select value={fase} onChange={(e) => setFase(e.target.value)} style={{ marginBottom: 10 }}>
              {FASES_OPCOES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>

            <label className="field">Plano / pacote</label>
            <input type="text" value={planoNome} onChange={(e) => setPlanoNome(e.target.value)} placeholder="ex: Particular · 12x" style={{ marginBottom: 10 }} />

            <label className="field">Escore inicial ({DIAGNOSTICOS[diagnostico].escala})</label>
            <input type="number" value={escoreInicial} onChange={(e) => setEscoreInicial(e.target.value)} placeholder="ex: 70" style={{ marginBottom: 10 }} />

            <label className="field">ADM inicial (°)</label>
            <input type="number" value={admInicial} onChange={(e) => setAdmInicial(e.target.value)} placeholder="ex: 60" style={{ marginBottom: 10 }} />

            <label className="field">Dor inicial (EVA 0–10)</label>
            <input type="number" value={dorInicial} onChange={(e) => setDorInicial(e.target.value)} placeholder="ex: 7" style={{ marginBottom: 12 }} />

            <button className="btn solid" style={{ width: "100%", justifyContent: "center" }} onClick={limparESalvar}>
              <Check size={13} /> Cadastrar paciente
            </button>
          </div>
        )}

        <div className="amp-plist">
          {pacientes.map((pac) => (
            <div key={pac.id} className={`amp-pcard ${pac.id === selecionadoId ? "active" : ""}`} onClick={() => onSelecionar(pac.id)}>
              <div>
                <div className="amp-pname">{pac.nome}</div>
                <div className="amp-pdiag mono">{pac.diagnostico}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn ghost"
                  style={{ padding: "5px 8px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Excluir ${pac.nome}? Essa ação não pode ser desfeita.`)) {
                      onExcluir(pac.id);
                    }
                  }}
                  title="Excluir paciente"
                >
                  <Trash2 size={13} />
                </button>
                <ChevronRight size={14} color="var(--muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {p && (
        <div className="amp-panel">
          <div className="amp-panel-head">
            <div>
              <div className="amp-eyebrow">Ficha clínica</div>
              <div className="amp-panel-title disp" style={{ fontSize: "1.05rem" }}>{p.nome}</div>
            </div>
            <span className="tag cyan">{p.fase}</span>
          </div>

          <Scanner deg={p.adm} label="ADM" />

          <div style={{ marginTop: 10 }}>
            <div className="row"><span className="row-label">Diagnóstico</span><span>{p.diagnostico}</span></div>
            <div className="row"><span className="row-label">Escala de referência</span><span className="mono">{DIAGNOSTICOS[p.diagnostico].escala}</span></div>
            <div className="row"><span className="row-label">Sessões realizadas</span><span className="mono">{p.sessoes.length}</span></div>
            <div className="row">
              <span className="row-label">Plano</span>
              <span className={`tag ${p.plano.status === "em-dia" ? "cyan" : p.plano.status === "glosa" ? "mag" : "warn"}`}>
                {p.plano.nome} {p.plano.status === "vence" ? `· vence em ${p.plano.diasRestantes}d` : p.plano.status === "glosa" ? "· aguardando glosa" : "· em dia"}
              </span>
            </div>
            <div className="row"><span className="row-label">Critério de alta</span><span style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "right", maxWidth: 220 }}>{DIAGNOSTICOS[p.diagnostico].criterioAlta}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PÁGINA · CONSTRUTOR DE PROTOCOLO
============================================================ */

function PaginaProtocolo({ pacientes, selecionadoId, onSelecionar }) {
  const p = pacientes.find((x) => x.id === selecionadoId);
  const [dosagens, setDosagens] = useState({});

  if (!p) return <div className="empty">Selecione um paciente em Pacientes.</div>;

  const exercicios = DIAGNOSTICOS[p.diagnostico].fases[p.fase];

  return (
    <div className="amp-grid-2">
      <div className="amp-panel">
        <div className="amp-panel-head">
          <div className="amp-panel-title"><ClipboardList size={16} color="var(--cyan)" /> Paciente</div>
        </div>
        <div className="amp-plist">
          {pacientes.map((pac) => (
            <div key={pac.id} className={`amp-pcard ${pac.id === selecionadoId ? "active" : ""}`} onClick={() => onSelecionar(pac.id)}>
              <div>
                <div className="amp-pname">{pac.nome}</div>
                <div className="amp-pdiag mono">{pac.fase}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="amp-panel">
        <div className="amp-panel-head">
          <div>
            <div className="amp-eyebrow">Auto-preenchido por diagnóstico</div>
            <div className="amp-panel-title disp" style={{ fontSize: "1.05rem" }}>{p.diagnostico} · {p.fase}</div>
          </div>
          <Zap size={18} color="var(--violet)" />
        </div>

        {exercicios.map((ex, i) => (
          <div className="ex-row" key={ex.nome}>
            <div className="ex-name"><span className="idx">{String(i + 1).padStart(2, "0")}</span>{ex.nome}</div>
            <input
              type="text"
              value={dosagens[ex.nome] ?? ex.dose}
              onChange={(e) => setDosagens((d) => ({ ...d, [ex.nome]: e.target.value }))}
            />
          </div>
        ))}

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn solid"><Check size={13} /> Confirmar protocolo da sessão</button>
          <button className="btn ghost">Ajustar fase manualmente</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PÁGINA · EVOLUÇÃO
============================================================ */

function PaginaEvolucao({ pacientes, selecionadoId, onSelecionar, onNovaSessao }) {
  const p = pacientes.find((x) => x.id === selecionadoId);
  const [escore, setEscore] = useState("");
  const [adm, setAdm] = useState("");
  const [dor, setDor] = useState("");

  if (!p) return <div className="empty">Selecione um paciente em Pacientes.</div>;

  const escala = DIAGNOSTICOS[p.diagnostico].escala;
  const ultimo = p.sessoes[p.sessoes.length - 1];
  const primeiro = p.sessoes[0];
  const quedaEscore = primeiro.escore - ultimo.escore;
  const sugestao = quedaEscore >= 40 && p.fase !== "Retorno";

  return (
    <div className="amp-grid-2">
      <div className="amp-panel">
        <div className="amp-panel-head">
          <div className="amp-panel-title"><Activity size={16} color="var(--cyan)" /> Paciente</div>
        </div>
        <div className="amp-plist">
          {pacientes.map((pac) => (
            <div key={pac.id} className={`amp-pcard ${pac.id === selecionadoId ? "active" : ""}`} onClick={() => onSelecionar(pac.id)}>
              <div className="amp-pname">{pac.nome}</div>
            </div>
          ))}
        </div>

        <div className="amp-panel-title" style={{ marginTop: 20, marginBottom: 10, fontSize: "0.8rem" }}>
          <Plus size={14} color="var(--cyan)" /> Registrar sessão
        </div>
        <label className="field">Escore {escala}</label>
        <input type="number" value={escore} onChange={(e) => setEscore(e.target.value)} placeholder="ex: 12" style={{ marginBottom: 10 }} />
        <label className="field">ADM (°)</label>
        <input type="number" value={adm} onChange={(e) => setAdm(e.target.value)} placeholder="ex: 128" style={{ marginBottom: 10 }} />
        <label className="field">Dor (EVA 0–10)</label>
        <input type="number" value={dor} onChange={(e) => setDor(e.target.value)} placeholder="ex: 2" style={{ marginBottom: 14 }} />
        <button
          className="btn solid"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => {
            if (escore === "" || adm === "") return;
            onNovaSessao(p.id, { escore: Number(escore), adm: Number(adm), dor: Number(dor || 0) });
            setEscore(""); setAdm(""); setDor("");
          }}
        >
          <Radio size={13} /> Registrar
        </button>
      </div>

      <div className="amp-panel">
        <div className="amp-panel-head">
          <div>
            <div className="amp-eyebrow">Painel de evolução</div>
            <div className="amp-panel-title disp" style={{ fontSize: "1.05rem" }}>{escala} ao longo do tratamento</div>
          </div>
          <span className="tag cyan mono">{ultimo.escore} pts</span>
        </div>

        {sugestao && (
          <div className="milestone-banner">
            <TrendingDown size={15} /> Queda de {quedaEscore} pontos detectada — sistema sugere avançar de fase.
          </div>
        )}

        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={p.sessoes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#132030" strokeDasharray="3 3" />
              <XAxis dataKey="s" stroke="#5f7d90" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `S${v}`} />
              <YAxis stroke="#5f7d90" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#0a1220", border: "1px solid #1b2c40", fontFamily: "JetBrains Mono", fontSize: 12 }} labelFormatter={(v) => `Sessão ${v}`} />
              <Line type="monotone" dataKey="escore" stroke="#4ff2e0" strokeWidth={2.5} dot={{ r: 3, fill: "#4ff2e0" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
          {escala}: {primeiro.escore} → {ultimo.escore} pts · critério de alta: {DIAGNOSTICOS[p.diagnostico].criterioAlta}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PÁGINA · PERFORMANCE
============================================================ */

function PaginaPerformance({ pacientes, selecionadoId, onSelecionar }) {
  const p = pacientes.find((x) => x.id === selecionadoId);
  const [gerado, setGerado] = useState(false);
  const [compartilhado, setCompartilhado] = useState(false);

  if (!p) return <div className="empty">Selecione um paciente em Pacientes.</div>;

  const escala = DIAGNOSTICOS[p.diagnostico].escala;
  const primeiro = p.sessoes[0];
  const ultimo = p.sessoes[p.sessoes.length - 1];
  const queda = primeiro.escore - ultimo.escore;

  return (
    <div className="amp-grid-2">
      <div className="amp-panel">
        <div className="amp-panel-head">
          <div className="amp-panel-title"><Share2 size={16} color="var(--cyan)" /> Paciente</div>
        </div>
        <div className="amp-plist">
          {pacientes.map((pac) => (
            <div key={pac.id} className={`amp-pcard ${pac.id === selecionadoId ? "active" : ""}`} onClick={() => { onSelecionar(pac.id); setGerado(false); setCompartilhado(false); }}>
              <div className="amp-pname">{pac.nome}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn solid" style={{ width: "100%", justifyContent: "center" }} onClick={() => setGerado(true)}>
            <Zap size={13} /> Gerar cartão de conquista
          </button>
        </div>
      </div>

      <div className="amp-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="amp-panel-head" style={{ width: "100%" }}>
          <div>
            <div className="amp-eyebrow">Marco detectado</div>
            <div className="amp-panel-title disp" style={{ fontSize: "1.05rem" }}>Pronto para compartilhar</div>
          </div>
        </div>

        {!gerado ? (
          <div className="empty">Clique em "Gerar cartão de conquista" para montar o card desta evolução.</div>
        ) : (
          <>
            <div className="perf-card">
              <div className="perf-inner">
                <div className="perf-brand">
                  <span>Amplitude</span>
                  <div className="perf-hex" />
                </div>
                <div className="perf-metric">{escala} {primeiro.escore}→{ultimo.escore}</div>
                <div className="perf-metric-label">QUEDA DE {queda} PONTOS EM {p.sessoes.length} SESSÕES</div>
                <div className="perf-footer">
                  <div className="perf-name">{p.nome.toUpperCase()}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>ADM {p.adm}°</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn ghost"><Download size={13} /> Baixar imagem</button>
              <button className="btn solid" onClick={() => setCompartilhado(true)}>
                <Share2 size={13} /> Compartilhar no Instagram
              </button>
            </div>
            {compartilhado && (
              <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", marginTop: 12 }}>
                Pronto para postar — marca da clínica aplicada automaticamente ao card.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PÁGINA · FINANCEIRO
============================================================ */

function PaginaFinanceiro({ pacientes }) {
  const statusInfo = { "em-dia": ["cyan", "Em dia"], glosa: ["mag", "Aguardando glosa"], vence: ["warn", "Vence em breve"] };
  return (
    <div className="amp-panel">
      <div className="amp-panel-head">
        <div className="amp-panel-title"><DollarSign size={16} color="var(--cyan)" /> Cobrança e repasse</div>
      </div>
      {pacientes.map((p) => {
        const [cls, label] = statusInfo[p.plano.status];
        return (
          <div className="row" key={p.id}>
            <div>
              <div style={{ fontSize: "0.85rem" }}>{p.nome}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>{p.plano.nome}</div>
            </div>
            <span className={`tag ${cls}`}>{label}</span>
          </div>
        );
      })}
      <div className="row"><span className="row-label">Repasse clínica (40%)</span><span className="mono">Automático · próximo ciclo em 4 dias</span></div>
    </div>
  );
}

/* ============================================================
   PÁGINA · CONFIGURAÇÕES (placeholder)
============================================================ */

function PaginaConfiguracoes() {
  return (
    <div className="amp-panel">
      <div className="amp-panel-head">
        <div className="amp-panel-title"><Settings size={16} color="var(--cyan)" /> Configurações</div>
      </div>
      <div className="row"><span className="row-label">Nome da clínica</span><span className="mono">Leandro Ferreira Fisioterapia</span></div>
      <div className="row"><span className="row-label">Marca no cartão de performance</span><span className="mono">Ativada</span></div>
      <div className="row"><span className="row-label">Sugestões automáticas de fase</span><span className="mono">Ativadas</span></div>
    </div>
  );
}

/* ============================================================
   APP
============================================================ */

const NAV_PRINCIPAL = [
  { id: "resumo", label: "Resumo", icon: Home },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "protocolo", label: "Protocolo", icon: ClipboardList },
  { id: "evolucao", label: "Evolução", icon: Activity },
  { id: "performance", label: "Performance", icon: Share2 },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
];

const STORAGE_KEY = "amplitude-pacientes";

export default function Amplitude() {
  const [pacientes, setPacientes] = useState(PACIENTES_INICIAL);
  const [pagina, setPagina] = useState("resumo");
  const [selecionadoId, setSelecionadoId] = useState(PACIENTES_INICIAL[0].id);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState(true);

  // Carrega os dados salvos do Supabase (banco pessoal, não compartilhado)
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY);
        if (ativo && res && res.value) {
          const dados = JSON.parse(res.value);
          if (Array.isArray(dados) && dados.length) {
            setPacientes(dados);
            setSelecionadoId(dados[0].id);
          }
        }
      } catch (e) {
        // ainda não existe nada salvo — segue com os dados iniciais
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  // Salva automaticamente sempre que os dados mudam
  useEffect(() => {
    if (carregando) return;
    setSalvo(false);
    storage
      .set(STORAGE_KEY, JSON.stringify(pacientes))
      .then(() => setSalvo(true))
      .catch(() => setSalvo(true));
  }, [pacientes, carregando]);

  const registrarSessao = (id, dados) => {
    setPacientes((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const proxNum = p.sessoes.length + 1;
        return { ...p, adm: dados.adm, sessoes: [...p.sessoes, { s: proxNum, ...dados }] };
      })
    );
  };

  const adicionarPaciente = ({ nome, diagnostico, fase, plano, sessaoInicial }) => {
    const novo = {
      id: `p${Date.now()}`,
      nome,
      diagnostico,
      fase,
      adm: sessaoInicial.adm,
      plano,
      sessoes: [{ s: 1, ...sessaoInicial }],
    };
    setPacientes((prev) => [...prev, novo]);
    setSelecionadoId(novo.id);
  };

  const excluirPaciente = (id) => {
    setPacientes((prev) => {
      const restantes = prev.filter((p) => p.id !== id);
      if (id === selecionadoId) {
        setSelecionadoId(restantes.length ? restantes[0].id : null);
      }
      return restantes;
    });
  };

  const TITULOS = {
    resumo: "Resumo",
    pacientes: "Pacientes",
    protocolo: "Construtor de protocolo",
    evolucao: "Painel de evolução",
    performance: "Cartão de performance",
    financeiro: "Financeiro",
    config: "Configurações",
  };

  return (
    <div className="amp-shell">
      <GlobalStyle />
      <div className="amp-scan" />

      <aside className="amp-sidebar">
        <div className="amp-brand">
          <div className="amp-brand-mark"><Hexagon size={16} /></div>
          <div>
            <div className="amp-brand-name">AMPLITUDE</div>
            <div className="amp-brand-sub">gestão clínica</div>
          </div>
        </div>

        <div className="amp-navgroup-label">Principal</div>
        {NAV_PRINCIPAL.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className={`amp-navitem ${pagina === item.id ? "active" : ""}`} onClick={() => setPagina(item.id)}>
              <Icon size={16} /> {item.label}
            </div>
          );
        })}

        <div className="amp-navgroup-label">Sistema</div>
        <div className={`amp-navitem ${pagina === "config" ? "active" : ""}`} onClick={() => setPagina("config")}>
          <Settings size={16} /> Configurações
        </div>

        <div className="amp-sidebar-footer">
          <div className="amp-avatar">LF</div>
          <div>
            <div className="amp-user-name">Leandro Ferreira</div>
            <div className="amp-user-sub mono">fisioterapeuta</div>
          </div>
        </div>
      </aside>

      <main className="amp-main">
        <div className="amp-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <PanelLeft size={17} color="var(--muted)" />
            <div className="disp" style={{ fontSize: "1rem" }}>{TITULOS[pagina]}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={12} color={salvo ? "var(--cyan)" : "var(--muted)"} /> {salvo ? "salvo" : "salvando..."}
            </div>
            <div className="amp-searchbox"><Search size={13} /> Buscar...</div>
            <div className="amp-topicons">
              <div className="amp-icon-btn"><MessageCircle size={15} /></div>
              <div className="amp-icon-btn"><Bell size={15} /></div>
            </div>
          </div>
        </div>

        <div className="amp-content">
          {carregando && <div className="empty">Carregando seus dados...</div>}
          {!carregando && pagina === "resumo" && <PaginaResumo pacientes={pacientes} />}
          {!carregando && pagina === "pacientes" && <PaginaProntuario pacientes={pacientes} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId} onAdicionar={adicionarPaciente} onExcluir={excluirPaciente} />}
          {!carregando && pagina === "protocolo" && <PaginaProtocolo pacientes={pacientes} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId} />}
          {!carregando && pagina === "evolucao" && <PaginaEvolucao pacientes={pacientes} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId} onNovaSessao={registrarSessao} />}
          {!carregando && pagina === "performance" && <PaginaPerformance pacientes={pacientes} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId} />}
          {!carregando && pagina === "financeiro" && <PaginaFinanceiro pacientes={pacientes} />}
          {!carregando && pagina === "config" && <PaginaConfiguracoes />}
        </div>
      </main>
    </div>
  );
}
