// components-old/TiptapToolbar.jsx
import React, { useRef, useEffect, useCallback } from "react";
import {
  FiBold, FiItalic, FiUnderline,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiChevronDown, FiList, FiFilePlus, FiTrash2,
} from "react-icons/fi";

// ── Fixed-position dropdown portal ───────────────────────────────────────────
// Renders relative to the trigger using position:fixed so it is never clipped
// by any overflow/sticky ancestor.
const Dropdown = ({ triggerRef, open, onClose, children }) => {
  const dropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, triggerRef]);

  if (!open || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();

  return (
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 9999,
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        minWidth: 140,
      }}
    >
      {children}
    </div>
  );
};

// ── Dropdown item — uses onMouseDown+preventDefault to keep editor selection ─
const Item = ({ onAction, active, children }) => (
  <div
    onMouseDown={(e) => { e.preventDefault(); onAction(); }}
    style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", cursor: "pointer", fontSize: 13,
      background: active ? "#eff6ff" : "transparent",
      color: active ? "#2563eb" : "#333",
      whiteSpace: "nowrap",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f5f5f5"; }}
    onMouseLeave={e => { e.currentTarget.style.background = active ? "#eff6ff" : "transparent"; }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const TiptapToolbar = ({
  editor,
  selectedAlignment,
  selectedTextColor,
  selectedFontSize,
  applyAlignment,
  applyTextColor,
  applyFontSize,
  applyBold,
  applyItalic,
  applyUnderline,
  applyList,
  onAddPage,
  onDeletePage,
  isAlignmentDropdownOpen,
  isColorDropdownOpen,
  isFontSizeDropdownOpen,
  isListDropdownOpen,
  setIsAlignmentDropdownOpen,
  setIsColorDropdownOpen,
  setIsFontSizeDropdownOpen,
  setIsListDropdownOpen,
}) => {
  const fontSizeRef = useRef(null);
  const alignRef    = useRef(null);
  const colorRef    = useRef(null);
  const listRef     = useRef(null);

  const closeAll = useCallback(() => {
    setIsAlignmentDropdownOpen(false);
    setIsColorDropdownOpen(false);
    setIsFontSizeDropdownOpen(false);
    setIsListDropdownOpen(false);
  }, [
    setIsAlignmentDropdownOpen, setIsColorDropdownOpen,
    setIsFontSizeDropdownOpen, setIsListDropdownOpen,
  ]);

  const toggle = (setter, current) => {
    closeAll();
    if (!current) setter(true);
  };

  // Prevent toolbar clicks from stealing focus / losing editor selection
  const keepFocus = (e) => e.preventDefault();

  if (!editor) {
    return (
      <div style={{ backgroundColor: "#f3f3f3", borderBottom: "1px solid #ddd", padding: "8px 16px", fontSize: 13, color: "#999" }}>
        Loading editor…
      </div>
    );
  }

  const isActive = (fmt) => {
    try { return typeof editor.isActive === "function" ? editor.isActive(fmt) : false; }
    catch { return false; }
  };

  const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", border: "none", borderRadius: 5, padding: "6px 8px",
    transition: "background 0.12s", background: "transparent", color: "#222",
  };

  const biuBtn = (active) => ({
    ...btnBase,
    background: active ? "#dbeafe" : "transparent",
    color: active ? "#2563eb" : "#222",
  });

  const Divider = () => (
    <div style={{ width: 1, height: 20, background: "#d1d5db", margin: "0 3px", flexShrink: 0 }} />
  );

  return (
    <div style={{
      backgroundColor: "#f3f3f3", borderBottom: "1px solid #d1d5db",
      width: "100%", position: "relative",
      overflowX: "auto", overflowY: "visible",
    }}>
      <div style={{
        display: "flex", flexWrap: "nowrap", alignItems: "center",
        justifyContent: "center", gap: 2, padding: "5px 12px",
        minWidth: "max-content",
      }}>

        {/* ── B / I / U ── */}
        <button
          style={biuBtn(isActive("bold"))}
          onMouseDown={(e) => { keepFocus(e); applyBold(); }}
          title="Bold"
        >
          <FiBold size={17} />
        </button>
        <button
          style={biuBtn(isActive("italic"))}
          onMouseDown={(e) => { keepFocus(e); applyItalic(); }}
          title="Italic"
        >
          <FiItalic size={17} />
        </button>
        <button
          style={biuBtn(isActive("underline"))}
          onMouseDown={(e) => { keepFocus(e); applyUnderline(); }}
          title="Underline"
        >
          <FiUnderline size={17} />
        </button>

        <Divider />

        {/* ── Font Size ── */}
        <button
          ref={fontSizeRef}
          style={{ ...btnBase, gap: 3, minWidth: 50 }}
          onMouseDown={(e) => { keepFocus(e); toggle(setIsFontSizeDropdownOpen, isFontSizeDropdownOpen); }}
          title="Font Size"
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedFontSize}</span>
          <FiChevronDown size={11} />
        </button>
        <Dropdown triggerRef={fontSizeRef} open={isFontSizeDropdownOpen} onClose={() => setIsFontSizeDropdownOpen(false)}>
          <div style={{ maxHeight: 220, overflowY: "auto", borderRadius: 8 }}>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(s => (
              <Item key={s} active={selectedFontSize === s} onAction={() => { applyFontSize(s); setIsFontSizeDropdownOpen(false); }}>
                <span style={{ minWidth: 28 }}>{s}</span>
              </Item>
            ))}
          </div>
        </Dropdown>

        <Divider />

        {/* ── Alignment ── */}
        <button
          ref={alignRef}
          style={{ ...btnBase, gap: 3 }}
          onMouseDown={(e) => { keepFocus(e); toggle(setIsAlignmentDropdownOpen, isAlignmentDropdownOpen); }}
          title="Alignment"
        >
          {selectedAlignment === "center"  ? <FiAlignCenter  size={15} /> :
           selectedAlignment === "right"   ? <FiAlignRight   size={15} /> :
           selectedAlignment === "justify" ? <FiAlignJustify size={15} /> :
           <FiAlignLeft size={15} />}
          <FiChevronDown size={11} />
        </button>
        <Dropdown triggerRef={alignRef} open={isAlignmentDropdownOpen} onClose={() => setIsAlignmentDropdownOpen(false)}>
          {[
            ["left",    <FiAlignLeft    size={14} />, "Left"],
            ["center",  <FiAlignCenter  size={14} />, "Center"],
            ["right",   <FiAlignRight   size={14} />, "Right"],
            ["justify", <FiAlignJustify size={14} />, "Justify"],
          ].map(([a, icon, label]) => (
            <Item key={a} active={selectedAlignment === a} onAction={() => { applyAlignment(a); setIsAlignmentDropdownOpen(false); }}>
              {icon}{label}
            </Item>
          ))}
        </Dropdown>

        <Divider />

        {/* ── Text Color ── */}
        <button
          ref={colorRef}
          style={{ ...btnBase, gap: 3 }}
          onMouseDown={(e) => { keepFocus(e); toggle(setIsColorDropdownOpen, isColorDropdownOpen); }}
          title="Text Color"
        >
          <span style={{
            display: "inline-block", width: 17, height: 17, borderRadius: 3,
            border: "1.5px solid #aaa", backgroundColor: selectedTextColor || "#000",
          }} />
          <FiChevronDown size={11} />
        </button>
        <Dropdown triggerRef={colorRef} open={isColorDropdownOpen} onClose={() => setIsColorDropdownOpen(false)}>
          <div style={{ padding: 12, minWidth: 192 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Text Color
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
              {[
                ["Black",  "#000000"], ["White",  "#ffffff"], ["Red",    "#ef4444"],
                ["Orange", "#f97316"], ["Yellow", "#eab308"], ["Green",  "#22c55e"],
                ["Teal",   "#14b8a6"], ["Blue",   "#3b82f6"], ["Indigo", "#6366f1"],
                ["Purple", "#a855f7"], ["Pink",   "#ec4899"], ["Gray",   "#6b7280"],
              ].map(([label, val]) => (
                <button
                  key={val}
                  title={label}
                  style={{
                    width: 26, height: 26, borderRadius: 4, cursor: "pointer",
                    backgroundColor: val,
                    border: selectedTextColor === val ? "2.5px solid #2563eb" : "1.5px solid #ccc",
                    outline: "none",
                  }}
                  onMouseDown={(e) => { keepFocus(e); applyTextColor(val); setIsColorDropdownOpen(false); }}
                />
              ))}
            </div>
          </div>
        </Dropdown>

        <Divider />

        {/* ── List ── */}
        <button
          ref={listRef}
          style={{ ...btnBase, gap: 3 }}
          onMouseDown={(e) => { keepFocus(e); toggle(setIsListDropdownOpen, isListDropdownOpen); }}
          title="Lists"
        >
          <FiList size={15} />
          <FiChevronDown size={11} />
        </button>
        <Dropdown triggerRef={listRef} open={isListDropdownOpen} onClose={() => setIsListDropdownOpen(false)}>
          <Item onAction={() => { applyList("bullet"); setIsListDropdownOpen(false); }}>• Bullet List</Item>
          <Item onAction={() => { applyList("number"); setIsListDropdownOpen(false); }}>1. Numbered List</Item>
          <Item onAction={() => { applyList("none");   setIsListDropdownOpen(false); }}>✕ Remove List</Item>
        </Dropdown>

        <Divider />

        {/* ── Add / Delete Page ── */}
        <button
          style={{ ...btnBase, gap: 4, color: "#16a34a" }}
          onMouseDown={keepFocus}
          onClick={onAddPage}
          title="Add page"
        >
          <FiFilePlus size={15} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>Add page</span>
        </button>
        <button
          style={{ ...btnBase, gap: 4, color: "#dc2626" }}
          onMouseDown={keepFocus}
          onClick={onDeletePage}
          title="Delete page"
        >
          <FiTrash2 size={15} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>Delete page</span>
        </button>

      </div>
    </div>
  );
};

export default TiptapToolbar;
