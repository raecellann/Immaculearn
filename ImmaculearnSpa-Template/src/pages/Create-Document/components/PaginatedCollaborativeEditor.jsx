// PaginatedCollaborativeEditor.jsx
// Microsoft Word-style paginated editor:
//   • All pages visible & editable simultaneously
//   • Auto overflow/underflow between pages
//   • Gray workspace background, white A4 pages with shadow
//   • Yjs collaborative sync

import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useTheme } from "../contexts/ThemeContext";

// ─── Page geometry (A4 at 96 dpi) ────────────────────────────────────────────
const PAGE_W = 794;   // px
const PAGE_H = 1123;  // px
const MARGIN = 96;    // px  (1 inch)
const PRINT_H = PAGE_H - MARGIN * 2; // 931 px usable height per page

const PAGE_SEP = "\n<!-- PAGE BREAK -->\n";

let _nextId = 1;
const newId = () => ++_nextId;

// ─── Component ────────────────────────────────────────────────────────────────
const PaginatedCollaborativeEditor = forwardRef(
  (
    {
      ydoc,
      provider,
      fontFamily,
      onUpdate,
      initialContent,
      margins,
    },
    ref
  ) => {
    const { isDarkMode } = useTheme();

    // pageIds drives how many <Page> elements React renders.
    // Content lives in the DOM (uncontrolled) – we only touch it via refs.
    const [pageIds, setPageIds] = useState(() => [newId()]);
    const [isSynced, setIsSynced] = useState(false);

    const pageRefs = useRef([]); // contentEditable divs
    const pageIdsRef = useRef(pageIds); // mirror for callbacks
    pageIdsRef.current = pageIds;

    const isRemoteRef = useRef(false);
    const reflowTimer = useRef(null);
    const pendingNewPageContent = useRef(null); // content to inject after new page renders

    // ── Margin values ──────────────────────────────────────────────────────────
    const mTop    = margins?.top    || "1in";
    const mRight  = margins?.right  || "1in";
    const mBottom = margins?.bottom || "1in";
    const mLeft   = margins?.left   || "1in";

    // ── Responsive scale ───────────────────────────────────────────────────────
    const workspaceRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
      const calc = () => {
        if (!workspaceRef.current) return;
        const avail = workspaceRef.current.offsetWidth - 48;
        setScale(avail < PAGE_W ? avail / PAGE_W : 1);
      };
      calc();
      window.addEventListener("resize", calc);
      return () => window.removeEventListener("resize", calc);
    }, []);

    // ── Read all page HTML from DOM ────────────────────────────────────────────
    const domToString = useCallback(
      () =>
        pageRefs.current
          .filter(Boolean)
          .map((el) => el.innerHTML)
          .join(PAGE_SEP),
      []
    );

    // ── Write content string into DOM (splits by PAGE_SEP) ────────────────────
    const stringToDOM = useCallback((content) => {
      const parts = content ? content.split(PAGE_SEP) : [""];

      // Rebuild pageIds to match the number of parts
      const newIds = parts.map(
        (_, i) => pageIdsRef.current[i] ?? newId()
      );
      pageIdsRef.current = newIds;
      setPageIds([...newIds]);

      // Inject content after render
      const htmlParts = parts;
      setTimeout(() => {
        htmlParts.forEach((html, i) => {
          if (pageRefs.current[i]) pageRefs.current[i].innerHTML = html;
        });
      }, 0);
    }, []);

    // ── Sync changed DOM to Yjs ────────────────────────────────────────────────
    const syncToYjs = useCallback(() => {
      if (!ydoc || isRemoteRef.current) return;
      const ytext = ydoc.getText("document");
      const next = domToString();
      const prev = ytext.toString();
      if (next === prev) return;

      // Minimal diff
      let s = 0;
      while (s < Math.min(prev.length, next.length) && prev[s] === next[s]) s++;
      let e = 0;
      while (
        e < Math.min(prev.length - s, next.length - s) &&
        prev[prev.length - 1 - e] === next[next.length - 1 - e]
      )
        e++;

      ydoc.transact(() => {
        if (prev.length - s - e > 0) ytext.delete(s, prev.length - s - e);
        const ins = next.substring(s, next.length - e || undefined);
        if (ins) ytext.insert(s, ins);
      }, "local");

      onUpdate?.(next);
    }, [ydoc, domToString, onUpdate]);

    // ── Overflow / underflow reflow ────────────────────────────────────────────
    const reflow = useCallback(
      (startIndex = 0) => {
        const refs = pageRefs.current;
        const ids  = pageIdsRef.current;

        // ── Pass 1: push overflow blocks forward ─────────────────────────────
        for (let i = startIndex; i < refs.length; i++) {
          const el = refs[i];
          if (!el) continue;

          while (el.scrollHeight > el.clientHeight + 4) {
            const last = el.lastElementChild;
            if (!last) break;
            el.removeChild(last);

            const nextEl = refs[i + 1];
            if (nextEl) {
              nextEl.insertBefore(last, nextEl.firstChild);
            } else {
              // Need a brand-new page
              const overflow = last.outerHTML;
              pendingNewPageContent.current = overflow;
              const freshId = newId();
              pageIdsRef.current = [...ids, freshId];
              setPageIds([...pageIdsRef.current]);
              return; // will re-run after render via useEffect
            }
          }
        }

        // ── Pass 2: pull underflow blocks backward ────────────────────────────
        for (let i = startIndex; i < refs.length - 1; i++) {
          const el     = refs[i];
          const nextEl = refs[i + 1];
          if (!el || !nextEl) continue;

          while (nextEl.firstElementChild) {
            const first = nextEl.firstElementChild;
            el.appendChild(first);
            if (el.scrollHeight > el.clientHeight + 4) {
              // Doesn't fit – put back
              el.removeChild(first);
              nextEl.insertBefore(first, nextEl.firstChild);
              break;
            }
          }

          // Remove empty trailing pages (keep at least 1)
          if (
            !nextEl.firstElementChild &&
            !nextEl.textContent.trim() &&
            refs.length > 1
          ) {
            pageIdsRef.current = pageIdsRef.current.filter(
              (_, idx) => idx !== i + 1
            );
            setPageIds([...pageIdsRef.current]);
            break;
          }
        }

        syncToYjs();
      },
      [syncToYjs]
    );

    // After a new page is added, inject pending content
    useEffect(() => {
      if (pendingNewPageContent.current !== null) {
        const lastIdx = pageRefs.current.length - 1;
        const lastEl  = pageRefs.current[lastIdx];
        if (lastEl) {
          lastEl.innerHTML = pendingNewPageContent.current;
          pendingNewPageContent.current = null;
          // Check if the new page also overflows
          reflow(lastIdx);
        }
      }
    });

    // ── Input handler ──────────────────────────────────────────────────────────
    const handleInput = useCallback(
      (pageIndex) => {
        if (isRemoteRef.current) return;
        if (reflowTimer.current) clearTimeout(reflowTimer.current);
        reflowTimer.current = setTimeout(() => reflow(pageIndex), 200);
      },
      [reflow]
    );

    // ── Paste ──────────────────────────────────────────────────────────────────
    const handlePaste = useCallback((e, pageIndex) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      const sel  = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      handleInput(pageIndex);
    }, [handleInput]);

    // ── Key shortcuts ──────────────────────────────────────────────────────────
    const handleKeyDown = useCallback((e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") { e.preventDefault(); document.execCommand("bold"); }
        if (e.key === "i") { e.preventDefault(); document.execCommand("italic"); }
        if (e.key === "u") { e.preventDefault(); document.execCommand("underline"); }
      }
    }, []);

    // ── Yjs init ───────────────────────────────────────────────────────────────
    useEffect(() => {
      if (!ydoc || !provider) return;

      const ytext = ydoc.getText("document");

      const onRemote = (_evt, tx) => {
        if (tx.local) return;
        isRemoteRef.current = true;
        stringToDOM(ytext.toString());
        setTimeout(() => { isRemoteRef.current = false; }, 150);
      };

      const onSync = (synced) => {
        setIsSynced(synced);
        if (!synced) return;
        const existing = ytext.toString();
        if (existing) {
          isRemoteRef.current = true;
          stringToDOM(existing);
          setTimeout(() => { isRemoteRef.current = false; }, 150);
        } else if (initialContent) {
          ydoc.transact(() => ytext.insert(0, initialContent), "init");
          stringToDOM(initialContent);
        }
      };

      ytext.observe(onRemote);
      provider.on("sync", onSync);
      if (provider.synced) onSync(true);

      return () => {
        ytext.unobserve(onRemote);
        provider.off("sync", onSync);
      };
    }, [ydoc, provider, initialContent, stringToDOM]);

    // Seed content when there's no Yjs
    useEffect(() => {
      if (!ydoc && initialContent) stringToDOM(initialContent);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Imperative API ─────────────────────────────────────────────────────────
    useImperativeHandle(
      ref,
      () => ({
        getHTML:   () => domToString(),
        getText:   () => pageRefs.current.filter(Boolean).map((el) => el.innerText).join("\n\n"),
        isEmpty:   () => pageRefs.current.filter(Boolean).every((el) => !el.innerHTML.trim()),
        focus:     () => pageRefs.current[0]?.focus(),
        setContent: stringToDOM,
        clearContent: () => stringToDOM(""),
        getTotalPages: () => pageIdsRef.current.length,
        commands: {
          setContent: stringToDOM,
          focus: () => pageRefs.current[0]?.focus(),
        },
      }),
      [domToString, stringToDOM]
    );

    // ── Styles ────────────────────────────────────────────────────────────────
    const workspaceBg = isDarkMode ? "#3a3a3a" : "#e0e0e0";
    const pageFont    = fontFamily || 'Calibri, "Segoe UI", Arial, sans-serif';

    return (
      <div
        ref={workspaceRef}
        style={{
          backgroundColor: workspaceBg,
          width: "100%",
          minHeight: "100%",
          padding: "32px 16px 48px",
          boxSizing: "border-box",
          overflowX: "auto",
        }}
      >
        {/* ── Page stack ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: `${Math.round(24 * scale)}px`,
          }}
        >
          {pageIds.map((pageId, pageIndex) => (
            <div
              key={pageId}
              style={{
                width:    `${PAGE_W * scale}px`,
                height:   `${PAGE_H * scale}px`,
                position: "relative",
                flexShrink: 0,
              }}
            >
              {/* White paper */}
              <div
                style={{
                  width:           `${PAGE_W}px`,
                  height:          `${PAGE_H}px`,
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                  position:        "absolute",
                  top:             0,
                  left:            0,
                  transformOrigin: "top left",
                  transform:       `scale(${scale})`,
                  overflow:        "hidden",
                }}
              >
                {/* ── Editable text layer ─────────────────────────────── */}
                <div
                  ref={(el) => {
                    pageRefs.current[pageIndex] = el;
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => handleInput(pageIndex)}
                  onPaste={(e) => handlePaste(e, pageIndex)}
                  onKeyDown={handleKeyDown}
                  data-placeholder={pageIndex === 0 ? "Start typing…" : ""}
                  style={{
                    position:     "absolute",
                    top:          0,
                    left:         0,
                    width:        "100%",
                    height:       `${PRINT_H + MARGIN * 2}px`,
                    padding:      `${mTop} ${mRight} ${mBottom} ${mLeft}`,
                    fontFamily:   pageFont,
                    fontSize:     "11pt",
                    lineHeight:   "1.6",
                    color:        "#000000",
                    outline:      "none",
                    overflow:     "hidden",
                    boxSizing:    "border-box",
                    cursor:       "text",
                    wordBreak:    "break-word",
                    overflowWrap: "break-word",
                  }}
                />

                {/* ── Margin guides (subtle dotted lines) ────────────── */}
                <div
                  style={{
                    position:      "absolute",
                    top:           MARGIN,
                    left:          MARGIN,
                    right:         MARGIN,
                    bottom:        MARGIN,
                    border:        "1px dashed rgba(0,0,0,0.07)",
                    pointerEvents: "none",
                  }}
                />

                {/* ── Page number ──────────────────────────────────────── */}
                <div
                  style={{
                    position:      "absolute",
                    bottom:        "0.35in",
                    left:          0,
                    right:         0,
                    textAlign:     "center",
                    fontSize:      "8pt",
                    color:         "#aaaaaa",
                    pointerEvents: "none",
                    userSelect:    "none",
                    fontFamily:    pageFont,
                  }}
                >
                  {pageIndex + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom toolbar ──────────────────────────────────────────────── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            marginTop:      "24px",
            maxWidth:       `${PAGE_W * scale}px`,
            marginLeft:     "auto",
            marginRight:    "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => {
                pageIdsRef.current = [...pageIdsRef.current, newId()];
                setPageIds([...pageIdsRef.current]);
              }}
              style={btnStyle}
            >
              + Add Page
            </button>

            {pageIds.length > 1 && (
              <button
                onClick={() => {
                  pageIdsRef.current = pageIdsRef.current.slice(0, -1);
                  pageRefs.current   = pageRefs.current.slice(0, -1);
                  setPageIds([...pageIdsRef.current]);
                }}
                style={btnStyle}
              >
                − Remove Last
              </button>
            )}

            <span style={{ fontSize: "12px", color: "#888" }}>
              {pageIds.length} page{pageIds.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Sync indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width:           "8px",
                height:          "8px",
                borderRadius:    "50%",
                display:         "inline-block",
                backgroundColor: isSynced ? "#22c55e" : "#f59e0b",
                flexShrink:      0,
              }}
            />
            <span style={{ fontSize: "12px", color: "#888" }}>
              {isSynced ? "Connected" : "Connecting…"}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

// Tiny shared button style
const btnStyle = {
  padding:         "4px 14px",
  fontSize:        "12px",
  backgroundColor: "#ffffff",
  border:          "1px solid #cccccc",
  borderRadius:    "3px",
  cursor:          "pointer",
  color:           "#333333",
  boxShadow:       "0 1px 2px rgba(0,0,0,0.08)",
};

PaginatedCollaborativeEditor.displayName = "PaginatedCollaborativeEditor";

export default PaginatedCollaborativeEditor;
