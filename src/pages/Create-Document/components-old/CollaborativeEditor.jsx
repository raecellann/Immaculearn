// components-old/CollaborativeEditor.jsx
// Microsoft Word-style paginated editor:
//   • Long Bond paper (8.5×13in / 816×1248px at 96dpi)
//   • All pages visible & editable simultaneously
//   • Auto overflow/underflow between pages (max 50)
//   • Gray workspace background, white pages with shadow
//   • Yjs collaborative sync

import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useTheme } from "../contexts-old/ThemeContext";

// ─── Long Bond paper geometry (8.5×13in at 96dpi) ───────────────────────────
const PAGE_W    = 816;              // px
const PAGE_H    = 1248;             // px
const MARGIN    = 96;               // px  (1 inch)
const CONTENT_H = PAGE_H - MARGIN * 2; // 1056 px usable
const MAX_PAGES = 50;

const PAGE_SEP = "\n<!-- PAGE BREAK -->\n";

// Use timestamp + random suffix so IDs stay unique across HMR module reloads
// (a plain counter resets to 1 on reload while React preserves old state).
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ─── Component ───────────────────────────────────────────────────────────────
const CollaborativeEditor = forwardRef(
  (
    {
      ydoc,
      provider,
      fontFamily,
      margins,
      onUpdate,
      initialContent,
      onEditorReady,
    },
    ref,
  ) => {
    const { isDarkMode } = useTheme();

    // pageIds drives how many <Page> elements React renders.
    // Content lives in the DOM (uncontrolled) – only touched via refs.
    const [pageIds, setPageIds] = useState(() => [newId()]);
    const [isSynced, setIsSynced] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);

    const pageRefs    = useRef([]);       // contentEditable divs
    const pageIdsRef  = useRef(pageIds);  // mirror for callbacks
    pageIdsRef.current = pageIds;

    const isRemoteRef           = useRef(false);
    const reflowTimer           = useRef(null);
    const pendingNewPageContent = useRef(null);

    // ── Margin values ────────────────────────────────────────────────────────
    const mTop    = margins?.top    || "1in";
    const mRight  = margins?.right  || "1in";
    const mBottom = margins?.bottom || "1in";
    const mLeft   = margins?.left   || "1in";

    // ── Responsive scale (fit page in workspace) ─────────────────────────────
    const workspaceRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
      const calc = () => {
        if (!workspaceRef.current) return;
        const avail = workspaceRef.current.offsetWidth - 32;
        setScale(avail < PAGE_W ? avail / PAGE_W : 1);
      };
      calc();
      window.addEventListener("resize", calc);
      return () => window.removeEventListener("resize", calc);
    }, []);

    // ── Read all pages from DOM ───────────────────────────────────────────────
    const domToString = useCallback(
      () =>
        pageRefs.current
          .filter(Boolean)
          .map((el) => el.innerHTML)
          .join(PAGE_SEP),
      [],
    );

    // ── Write content string into DOM ────────────────────────────────────────
    const stringToDOM = useCallback((content) => {
      const parts  = content ? content.split(PAGE_SEP) : [""];
      const newIds = parts.map((_, i) => pageIdsRef.current[i] ?? newId());
      pageIdsRef.current = newIds;
      setPageIds([...newIds]);

      // Inject HTML after React renders the new page elements
      const htmlParts = parts;
      setTimeout(() => {
        htmlParts.forEach((html, i) => {
          if (pageRefs.current[i]) pageRefs.current[i].innerHTML = html;
        });
      }, 0);
    }, []);

    // ── Sync DOM → Yjs ───────────────────────────────────────────────────────
    const syncToYjs = useCallback(() => {
      if (!ydoc || isRemoteRef.current) return;
      const ytext = ydoc.getText("document");
      const next  = domToString();
      const prev  = ytext.toString();
      if (next === prev) return;

      // Minimal diff
      let s = 0;
      while (s < Math.min(prev.length, next.length) && prev[s] === next[s]) s++;
      let e = 0;
      while (
        e < Math.min(prev.length - s, next.length - s) &&
        prev[prev.length - 1 - e] === next[next.length - 1 - e]
      ) e++;

      ydoc.transact(() => {
        if (prev.length - s - e > 0) ytext.delete(s, prev.length - s - e);
        const ins = next.substring(s, next.length - e || undefined);
        if (ins) ytext.insert(s, ins);
      }, "local");

      onUpdate?.(next);
    }, [ydoc, domToString, onUpdate]);

    // ── Overflow / underflow reflow ──────────────────────────────────────────
    const reflow = useCallback(
      (startIndex = 0) => {
        const refs = pageRefs.current;
        const ids  = pageIdsRef.current;

        // ── Save cursor before any DOM moves ─────────────────────────────
        const sel = window.getSelection();
        let savedRange = null;
        if (sel && sel.rangeCount > 0) {
          try { savedRange = sel.getRangeAt(0).cloneRange(); } catch {}
        }

        const restoreCursor = () => {
          if (!savedRange) return;
          try {
            // Only restore if the saved nodes are still in the document
            if (!document.contains(savedRange.startContainer)) return;
            const s = window.getSelection();
            s.removeAllRanges();
            s.addRange(savedRange);
          } catch {}
        };

        // Pass 1: push overflow blocks forward
        for (let i = startIndex; i < refs.length; i++) {
          const el = refs[i];
          if (!el) continue;

          while (el.scrollHeight > el.clientHeight + 4) {
            const last = el.lastElementChild;

            if (!last) {
              // ── Bare text nodes (no element children) ───────────────────
              // Binary-search for how many characters fit on this page, then
              // move the rest to the next page.
              const fullText = el.innerText;
              if (!fullText.trim()) break;

              let lo = 0, hi = fullText.length;
              while (lo < hi) {
                const mid = Math.ceil((lo + hi) / 2);
                el.innerText = fullText.slice(0, mid);
                if (el.scrollHeight <= el.clientHeight + 4) lo = mid;
                else hi = mid - 1;
              }

              // Nothing fits or everything fits — nothing to do
              if (lo === 0 || lo >= fullText.length) {
                el.innerText = fullText;
                break;
              }

              const overflowText = fullText.slice(lo).replace(/^\s+/, "");
              el.innerText = fullText.slice(0, lo);

              if (!overflowText) break;

              const nextEl = refs[i + 1];
              if (nextEl) {
                const existing = nextEl.innerHTML.trim();
                nextEl.innerHTML = existing
                  ? overflowText + "<br>" + existing
                  : overflowText;
              } else if (ids.length < MAX_PAGES) {
                pendingNewPageContent.current = `<div>${overflowText}</div>`;
                const freshId = newId();
                pageIdsRef.current = [...ids, freshId];
                setPageIds([...pageIdsRef.current]);
                return;
              }
              break; // re-evaluate on next reflow cycle
            }

            el.removeChild(last);

            const nextEl = refs[i + 1];
            if (nextEl) {
              nextEl.insertBefore(last, nextEl.firstChild);
            } else if (ids.length < MAX_PAGES) {
              // Need a brand-new page
              pendingNewPageContent.current = last.outerHTML;
              const freshId = newId();
              pageIdsRef.current = [...ids, freshId];
              setPageIds([...pageIdsRef.current]);
              return; // re-runs after render via useEffect below
            } else {
              // Max pages reached — put it back
              el.appendChild(last);
              break;
            }
          }
        }

        // Pass 2: pull underflow blocks backward
        for (let i = startIndex; i < refs.length - 1; i++) {
          const el     = refs[i];
          const nextEl = refs[i + 1];
          if (!el || !nextEl) continue;

          while (nextEl.firstElementChild) {
            const first = nextEl.firstElementChild;
            el.appendChild(first);
            if (el.scrollHeight > el.clientHeight + 4) {
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
              (_, idx) => idx !== i + 1,
            );
            setPageIds([...pageIdsRef.current]);
            break;
          }
        }

        syncToYjs();
        restoreCursor();
      },
      [syncToYjs],
    );

    // After a new page is added, inject pending content
    useEffect(() => {
      if (pendingNewPageContent.current !== null) {
        const lastIdx = pageRefs.current.length - 1;
        const lastEl  = pageRefs.current[lastIdx];
        if (lastEl) {
          lastEl.innerHTML = pendingNewPageContent.current;
          pendingNewPageContent.current = null;
          reflow(lastIdx);
        }
      }
    });

    // ── Input handler ────────────────────────────────────────────────────────
    const handleInput = useCallback(
      (pageIndex) => {
        if (isRemoteRef.current) return;
        if (reflowTimer.current) clearTimeout(reflowTimer.current);
        reflowTimer.current = setTimeout(() => reflow(pageIndex), 200);
      },
      [reflow],
    );

    // ── Paste ────────────────────────────────────────────────────────────────
    const handlePaste = useCallback(
      (e, pageIndex) => {
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
      },
      [handleInput],
    );

    // ── Keyboard shortcuts ───────────────────────────────────────────────────
    const handleKeyDown = useCallback((e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") { e.preventDefault(); document.execCommand("bold"); }
        if (e.key === "i") { e.preventDefault(); document.execCommand("italic"); }
        if (e.key === "u") { e.preventDefault(); document.execCommand("underline"); }
        return;
      }

      // When the cursor is inside a font-size anchor span (zero-width space),
      // intercept the first real keystroke: replace \u200B with the actual
      // character so typed text stays inside the sized span.
      // ── Cross-page cursor navigation ──────────────────────────────────────
      const crossPage = (() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        const range = sel.getRangeAt(0);
        if (!range.collapsed) return false;

        const pageEl    = e.target;
        const pageIndex = pageRefs.current.indexOf(pageEl);
        if (pageIndex < 0) return false;

        const atBoundary = (toEnd) => {
          const testRange = document.createRange();
          testRange.selectNodeContents(pageEl);
          testRange.collapse(!toEnd); // collapse(true)=start, collapse(false)=end
          return range.compareBoundaryPoints(
            toEnd ? Range.END_TO_END : Range.START_TO_START,
            testRange
          ) === 0;
        };

        const moveTo = (targetIndex, toEnd) => {
          const target = pageRefs.current[targetIndex];
          if (!target) return false;
          target.focus();
          const newRange = document.createRange();
          newRange.selectNodeContents(target);
          newRange.collapse(!toEnd);
          sel.removeAllRanges();
          sel.addRange(newRange);
          setActivePageIndex(targetIndex);
          return true;
        };

        // ArrowRight / ArrowDown at end of page → start of next page
        if ((e.key === "ArrowRight" || e.key === "ArrowDown") &&
            pageIndex < pageRefs.current.length - 1 && atBoundary(true)) {
          e.preventDefault();
          return moveTo(pageIndex + 1, false);
        }

        // ArrowLeft / ArrowUp / Backspace at start of page → end of previous page
        if ((e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "Backspace") &&
            pageIndex > 0 && atBoundary(false)) {
          e.preventDefault();
          return moveTo(pageIndex - 1, true);
        }

        return false;
      })();
      if (crossPage) return;

      if (e.key.length === 1 && !e.altKey) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const node  = range.startContainer;
          if (
            node.nodeType === Node.TEXT_NODE &&
            node.textContent === "\u200B" &&
            range.startOffset === 1
          ) {
            e.preventDefault();
            // Replace the zero-width space with the typed character in-place,
            // keeping the cursor inside the span so subsequent chars land here.
            node.textContent = e.key;
            range.setStart(node, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            // Trigger reflow / Yjs sync via the page's input handler.
            const page = node.parentElement?.closest("[contenteditable='true']");
            if (page) page.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      }
    }, []);

    // ── Yjs init ─────────────────────────────────────────────────────────────
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

    // Seed without Yjs
    useEffect(() => {
      if (!ydoc && initialContent) stringToDOM(initialContent);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Imperative API ───────────────────────────────────────────────────────
    useImperativeHandle(
      ref,
      () => ({
        getHTML:      () => domToString(),
        getText:      () => pageRefs.current.filter(Boolean).map((el) => el.innerText).join("\n\n"),
        isEmpty:      () => pageRefs.current.filter(Boolean).every((el) => !el.innerHTML.trim()),
        focus:        () => pageRefs.current[0]?.focus(),
        setContent:   stringToDOM,
        clearContent: () => stringToDOM(""),
        getTotalPages: () => pageIdsRef.current.length,
        setFontFamily: (font) => {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);

          if (!range.collapsed) {
            // Wrap selected text in a span with the chosen font
            const span = document.createElement("span");
            span.style.fontFamily = font;
            span.appendChild(range.cloneContents());
            range.deleteContents();
            range.insertNode(span);
            range.setStartAfter(span);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            for (let i = 0; i < pageRefs.current.length; i++) {
              if (pageRefs.current[i]?.contains(span)) {
                pageRefs.current[i].dispatchEvent(new Event("input", { bubbles: true }));
                break;
              }
            }
          } else {
            // No selection — use execCommand which tracks pending font for next typed chars
            const active = document.activeElement;
            if (!active?.isContentEditable) {
              for (const page of pageRefs.current) {
                if (page) { page.focus(); break; }
              }
            }
            document.execCommand("fontName", false, font);
          }
        },
        setFontSize: (size) => {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);
          const span  = document.createElement("span");
          span.style.fontSize = `${size}px`;

          if (!range.collapsed) {
            // Wrap the selected text
            span.appendChild(range.cloneContents());
            range.deleteContents();
            range.insertNode(span);
            range.setStartAfter(span);
            range.collapse(true);
          } else {
            // No selection — anchor span so next typed chars inherit the size
            span.appendChild(document.createTextNode("\u200B"));
            range.insertNode(span);
            range.setStart(span.firstChild, 1);
            range.collapse(true);
          }

          sel.removeAllRanges();
          sel.addRange(range);

          for (let i = 0; i < pageRefs.current.length; i++) {
            if (pageRefs.current[i]?.contains(span)) {
              pageRefs.current[i].dispatchEvent(new Event("input", { bubbles: true }));
              break;
            }
          }
        },
        addPage: () => {
          if (pageIdsRef.current.length >= MAX_PAGES) return;
          const freshId = newId();
          pageIdsRef.current = [...pageIdsRef.current, freshId];
          setPageIds([...pageIdsRef.current]);
          setTimeout(() => syncToYjs(), 50);
        },
        deletePage: () => {
          if (pageIdsRef.current.length <= 1) return;
          pageRefs.current = pageRefs.current.slice(0, -1);
          pageIdsRef.current = pageIdsRef.current.slice(0, -1);
          setPageIds([...pageIdsRef.current]);
          setTimeout(() => syncToYjs(), 50);
        },
        commands: {
          setContent: stringToDOM,
          focus: () => pageRefs.current[0]?.focus(),
        },
      }),
      [domToString, stringToDOM, syncToYjs],
    );

    // ── Notify parent with execCommand-based mock editor (Tiptap-compatible API) ──
    useEffect(() => {
      if (!onEditorReady) return;

      const focusActive = () => {
        const active = document.activeElement;
        if (active?.isContentEditable) return; // already in editor, selection preserved
        // Re-focus the page that owns the current selection
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const container = sel.getRangeAt(0).commonAncestorContainer;
          for (const page of pageRefs.current) {
            if (page && page.contains(container)) { page.focus(); return; }
          }
        }
        pageRefs.current[0]?.focus();
      };

      const exec = (cmd, value = null) => {
        focusActive();
        document.execCommand(cmd, false, value);
      };

      // Chainable builder — mirrors tiptap's editor.chain().focus().toggleBold().run()
      const makeChain = () => {
        const chain = {
          focus:            () => { focusActive(); return chain; },
          toggleBold:       () => { exec("bold");            return chain; },
          toggleItalic:     () => { exec("italic");          return chain; },
          toggleUnderline:  () => { exec("underline");       return chain; },
          setTextAlign:     (a) => {
            const cmds = { left:"justifyLeft", center:"justifyCenter", right:"justifyRight", justify:"justifyFull" };
            exec(cmds[a] || "justifyLeft");
            return chain;
          },
          setColor:         (c) => { exec("foreColor", c);  return chain; },
          setHighlight:     ()  => chain,
          setFontFamily:    (f) => { exec("fontName", f);   return chain; },
          setMark: (markType, attrs) => {
            if (markType === "textStyle" && attrs?.fontSize) {
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const span = document.createElement("span");
                span.style.fontSize = attrs.fontSize;

                if (!range.collapsed) {
                  // Wrap the selected text in the sized span
                  span.appendChild(range.cloneContents());
                  range.deleteContents();
                  range.insertNode(span);
                  range.setStartAfter(span);
                  range.collapse(true);
                } else {
                  // No selection — insert an anchoring span so typed text
                  // inherits the chosen size. Zero-width space keeps the
                  // inline span alive; cursor lands after it.
                  span.appendChild(document.createTextNode("\u200B"));
                  range.insertNode(span);
                  range.setStart(span.firstChild, 1);
                  range.collapse(true);
                }

                sel.removeAllRanges();
                sel.addRange(range);

                // Trigger reflow + Yjs sync by firing an input event on the
                // containing page div (avoids stale-closure issues with syncToYjs).
                for (const page of pageRefs.current) {
                  if (page?.contains(span)) {
                    page.dispatchEvent(new Event("input", { bubbles: true }));
                    break;
                  }
                }
              }
            }
            return chain;
          },
          toggleBulletList: () => { exec("insertUnorderedList"); return chain; },
          toggleOrderedList:() => { exec("insertOrderedList");   return chain; },
          liftListItem:     () => { exec("outdent");         return chain; },
          run: () => {},
        };
        return chain;
      };

      const mockEditor = {
        chain:    makeChain,
        isActive: (fmt) => {
          try { return document.queryCommandState(fmt); } catch { return false; }
        },
      };

      onEditorReady(mockEditor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Styles ───────────────────────────────────────────────────────────────
    const workspaceBg = isDarkMode ? "#3a3a3a" : "#e0e0e0";
    const pageFont    = fontFamily || 'Calibri, "Segoe UI", Arial, sans-serif';

    return (
      <div
        ref={workspaceRef}
        style={{
          backgroundColor: workspaceBg,
          width:           "100%",
          minHeight:       "100%",
          padding:         "32px 16px 48px",
          boxSizing:       "border-box",
          overflowX:       "auto",
        }}
      >
        {/* Placeholder CSS */}
        <style>{`
          [data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            position: absolute;
          }
        `}</style>

        {/* ── Page stack ────────────────────────────────────────────────── */}
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            `${Math.round(24 * scale)}px`,
          }}
        >
          {pageIds.map((pageId, pageIndex) => (
            <div
              key={pageId}
              style={{
                width:      `${PAGE_W * scale}px`,
                height:     `${PAGE_H * scale}px`,
                position:   "relative",
                flexShrink: 0,
              }}
            >
              {/* White paper sheet */}
              <div
                style={{
                  width:           `${PAGE_W}px`,
                  height:          `${PAGE_H}px`,
                  backgroundColor: "#ffffff",
                  boxShadow:       "0 2px 8px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
                  position:        "absolute",
                  top:             0,
                  left:            0,
                  transformOrigin: "top left",
                  transform:       `scale(${scale})`,
                  overflow:        "hidden",
                }}
              >
                {/* Editable text layer */}
                <div
                  ref={(el) => { pageRefs.current[pageIndex] = el; }}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => setActivePageIndex(pageIndex)}
                  onInput={() => handleInput(pageIndex)}
                  onPaste={(e) => handlePaste(e, pageIndex)}
                  onKeyDown={handleKeyDown}
                  data-placeholder={pageIndex === 0 ? "Start typing…" : ""}
                  style={{
                    position:     "absolute",
                    top:          0,
                    left:         0,
                    width:        "100%",
                    height:       `${CONTENT_H + MARGIN * 2}px`,
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

                {/* Margin guide (subtle dashed lines) */}
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

                {/* Page number */}
                <div
                  style={{
                    position:      "absolute",
                    bottom:        "0.4in",
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

        {/* ── Bottom status bar ────────────────────────────────────────── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            marginTop:      "20px",
            maxWidth:       `${PAGE_W * scale}px`,
            marginLeft:     "auto",
            marginRight:    "auto",
          }}
        >
          <span style={{ fontSize: "12px", color: "#888" }}>

            {/* Active page indicator/ Page count */}
            {activePageIndex + 1} / {pageIds.length} page{pageIds.length !== 1 ? "s" : ""}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width:           "8px",
                height:          "8px",
                borderRadius:    "50%",
                display:         "inline-block",
                flexShrink:      0,
                backgroundColor: isSynced ? "#22c55e" : "#f59e0b",
              }}
            />
            <span style={{ fontSize: "12px", color: "#888" }}>
              {isSynced ? "Connected" : "Connecting…"}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

CollaborativeEditor.displayName = "CollaborativeEditor";

export default CollaborativeEditor;