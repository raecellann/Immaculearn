import { useEffect, useRef, useCallback } from "react";
import { getYjsProvider } from "../crdt/yjsProvider";

export default function useYjsEditor(editorRef, roomName, user) {
  const isRemoteRef = useRef(false);
  const caretLayerRef = useRef(null);
  const awarenessRef = useRef(null);
  const yTextRef = useRef(null);
  const docRef = useRef(null);
  const clientIdRef = useRef(null);

  // --- Ensure editor has at least one text node
  const ensureTextNode = useCallback(() => {
    if (!editorRef.current) return;
    if (editorRef.current.childNodes.length === 0) {
      editorRef.current.appendChild(document.createTextNode(""));
    }
  }, [editorRef]);

  // --- Helper: get caret index ---
  const getCaretIndex = useCallback((node, offset) => {
    if (!editorRef.current) return 0;
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.setEnd(node, offset);
    return range.toString().length;
  }, [editorRef]);

  // --- Helper: get range from index ---
  const getRangeFromIndex = useCallback((index) => {
    if (!editorRef.current) return null;
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    let node;
    let remaining = index;

    while ((node = walker.nextNode())) {
      if (remaining <= node.textContent.length) {
        const range = document.createRange();
        range.setStart(node, remaining);
        range.setEnd(node, remaining);
        return range;
      }
      remaining -= node.textContent.length;
    }

    // Fallback: append a text node at the end
    const textNode = document.createTextNode("");
    editorRef.current.appendChild(textNode);
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 0);
    return range;
  }, [editorRef]);

  // --- Update cursor/selection for local user ---
  const updateCursorAndSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount || !awarenessRef.current) return;

    const range = selection.getRangeAt(0);
    const startIndex = getCaretIndex(range.startContainer, range.startOffset);
    const endIndex = getCaretIndex(range.endContainer, range.endOffset);

    awarenessRef.current.setLocalState({
      ...awarenessRef.current.getLocalState(),
      user,
      cursor: { index: startIndex, selectionStart: startIndex, selectionEnd: endIndex },
    });
  }, [getCaretIndex, user]);

  // --- Render carets and selections ---
  const renderCarets = useCallback(() => {
    if (!editorRef.current || !caretLayerRef.current || !awarenessRef.current) return;
    ensureTextNode();

    const layer = caretLayerRef.current;
    layer.innerHTML = ""; // clear old carets/selections

    const userStates = Array.from(awarenessRef.current.getStates().entries())
      .filter(([id, state]) => state.cursor && state.user)
      .map(([id, state], index) => ({
        id,
        cursor: state.cursor,
        user: state.user,
        isCurrentUser: id === clientIdRef.current,
        userIndex: id === clientIdRef.current ? null : index + 1,
      }));

    userStates.forEach(({ cursor, user: userState, isCurrentUser, userIndex }) => {
      const { index, selectionStart, selectionEnd } = cursor;
      const hasSelection = selectionStart !== selectionEnd;
      const { name, color = "#4f46e5" } = userState;

      // --- Render selection ---
      if (hasSelection) {
        const startRange = getRangeFromIndex(selectionStart);
        const endRange = getRangeFromIndex(selectionEnd);
        if (startRange && endRange) {
          try {
            const selectionRange = document.createRange();
            selectionRange.setStart(startRange.startContainer, startRange.startOffset);
            selectionRange.setEnd(endRange.startContainer, endRange.startOffset);

            const rects = Array.from(selectionRange.getClientRects());
            rects.forEach((rect) => {
              const highlight = document.createElement("div");
              highlight.style.position = "absolute";
              highlight.style.top = `${rect.top + window.scrollY}px`;
              highlight.style.left = `${rect.left + window.scrollX}px`;
              highlight.style.width = `${rect.width}px`;
              highlight.style.height = `${rect.height}px`;
              highlight.style.backgroundColor = `${color}33`;
              highlight.style.pointerEvents = "none";
              highlight.style.zIndex = "5";
              layer.appendChild(highlight);
            });
          } catch (e) {
            console.warn("Failed to render selection", e);
          }
        }
      }

      // --- Render caret ---
      const range = getRangeFromIndex(index);
      if (!range) return;
      const rect = range.getBoundingClientRect();

      const caretContainer = document.createElement("div");
      caretContainer.style.position = "absolute";
      caretContainer.style.top = `${rect.top + window.scrollY}px`;
      caretContainer.style.left = `${rect.left + window.scrollX}px`;
      caretContainer.style.height = `${rect.height}px`;
      caretContainer.style.pointerEvents = "none";
      caretContainer.style.zIndex = "10";

      // caret element
      const caret = document.createElement("div");
      caret.style.width = isCurrentUser ? "3px" : "2px";
      caret.style.height = "100%";
      caret.style.backgroundColor = color;
      caret.style.boxShadow = isCurrentUser ? `0 0 5px ${color}` : "";
      caret.style.opacity = "1";
      if (isCurrentUser) caret.style.animation = "blink 1s steps(2, start) infinite";

      // label element
      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.bottom = "100%";
      label.style.left = "0";
      label.style.backgroundColor = isCurrentUser ? color : `${color}80`;
      label.style.color = "white";
      label.style.fontSize = "12px";
      label.style.fontWeight = "500";
      label.style.padding = "2px 6px";
      label.style.borderRadius = "4px 4px 4px 0";
      label.style.whiteSpace = "nowrap";
      label.style.pointerEvents = "none";
      label.innerText = isCurrentUser ? name : `User ${userIndex}`;

      caretContainer.appendChild(caret);
      caretContainer.appendChild(label);
      layer.appendChild(caretContainer);
    });
  }, [editorRef, getRangeFromIndex, ensureTextNode]);

  // --- Main effect ---
  useEffect(() => {
    if (!editorRef.current) return;
    ensureTextNode();

    const { doc, provider } = getYjsProvider(roomName);
    const awareness = provider.awareness;
    const yText = doc.getText("editor");

    awarenessRef.current = awareness;
    yTextRef.current = yText;
    docRef.current = doc;
    clientIdRef.current = awareness.clientID;

    // --- Set initial awareness state ---
    awareness.setLocalState({
      ...awareness.getLocalState(),
      user: { ...user, id: clientIdRef.current },
      cursor: { index: 0, selectionStart: 0, selectionEnd: 0 },
    });

    // --- Create caret layer ---
    if (!caretLayerRef.current) {
      const layer = document.createElement("div");
      layer.style.position = "absolute";
      layer.style.top = "0";
      layer.style.left = "0";
      layer.style.width = "100%";
      layer.style.height = "100%";
      layer.style.pointerEvents = "none";
      layer.style.zIndex = "10";
      editorRef.current.parentElement.style.position = "relative";
      editorRef.current.parentElement.appendChild(layer);
      caretLayerRef.current = layer;
    }

    // --- Remote updates ---
    const updateFromYjs = () => {
      if (!editorRef.current || isRemoteRef.current) return;
      isRemoteRef.current = true;
      const newText = yText.toString();
      if (editorRef.current.innerText !== newText) {
        editorRef.current.innerText = newText;
      }
      isRemoteRef.current = false;
    };
    yText.observe(updateFromYjs);

    // --- Handle input ---
    const onInput = () => {
      updateCursorAndSelection();
      if (isRemoteRef.current) return;

      const oldText = yText.toString();
      const newText = editorRef.current.innerText;

      // incremental update
      let start = 0;
      while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) start++;
      let endOld = oldText.length - 1;
      let endNew = newText.length - 1;
      while (endOld >= start && endNew >= start && oldText[endOld] === newText[endNew]) {
        endOld--;
        endNew--;
      }

      doc.transact(() => {
        if (endOld >= start) yText.delete(start, endOld - start + 1);
        if (endNew >= start) yText.insert(start, newText.slice(start, endNew + 1));
      });
    };

    editorRef.current.addEventListener("input", onInput);
    document.addEventListener("selectionchange", updateCursorAndSelection);
    awareness.on("change", renderCarets);

    renderCarets();

    return () => {
      yText.unobserve(updateFromYjs);
      editorRef.current?.removeEventListener("input", onInput);
      document.removeEventListener("selectionchange", updateCursorAndSelection);
      awareness.off("change", renderCarets);
      caretLayerRef.current?.remove();
    };
  }, [roomName, user, updateCursorAndSelection, renderCarets, ensureTextNode, editorRef]);
}
