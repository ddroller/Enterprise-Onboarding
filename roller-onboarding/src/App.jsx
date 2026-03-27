import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown, ExternalLink, Upload, CheckCircle2, ArrowRight, Users,
  Building2, Rocket, HeadphonesIcon, Info, X, FileText, BookOpen,
  ClipboardCheck, AlertCircle, Star, Shield, Settings, Eye, Pencil,
  Trash2, Check, UploadCloud, ArrowUpRight, Lock
} from "lucide-react";
import {
  getSlugFromURL, setSlugInURL,
  loadCustomer, saveCustomer, deleteCustomer,
  loadCustomDocs, saveCustomDoc, removeCustomDoc,
} from "./supabase";

// ─── ROLLER Brand Tokens ───
const B = {
  blue10: "#011840", white: "#FFFFFF", blue50: "#0960F6",
  blue30: "#033180", blue95: "#EBF2FE", blue90: "#CEDFFD",
};

// ─── All Templates (Master List) ───
const ALL_TEMPLATES = [
  { id: "impl-hub", name: "Enterprise Implementation Hub", url: "https://docs.google.com/spreadsheets/d/1RPVG3OQXJvvEbfDlASXyGHz5CpK3rsorBu1ESBbqAus/edit?gid=1928632402#gid=1928632402", type: "spreadsheet", phase: 1 },
  { id: "kickoff-deck", name: "Kick-Off Deck", url: "https://docs.google.com/presentation/d/1CSwkjg3SoOQZlQ06u5tJCwtIidcCAYxQz6py4FDkuig/edit?usp=sharing", type: "presentation", phase: 1 },
  { id: "pre-meeting", name: "Pre-Meeting Email Template", url: "https://docs.google.com/document/d/1jTS90wKW1dQBHGpR7PQG1m0wmWzojn0lfmTwe4TOBPA/edit?tab=t.0", type: "document", phase: 1 },
  { id: "post-meeting", name: "Post-Meeting Email Template", url: "https://docs.google.com/document/d/1Lcb5U-qPcD7wMbc4OeAPMOFE0myZPMqoOJxk6uQGChQ/edit?usp=sharing", type: "document", phase: 1 },
  { id: "acs", name: "Account Creation Spreadsheet (ACS)", url: "https://docs.google.com/spreadsheets/d/1XD62WnEhKIHz4pPx1eVeN_WFeWBKBH9TBCXDqzx4a3M/edit?gid=94268330#gid=94268330", type: "spreadsheet", phase: 2 },
  { id: "impl-kickoff-email", name: "Implementation Kick-Off Email", url: "https://docs.google.com/document/d/17sYsn8ykQ0Y3STOI5KNAy5WB85YgoIOwIl5vOorbyXU/edit?tab=t.0", type: "document", phase: 3 },
  { id: "batch-kickoff-email", name: "Batch Kick-Off Email", url: "https://docs.google.com/document/d/1SlHF0Zw04QMmkBwGTaL8q6GNlOubMoutu9BDout39q8/edit?tab=t.0", type: "document", phase: 3 },
  { id: "checkin-1", name: "Check-in #1 Summary", url: "https://docs.google.com/document/d/1sB6cIctWkD8MnbjUzXyZrIla0YRj5CNxRo0hexBCnWw/edit?tab=t.0", type: "document", phase: 3 },
  { id: "checkin-2", name: "Check-in #2 Summary", url: "https://docs.google.com/document/d/1ll3RAGbdy_PWvKfR9OQaaP6y0VcN0LohwiiDkFvEeXk/edit?tab=t.0", type: "document", phase: 3 },
  { id: "checkin-3", name: "Check-in #3 Summary", url: "https://docs.google.com/document/d/1SpR3eGlm-lK2rsF_-dGovouC5rAqpQ1y1V4bCkUpmWs/edit?tab=t.0", type: "document", phase: 3 },
  { id: "checkin-4", name: "Check-in #4 Summary", url: "https://docs.google.com/document/d/1zYMNqper3X5uIhz-uFfD6cDZrgjFJhJC66r8pAAPQ1c/edit?tab=t.0", type: "document", phase: 3 },
  { id: "checkin-5", name: "Check-in #5 Summary", url: "https://docs.google.com/document/d/1zCNi1uQcrjkapWRAErFQDY-pHo5vPzqq4jkKEqZfHDs/edit?tab=t.0", type: "document", phase: 3 },
  { id: "kyc-reminder", name: "Urgent KYC Reminder Email", url: "https://docs.google.com/document/d/1xDkSniSp1Ovq9614fEwRRI6d0wVcba7lt9m3UYvHES4/edit?tab=t.0", type: "document", phase: 3 },
  { id: "post-launch-review", name: "Post Launch Review & Next Steps", url: "https://docs.google.com/document/d/1wRzdXAU5MPLxEUfFKtAH1255bdoMHoCVfpjTkgCpBUM/edit?tab=t.0", type: "document", phase: 4 },
];

const TEMPLATES_BY_PHASE = { 1: [], 2: [], 3: [], 4: [] };
ALL_TEMPLATES.forEach(t => TEMPLATES_BY_PHASE[t.phase].push(t));
["pre-meeting", "post-meeting"].forEach(id => {
  const t = ALL_TEMPLATES.find(x => x.id === id);
  [2, 3, 4].forEach(p => TEMPLATES_BY_PHASE[p].push(t));
});

// ─── Model Comparison ───
const MODEL_COMPARISON = [
  { area: "Phase 2", growth: "Platform build + ACS + data migration", centralized: "Platform build + ACS + data migration + 3-day onsite trainer certification + FAQ Document" },
  { area: "Phase 3 — Kick-Off", growth: "ROLLER sends all batch kick-off emails", centralized: "Your certified trainer sends batch kick-off emails" },
  { area: "Phase 3 — Training", growth: "5 weekly check-ins + 3 webinars", centralized: "3 webinars only (trainer attends with operators)" },
  { area: "Phase 3 — Go-Live", growth: "ROLLER actively supports every launch", centralized: "ROLLER active for first 1–2 batches, then on-call" },
];

// ─── Logo ───
function RollerLogo({ width = 120 }) {
  return <svg width={width} viewBox="0 0 600 140" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="105" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="110" fill={B.blue10} letterSpacing="-2">ROLLER</text></svg>;
}

// ─── Role Badge ───
function RoleBadge({ role }) {
  const c = { customer: { l: "Your Action", bg: "#DBEAFE", c: B.blue50, i: Users }, roller: { l: "ROLLER Handles", bg: B.blue95, c: B.blue30, i: Shield }, shared: { l: "Collaborative", bg: B.blue90, c: B.blue10, i: Star } }[role] || { l: "Collaborative", bg: B.blue90, c: B.blue10, i: Star };
  const I = c.i;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: c.bg, color: c.c, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}><I size={12} />{c.l}</span>;
}

// ─── Template Link ───
function TemplateLink({ templateId, customDocs, isManager, onManage }) {
  const orig = ALL_TEMPLATES.find(t => t.id === templateId);
  if (!orig) return null;
  const custom = customDocs?.[templateId];
  const url = custom ? custom.url : orig.url;
  const name = custom ? custom.name : orig.name;
  const isCust = !!custom;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: isCust ? "#ECFDF5" : B.blue95, color: isCust ? "#059669" : B.blue50, fontSize: 12, fontWeight: 600, textDecoration: "none", border: `1px solid ${isCust ? "#A7F3D0" : B.blue90}`, maxWidth: 280 }}>
        {isCust ? <CheckCircle2 size={13} /> : <FileText size={13} />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        {isCust && <span style={{ fontSize: 9, opacity: 0.7, flexShrink: 0, background: "rgba(5,150,105,0.1)", padding: "1px 5px", borderRadius: 4 }}>LIVE</span>}
        <ExternalLink size={11} style={{ flexShrink: 0 }} />
      </a>
      {isManager && (
        <button onClick={() => onManage(templateId)} style={{ width: 26, height: 26, borderRadius: 6, background: isCust ? "#ECFDF5" : B.blue95, border: `1px solid ${isCust ? "#A7F3D0" : B.blue90}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isCust ? <Check size={11} color="#059669" /> : <Pencil size={11} color={B.blue30} />}
        </button>
      )}
    </span>
  );
}

// ─── Document Manager Modal ───
function DocManagerModal({ templateId, customDocs, onSave, onRemove, onClose, customerName }) {
  const orig = ALL_TEMPLATES.find(t => t.id === templateId);
  const existing = customDocs?.[templateId];
  const [mode, setMode] = useState(existing ? "view" : "add");
  const [url, setUrl] = useState(existing?.url || "");
  const [name, setName] = useState(existing?.name || (orig ? `${customerName} — ${orig.name}` : ""));
  if (!orig) return null;
  const ok = url.trim() && name.trim();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(1,24,64,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }} onClick={onClose}>
      <div style={{ background: B.white, borderRadius: 16, maxWidth: 560, width: "100%", boxShadow: "0 24px 80px rgba(1,24,64,0.3)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: B.blue10, padding: "20px 24px", color: B.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: B.blue90, marginBottom: 6 }}>Document Management</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{orig.name}</h3>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} color={B.white} /></button>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: B.blue30, marginBottom: 8 }}>Step 1: Open the ROLLER Template</div>
            <a href={orig.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: B.blue95, border: `1px solid ${B.blue90}`, textDecoration: "none", color: B.blue10 }}>
              <FileText size={16} color={B.blue50} /><span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{orig.name}</span><ArrowUpRight size={14} color={B.blue50} />
            </a>
            <p style={{ fontSize: 12, color: B.blue30, marginTop: 8, lineHeight: 1.5 }}>Open this template, make a copy for <strong>{customerName}</strong>, customize it, then paste the new URL below.</p>
          </div>
          <div style={{ height: 1, background: B.blue90, margin: "20px 0" }} />
          {existing && mode === "view" ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#059669", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={13} />Customer Document (Active)</div>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: B.blue10, marginBottom: 4 }}>{existing.name}</div>
                <a href={existing.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#059669", wordBreak: "break-all" }}>{existing.url}</a>
              </div>
              <p style={{ fontSize: 12, color: B.blue30, marginTop: 10, lineHeight: 1.5 }}>The customer sees this document instead of the template.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button onClick={() => { setMode("edit"); setUrl(existing.url); setName(existing.name); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: B.blue95, border: `1px solid ${B.blue90}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: B.blue10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Pencil size={14} /> Update URL</button>
                <button onClick={() => { onRemove(templateId); onClose(); }} style={{ padding: "10px 16px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Trash2 size={14} /> Revert</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: B.blue50, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><UploadCloud size={13} />{existing ? "Update" : "Step 2: Add Customer Document"}</div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: B.blue10, marginBottom: 6 }}>Document Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder={`e.g., ${customerName} — ${orig.name}`} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${B.blue90}`, fontSize: 13, color: B.blue10, outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = B.blue50} onBlur={e => e.target.style.borderColor = B.blue90} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: B.blue10, marginBottom: 6 }}>Document URL</label>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste the Google Doc / Sheet / Slides URL" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${B.blue90}`, fontSize: 13, color: B.blue10, outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = B.blue50} onBlur={e => e.target.style.borderColor = B.blue90} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {existing && <button onClick={() => setMode("view")} style={{ padding: "10px 16px", borderRadius: 10, background: B.blue95, border: `1px solid ${B.blue90}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: B.blue30 }}>Cancel</button>}
                <button disabled={!ok} onClick={() => { onSave(templateId, { url: url.trim(), name: name.trim() }); onClose(); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: ok ? B.blue50 : B.blue90, border: "none", cursor: ok ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: B.white, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: ok ? 1 : 0.5 }}><CheckCircle2 size={14} />{existing ? "Update" : "Save"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step Card ───
function StepCard({ step, index, sectionIndex, isManager, customDocs, onManageDoc }) {
  const [open, setOpen] = useState(false);
  const tids = step.templateIds || (step.templateId ? [step.templateId] : []);
  return (
    <div style={{ background: step.highlight ? B.blue95 : B.white, border: `1px solid ${step.highlight ? B.blue50 : B.blue90}`, borderRadius: 12, overflow: "hidden", boxShadow: open ? "0 4px 20px rgba(1,24,64,0.08)" : "none" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: B.blue10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: open ? B.blue50 : B.blue95, color: open ? B.white : B.blue30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {sectionIndex !== undefined ? `${sectionIndex + 1}.${index + 1}` : index + 1}
        </span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{step.title}</span>
        <RoleBadge role={step.role} />
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}><ChevronDown size={18} color={B.blue30} /></span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px 60px", animation: "fadeIn 0.2s ease" }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: B.blue10, margin: "0 0 12px", whiteSpace: "pre-line" }}>{step.what}</p>
          {step.rollerAction && <div style={{ background: B.blue95, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, lineHeight: 1.6, color: B.blue30, borderLeft: `3px solid ${B.blue50}` }}><strong>ROLLER pre-work:</strong> {step.rollerAction}</div>}
          {step.action && <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, lineHeight: 1.6, color: B.blue10, borderLeft: `3px solid ${B.blue50}` }}><strong style={{ color: B.blue50 }}>What you need to do:</strong> {step.action}</div>}
          {tids.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tids.map((tid, i) => <TemplateLink key={i} templateId={tid} customDocs={customDocs} isManager={isManager} onManage={onManageDoc} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Phase Section ───
function PhaseSection({ section, sectionIndex, isManager, customDocs, onManageDoc }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {section.title && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${B.blue90}` }}>{section.highlight && <Star size={16} color={B.blue50} />}<h4 style={{ fontSize: 16, fontWeight: 700, color: B.blue10, margin: 0 }}>{section.title}</h4></div>}
      {section.note && <div style={{ background: "#FEF3C7", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, lineHeight: 1.6, color: "#92400E", borderLeft: "3px solid #F59E0B", display: "flex", gap: 8 }}><AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />{section.note}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {section.steps.map((s, i) => <StepCard key={i} step={s} index={i} sectionIndex={section.title ? sectionIndex : undefined} isManager={isManager} customDocs={customDocs} onManageDoc={onManageDoc} />)}
      </div>
    </div>
  );
}

// ─── Handoff Criteria ───
function HandoffCriteria({ items, nextPhase }) {
  return (
    <div style={{ background: B.blue10, borderRadius: 12, padding: "20px 24px", marginTop: 24, color: B.white }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", letterSpacing: 0.5, textTransform: "uppercase", color: B.blue90 }}>{nextPhase ? `Ready for ${nextPhase}?` : "Completion Criteria"}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, lineHeight: 1.6 }}><CheckCircle2 size={16} color={B.blue50} style={{ flexShrink: 0, marginTop: 2 }} />{item}</div>)}
      </div>
    </div>
  );
}

// ─── Resources Panel ───
function ResourcesPanel({ phaseId, onClose, isManager, customDocs, onManageDoc }) {
  const templates = TEMPLATES_BY_PHASE[phaseId] || [];
  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, background: B.white, boxShadow: "-8px 0 40px rgba(1,24,64,0.15)", zIndex: 1000, overflowY: "auto", padding: 28, animation: "slideIn 0.25s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: B.blue10, margin: 0 }}>Phase {phaseId} Resources</h3>
        <button onClick={onClose} style={{ background: B.blue95, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} color={B.blue10} /></button>
      </div>
      {isManager && <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 12, lineHeight: 1.6, color: "#92400E", border: "1px solid #FDE68A" }}><strong>T&I Manager:</strong> Click the edit icon to replace any template with a customer-specific document.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {templates.map((t, i) => {
          const cust = customDocs?.[t.id];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a href={cust ? cust.url : t.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: cust ? "#ECFDF5" : B.blue95, color: B.blue10, textDecoration: "none", border: `1px solid ${cust ? "#A7F3D0" : B.blue90}` }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: B.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cust ? <CheckCircle2 size={18} color="#059669" /> : <FileText size={18} color={B.blue50} />}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cust ? cust.name : t.name}</div>
                  <div style={{ fontSize: 10, color: cust ? "#059669" : B.blue30, fontWeight: 600, marginTop: 2 }}>{cust ? "Customer Document" : "ROLLER Template"}</div>
                </div>
                <ExternalLink size={14} color={B.blue30} style={{ flexShrink: 0 }} />
              </a>
              {isManager && (
                <button onClick={() => onManageDoc(t.id)} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: cust ? "#ECFDF5" : B.blue95, border: `1px solid ${cust ? "#A7F3D0" : B.blue90}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cust ? <Pencil size={14} color="#059669" /> : <UploadCloud size={14} color={B.blue30} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Model Comparison ───
function ModelComparisonModal({ model, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(1,24,64,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }} onClick={onClose}>
      <div style={{ background: B.white, borderRadius: 16, padding: 32, maxWidth: 760, width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(1,24,64,0.3)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: B.blue10, margin: 0 }}>Implementation Model Comparison</h3>
          <button onClick={onClose} style={{ background: B.blue95, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} color={B.blue10} /></button>
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${B.blue90}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: B.blue10, color: B.white, padding: "12px 16px", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}><span>Area</span><span>Growth</span><span>Centralized</span></div>
          {MODEL_COMPARISON.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 16px", fontSize: 13, lineHeight: 1.5, borderTop: `1px solid ${B.blue90}`, background: i % 2 === 0 ? B.white : B.blue95 }}>
              <span style={{ fontWeight: 600 }}>{r.area}</span>
              <span style={{ fontWeight: model === "growth" ? 600 : 400, background: model === "growth" ? "#DBEAFE" : "transparent", padding: model === "growth" ? "2px 8px" : 0, borderRadius: 6 }}>{r.growth}</span>
              <span style={{ fontWeight: model === "centralized" ? 600 : 400, background: model === "centralized" ? "#E0E7FF" : "transparent", padding: model === "centralized" ? "2px 8px" : 0, borderRadius: 6 }}>{r.centralized}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phase Data ───
const getPhases = (model) => [
  { id: 1, title: "Getting Started", subtitle: "Planning Your Launch", icon: ClipboardCheck, purpose: "We'll plan your entire ROLLER rollout — how many venues to start with, the timeline, and the order we'll bring each location online.", steps: [
    { title: "Define the Rollout Strategy", role: "shared", what: "Your ROLLER team works with your corporate lead to determine which venues launch first, how many per batch, and the timeline.", action: "Participate in planning and confirm venue priorities." },
    { title: "Create the Implementation Hub", role: "roller", what: "ROLLER creates a central tracking spreadsheet showing every venue, its status, and go-live readiness.", templateId: "impl-hub" },
    { title: "Sales Handover", role: "roller", what: "Your Account Executive formally introduces the implementation team. No action needed from you." },
    { title: "Assign Build Resources", role: "roller", what: "ROLLER assigns dedicated team members to build your venue accounts." },
    { title: "Set Up Recurring Meetings", role: "roller", what: "ROLLER schedules all recurring check-ins — including a Weekly Steering Committee with your corporate team.", templateIds: ["pre-meeting", "post-meeting"] },
    { title: "Create Communication Channels", role: "roller", what: "ROLLER sets up a shared email distribution list and coordination channels." },
    { title: "Create Shared Drive", role: "roller", what: "ROLLER creates a shared Google Drive for all project documents." },
    { title: "Account Kick-Off Meeting", role: "customer", what: "The big kickoff! ROLLER introduces the project team, walks through the plan, confirms scope and timeline.", action: "Attend with your corporate/operations lead.", templateId: "kickoff-deck" },
    { title: "Account Requirements Gathering", role: "customer", what: "A deep-dive into your business — products, pricing, booking flows, memberships, waivers, and migration source.", action: "Come prepared to discuss your product catalog, pricing, memberships, waivers, and custom needs." },
  ], handoff: ["Rollout strategy agreed", "Kick-Off completed", "Requirements gathering completed", "All infrastructure in place"] },
  { id: 2, title: model === "growth" ? "Building Your Platform" : "Building Your Platform & Certifying Your Trainers", subtitle: "Validation", icon: Building2,
    purpose: model === "growth" ? "We build the foundation: headquarters account, Master Template, first venue, and start migrating your data." : "We build the foundation AND certify your trainers via a 3-day onsite program.",
    sections: model === "growth" ? [{ title: null, steps: [
      { title: "Build the HQ Account", role: "shared", what: "ROLLER configures headquarters-level products that flow to every venue.", action: "Attend and confirm products, pricing, and configurations." },
      { title: "Build the Master Template", role: "shared", what: "A standardized venue \"blueprint\" cloned for every new venue.", action: "Attend build sessions (usually 2) to review." },
      { title: "Build the First Venue", role: "shared", what: "First venue created from the Master Template as a live walkthrough.", action: "Attend and observe (recorded for reference)." },
      { title: "Complete the ACS", role: "customer", what: "ROLLER sends a spreadsheet for each venue's specific details.", action: "Complete and return the ACS for all initial venues.", templateId: "acs" },
      { title: "Initial Data Migration", role: "shared", what: "If migrating, ROLLER imports historical data into Playground.", action: "Provide data files, then review and approve." },
      { title: "Build the Rocketship Checklist", role: "roller", what: "ROLLER creates a customized pre-launch verification checklist." },
    ]}] : [
      { title: "Planning & Preparation", steps: [{ title: "Collect Staff Roster", role: "customer", what: "Provide a list of all staff who need ROLLER accounts.", action: "Include trainers, roles, and permission levels." }, { title: "Plan Onsite Certification", role: "shared", what: "ROLLER coordinates the 3-day onsite certification.", action: "Confirm dates and location." }] },
      { title: "Platform Build", steps: [{ title: "Build the HQ Account", role: "shared", what: "Configure headquarters-level products.", action: "Attend and confirm." }, { title: "Build the Master Template", role: "shared", what: "Create the venue blueprint.", action: "Attend build sessions." }, { title: "Build the First Venue", role: "shared", what: "First venue from Master Template.", action: "Attend and observe." }] },
      { title: "Data Migration", steps: [{ title: "Initial Data Migration", role: "shared", what: "ROLLER imports data into Playground.", action: "Provide data, then review.", templateId: "acs" }] },
      { title: "Onsite Trainer Certification (3 Days)", highlight: true, note: "For implementations with 20+ venues. All trainers must complete certification before rollout.", steps: [
        { title: "Pre-Work", role: "shared", what: "Both sides complete pre-work.", action: "Ensure all hardware on-site.", rollerAction: "Hardware shipping and integrations staged." },
        { title: "Day 1 — Corporate Training", role: "shared", what: "HQ review + New Venue Build demo.", action: "Attend all sessions." },
        { title: "Day 2 — Full Team Training", role: "shared", what: "Hardware, navigation, booking ops, POS practice, reporting, troubleshooting.", action: "All trainers and staff attend." },
        { title: "Day 3 — Launch Support", role: "shared", what: "Live support or additional practice.", action: "Participate fully." },
        { title: "Certification Competencies", role: "customer", what: "Trainers must pass: HQ/venue config, ROLLER Learn, Venue Manager, POS, troubleshooting, go-live checklist.", action: "All trainers must pass." },
      ] },
      { title: "Readiness & Documentation", steps: [{ title: "FAQ Document", role: "roller", what: "ROLLER compiles all questions into a categorized FAQ." }, { title: "Build the Rocketship Checklist", role: "roller", what: "Customized pre-launch verification checklist." }] },
    ],
    handoff: model === "growth" ? ["HQ confirmed", "Master Template verified", "First venue built", "ACS sent", "Data approved", "Checklist ready"] : ["HQ confirmed", "Master Template verified", "First venue built", "Data approved", "Trainers certified", "FAQ started", "Training strategy approved", "Checklist ready"],
  },
  { id: 3, title: model === "growth" ? "Launching Your Venues" : "Launching — Trainer-Led", subtitle: "Rollout — Batch by Batch", icon: Rocket, iterates: true,
    purpose: model === "growth" ? "Each batch: kick-off → training → payments → data migration → launch. ROLLER leads every step." : "Your certified trainers lead each batch, supported by ROLLER.",
    sections: model === "growth" ? [
      { title: "Batching & Kick-Off", steps: [{ title: "ROLLER Learn Access", role: "customer", what: "ROLLER sets up training accounts.", action: "Complete all courses." }, { title: "Rocketship Checklist Added", role: "roller", what: "Added to each venue." }, { title: "Re-confirm Batch Strategy", role: "shared", what: "ROLLER confirms the plan.", action: "Confirm or adjust." }, { title: "Kick-Off Emails", role: "roller", what: "Implementation + batch kick-off emails.", templateIds: ["impl-kickoff-email", "batch-kickoff-email"] }] },
      { title: "Training & Payments", steps: [{ title: "Weekly Check-ins (5 Weeks)", role: "customer", what: "Week 1: ACS Walkthrough\nWeek 2: Missing Info\nWeek 3: Access, KYC & Training\nWeek 4: Homework Review\nWeek 5: Final Review", action: "Attend all. Submit ACS before Week 2.", templateIds: ["checkin-1","checkin-2","checkin-3","checkin-4","checkin-5"] }, { title: "Webinars (3 Sessions)", role: "customer", what: "1: Venue Manager\n2: POS\n3: Q&A", action: "Attend all three." }, { title: "Edge Case Training", role: "roller", what: "ROLLER records supplemental videos." }, { title: "KYC Verification", role: "customer", what: "Each venue completes KYC through Adyen.", action: "Complete KYC when prompted.", templateId: "kyc-reminder" }, { title: "ROLLER Payments Setup", role: "shared", what: "Validate → KYC → payments on → terminals ordered → boarded.", action: "Complete KYC, confirm terminals." }] },
      { title: "Data Migration (if applicable)", steps: [{ title: "Data Curation & Migration", role: "shared", what: "ROLLER maps and loads data.", action: "Review and approve." }] },
      { title: "Pre-Launch & Go-Live", steps: [{ title: "Final Verifications", role: "shared", what: "Checklist: Rocketship ✓, Checkout URL ✓, Training ✓, Hardware ✓, Payments ✓, Data ✓, Go-live confirmed ✓", action: "Add checkout URL, finish courses, confirm hardware." }, { title: "Launch Day!", role: "shared", what: "Your venue goes live! ROLLER actively supports every launch.", action: "Be available.", highlight: true }] },
    ] : [
      { title: "Batching & Kick-Off", steps: [{ title: "ROLLER Learn Access", role: "customer", what: "Training accounts set up.", action: "Complete courses." }, { title: "Rocketship Checklist Added", role: "roller", what: "Added to each venue." }, { title: "Re-confirm Batch Strategy", role: "shared", what: "Confirm plan.", action: "Confirm or adjust." }, { title: "Kick-Off Emails", role: "customer", what: "ROLLER sends overall kick-off. Your Trainer sends batch emails.", action: "Trainers send batch communications.", templateIds: ["impl-kickoff-email", "batch-kickoff-email"] }] },
      { title: "Training & Payments", steps: [{ title: "Webinars (3 Sessions)", role: "customer", what: "1: Venue Manager\n2: POS\n3: Q&A\nTrainer attends with operators.", action: "Trainers + operators attend all." }, { title: "Edge Case Training", role: "roller", what: "ROLLER records supplemental videos." }, { title: "KYC Verification", role: "customer", what: "Each venue completes KYC.", action: "Complete when prompted.", templateId: "kyc-reminder" }, { title: "ROLLER Payments Setup", role: "shared", what: "Validate → KYC → payments → terminals.", action: "Complete KYC, confirm terminals." }] },
      { title: "Data Migration (if applicable)", steps: [{ title: "Data Curation & Migration", role: "shared", what: "ROLLER maps and loads data.", action: "Review and approve." }] },
      { title: "Pre-Launch & Go-Live", steps: [{ title: "Final Verifications", role: "shared", what: "Full pre-launch checklist.", action: "Complete your items." }, { title: "Launch Day!", role: "shared", what: "First 1–2 batches: ROLLER active. Then your trainer leads.", action: "Be available.", highlight: true }, { title: "Trainer Transition", role: "customer", what: "ROLLER shifts to on-call as your trainer gains experience.", action: "Trainers take ownership." }] },
    ],
    handoff: ["All operators trained", "KYC + Payments for every venue", "Data validated", "Checklists complete", "All venues live"],
  },
  { id: 4, title: "After Launch", subtitle: "Ongoing Support", icon: HeadphonesIcon, purpose: "We review performance, address feedback, and transition you to ongoing support.", steps: [
    { title: "Post-Launch Batch Review", role: "customer", what: "One week after go-live, ROLLER hosts a review.", action: "Attend and share feedback.", templateId: "post-launch-review" },
    { title: "Feedback & CSAT Review", role: "roller", what: "ROLLER reviews survey responses." },
    { title: "Areas of Improvement", role: "shared", what: "Dedicated meeting if notable feedback exists.", action: "Participate if invited." },
    { title: "Transition to Standard Support", role: "roller", what: "Venues move to standard ROLLER support." },
    { title: "Dedicated Support Team", role: "roller", what: "For large customers: 3–4 person team trained on your config." },
    { title: "Post-Launch Check-ins", role: "roller", what: "Recurring check-ins (weekly → bi-weekly)." },
  ], handoff: ["Post-Launch Review done", "Feedback actioned", "Standard support active", "Check-in cadence running"] },
];

// ─── Setup Screen ───
function SetupScreen({ onComplete, loading }) {
  const [model, setModel] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoName, setLogoName] = useState("");
  const fileRef = useRef(null);
  const handleFile = e => { const f = e.target.files?.[0]; if (f) { setLogoName(f.name); const r = new FileReader(); r.onload = ev => setLogoUrl(ev.target.result); r.readAsDataURL(f); } };
  const autoSlug = (val) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const ok = model && name.trim() && slug.trim();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: B.blue10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: B.white }}>
          <RollerLogo width={140} />
          <p style={{ marginTop: 20, fontSize: 14, color: B.blue90 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: B.blue10, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: B.white, borderRadius: 20, padding: "48px 44px", maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}><RollerLogo width={140} /><div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: B.blue30 }}>Enterprise Implementation Setup</div></div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: B.blue10, marginBottom: 10 }}>Implementation Model</label>
          {[{ id: "growth", n: "Growth Enablement", d: "T&I stays actively involved with weekly check-ins and hands-on support." }, { id: "centralized", n: "Centralized Enablement", d: "Customer Trainers certified in Phase 2 then lead rollouts independently." }].map(m => (
            <button key={m.id} onClick={() => setModel(m.id)} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: 12, textAlign: "left", border: `2px solid ${model === m.id ? B.blue50 : B.blue90}`, background: model === m.id ? B.blue95 : B.white, cursor: "pointer", width: "100%", marginBottom: 10 }}>
              <span style={{ width: 20, height: 20, borderRadius: 10, flexShrink: 0, marginTop: 1, border: `2px solid ${model === m.id ? B.blue50 : B.blue90}`, background: model === m.id ? B.blue50 : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{model === m.id && <span style={{ width: 8, height: 8, borderRadius: 4, background: B.white }} />}</span>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: B.blue10, marginBottom: 4 }}>{m.n}</div><div style={{ fontSize: 12, color: B.blue30, lineHeight: 1.5 }}>{m.d}</div></div>
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: B.blue10, marginBottom: 8 }}>Customer Name</label>
          <input value={name} onChange={e => { setName(e.target.value); if (!slug || slug === autoSlug(name)) setSlug(autoSlug(e.target.value)); }} placeholder="e.g., We Rock the Spectrum" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `2px solid ${B.blue90}`, fontSize: 14, color: B.blue10, outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = B.blue50} onBlur={e => e.target.style.borderColor = B.blue90} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: B.blue10, marginBottom: 4 }}>Customer URL Slug</label>
          <p style={{ fontSize: 11, color: B.blue30, margin: "0 0 8px", lineHeight: 1.5 }}>This creates the shareable link: <code style={{ background: B.blue95, padding: "2px 6px", borderRadius: 4 }}>yoursite.com/?c=<strong>{slug || "..."}</strong></code></p>
          <input value={slug} onChange={e => setSlug(autoSlug(e.target.value))} placeholder="e.g., wrts" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `2px solid ${B.blue90}`, fontSize: 14, color: B.blue10, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} onFocus={e => e.target.style.borderColor = B.blue50} onBlur={e => e.target.style.borderColor = B.blue90} />
        </div>
        <div style={{ marginBottom: 36 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: B.blue10, marginBottom: 8 }}>Customer Logo <span style={{ fontWeight: 400, color: B.blue30 }}>(optional)</span></label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "20px 16px", borderRadius: 10, border: `2px dashed ${logoUrl ? B.blue50 : B.blue90}`, background: logoUrl ? B.blue95 : B.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {logoUrl ? <><img src={logoUrl} alt="" style={{ height: 32, objectFit: "contain" }} /><span style={{ fontSize: 13, color: B.blue30 }}>{logoName}</span></> : <><Upload size={18} color={B.blue30} /><span style={{ fontSize: 13, color: B.blue30 }}>Click to upload</span></>}
          </button>
        </div>
        <button onClick={() => ok && onComplete({ model, customer_name: name.trim(), slug: slug.trim(), logo_url: logoUrl })} disabled={!ok} style={{ width: "100%", padding: "14px 20px", borderRadius: 12, background: ok ? B.blue50 : B.blue90, color: B.white, border: "none", fontSize: 15, fontWeight: 700, cursor: ok ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: ok ? 1 : 0.6 }}>Create & Launch <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [customer, setCustomer] = useState(null);  // { id, slug, customer_name, model, logo_url }
  const [customDocs, setCustomDocs] = useState({});
  const [activePhase, setActivePhase] = useState(1);
  const [showResources, setShowResources] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [managingDoc, setManagingDoc] = useState(null);
  const [isManager, setIsManager] = useState(() => localStorage.getItem('roller-mgr') !== 'false');
  const [loading, setLoading] = useState(true);

  // Load customer from URL slug on mount
  useEffect(() => {
    (async () => {
      const slug = getSlugFromURL();
      if (slug) {
        const c = await loadCustomer(slug);
        if (c) {
          setCustomer(c);
          const docs = await loadCustomDocs(c.id || c.slug);
          setCustomDocs(docs);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleSetup = async (cfg) => {
    const saved = await saveCustomer(cfg);
    if (saved) {
      setCustomer(saved);
      setSlugInURL(cfg.slug);
    }
  };

  const handleReset = async () => {
    if (customer?.slug) {
      await deleteCustomer(customer.slug);
    }
    setCustomer(null);
    setCustomDocs({});
    setActivePhase(1);
    const url = new URL(window.location);
    url.searchParams.delete('c');
    window.history.replaceState({}, '', url);
  };

  const handleSaveDoc = async (templateId, doc) => {
    const customerId = customer.id || customer.slug;
    await saveCustomDoc(customerId, templateId, doc);
    setCustomDocs(prev => ({ ...prev, [templateId]: doc }));
  };

  const handleRemoveDoc = async (templateId) => {
    const customerId = customer.id || customer.slug;
    await removeCustomDoc(customerId, templateId);
    setCustomDocs(prev => { const n = { ...prev }; delete n[templateId]; return n; });
  };

  const toggleMgr = () => {
    const next = !isManager;
    setIsManager(next);
    localStorage.setItem('roller-mgr', String(next));
  };

  if (loading || !customer) return <SetupScreen onComplete={handleSetup} loading={loading} />;

  const phases = getPhases(customer.model);
  const cur = phases.find(p => p.id === activePhase);
  const pNames = ["Scoping", "Validation", "Rollout", "Support"];
  const pIcons = [ClipboardCheck, Building2, Rocket, HeadphonesIcon];
  const custCount = Object.keys(customDocs).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFF" }}>
      {isManager && (
        <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 32px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Settings size={14} color="#92400E" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>T&I Manager Mode</span>
          <span style={{ fontSize: 11, color: "#B45309", background: "#FEF3C7", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{custCount} doc{custCount !== 1 ? "s" : ""} customized</span>
          <button onClick={toggleMgr} style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 6, background: "#FEF3C7", border: "1px solid #FDE68A", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#92400E", display: "flex", alignItems: "center", gap: 4 }}><Eye size={12} /> Customer View</button>
        </div>
      )}

      <header style={{ background: B.white, borderBottom: `1px solid ${B.blue90}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <RollerLogo width={100} /><span style={{ width: 1, height: 28, background: B.blue90 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {customer.logo_url && <img src={customer.logo_url} alt="" style={{ height: 28, objectFit: "contain" }} />}
              <span style={{ fontSize: 15, fontWeight: 700, color: B.blue10 }}>{customer.customer_name}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setShowComparison(true)} style={{ padding: "6px 14px", borderRadius: 8, background: customer.model === "growth" ? "#DBEAFE" : "#E0E7FF", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: B.blue50, display: "flex", alignItems: "center", gap: 6 }}><Info size={13} />{customer.model === "growth" ? "Growth" : "Centralized"}</button>
            {!isManager && <button onClick={toggleMgr} style={{ padding: "6px 10px", borderRadius: 8, background: B.blue95, border: "none", cursor: "pointer" }}><Lock size={13} color={B.blue30} /></button>}
            {isManager && <button onClick={handleReset} style={{ padding: "6px 12px", borderRadius: 8, background: B.blue95, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: B.blue30 }}>Reset</button>}
          </div>
        </div>
      </header>

      <nav style={{ background: B.white, borderBottom: `1px solid ${B.blue90}`, padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          {phases.map((p, i) => {
            const I = pIcons[i]; const a = activePhase === p.id;
            return <button key={p.id} onClick={() => setActivePhase(p.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 12px", background: "none", border: "none", borderBottom: `3px solid ${a ? B.blue50 : "transparent"}`, cursor: "pointer" }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: a ? B.blue50 : B.blue95, color: a ? B.white : B.blue30, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={16} /></span>
              <div style={{ textAlign: "left" }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: a ? B.blue50 : B.blue30 }}>Phase {p.id}</div><div style={{ fontSize: 13, fontWeight: 600, color: a ? B.blue10 : B.blue30 }}>{pNames[i]}</div></div>
            </button>;
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px" }}>
        <div key={activePhase} style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: B.blue50, marginBottom: 6 }}>Phase {cur.id} — {cur.subtitle}</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: B.blue10, margin: 0 }}>{cur.title}</h2>
              </div>
              <button onClick={() => setShowResources(true)} style={{ padding: "10px 18px", borderRadius: 10, background: B.blue50, color: B.white, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}><BookOpen size={16} />Templates & Resources</button>
            </div>
            {cur.iterates && <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FEF3C7", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#92400E", marginTop: 8 }}><AlertCircle size={14} />This phase repeats for every batch</div>}
            <p style={{ fontSize: 15, lineHeight: 1.8, color: B.blue30, maxWidth: 720, marginTop: 12 }}>{cur.purpose}</p>
          </div>

          {cur.sections ? cur.sections.map((s, si) => <PhaseSection key={si} section={s} sectionIndex={si} isManager={isManager} customDocs={customDocs} onManageDoc={setManagingDoc} />) : cur.steps ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{cur.steps.map((s, i) => <StepCard key={i} step={s} index={i} isManager={isManager} customDocs={customDocs} onManageDoc={setManagingDoc} />)}</div> : null}
          {cur.handoff && <HandoffCriteria items={cur.handoff} nextPhase={activePhase < 4 ? pNames[activePhase] : null} />}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${B.blue90}` }}>
            {activePhase > 1 ? <button onClick={() => setActivePhase(activePhase - 1)} style={{ padding: "10px 20px", borderRadius: 10, background: B.blue95, color: B.blue10, border: `1px solid ${B.blue90}`, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Phase {activePhase - 1}: {pNames[activePhase - 2]}</button> : <span />}
            {activePhase < 4 && <button onClick={() => setActivePhase(activePhase + 1)} style={{ padding: "10px 20px", borderRadius: 10, background: B.blue50, color: B.white, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Phase {activePhase + 1}: {pNames[activePhase]} →</button>}
          </div>
        </div>
      </main>

      {showResources && <>
        <div style={{ position: "fixed", inset: 0, background: "rgba(1,24,64,0.3)", zIndex: 999 }} onClick={() => setShowResources(false)} />
        <ResourcesPanel phaseId={activePhase} onClose={() => setShowResources(false)} isManager={isManager} customDocs={customDocs} onManageDoc={id => { setShowResources(false); setManagingDoc(id); }} />
      </>}
      {showComparison && <ModelComparisonModal model={customer.model} onClose={() => setShowComparison(false)} />}
      {managingDoc && <DocManagerModal templateId={managingDoc} customDocs={customDocs} customerName={customer.customer_name} onSave={handleSaveDoc} onRemove={handleRemoveDoc} onClose={() => setManagingDoc(null)} />}
    </div>
  );
}
