// components/CollaborativeEditor.jsx
import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { useTheme } from "../contexts/ThemeContext";

const CollaborativeEditor = forwardRef(({
  ydoc,
  provider,
  user,
  // paperSize and margins are intentionally NOT used here anymore.
  // The parent (CreateDocumentWithHistory) owns the page shell — white card,
  // shadow, padding (margins), and page-break visuals. This component simply
  // fills whatever space the parent gives it.
  fontFamily,
  onUpdate,
  initialContent
}, ref) => {
  const { isDarkMode, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const editorRef = useRef(null);
  const [isSynced, setIsSynced] = useState(false);
  const isLocalUpdateRef = useRef(false);
  const lastRemoteContentRef = useRef('');

  // Get cursor position
  const getCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  };

  // Set cursor position
  const setCursorPosition = (position) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    const range = document.createRange();
    let currentPos = 0;
    let found = false;

    const setPositionInNode = (node) => {
      if (found) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeLength = node.textContent.length;
        if (currentPos + nodeLength >= position) {
          range.setStart(node, position - currentPos);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          found = true;
          return;
        }
        currentPos += nodeLength;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          setPositionInNode(node.childNodes[i]);
          if (found) return;
        }
      }
    };

    setPositionInNode(editorRef.current);
  };

  // Initialize Y.Text observer
  useEffect(() => {
    if (!ydoc || !provider) return;

    const ytext = ydoc.getText('document');

    const handleYTextChange = (event, transaction) => {
      if (transaction.local) return;

      const newContent = ytext.toString();
      if (newContent === lastRemoteContentRef.current) return;

      lastRemoteContentRef.current = newContent;
      const cursorPos = getCursorPosition();

      if (editorRef.current) {
        isLocalUpdateRef.current = true;
        editorRef.current.innerHTML = newContent;
        isLocalUpdateRef.current = false;
        if (cursorPos !== null) {
          setTimeout(() => setCursorPosition(cursorPos), 0);
        }
      }
    };

    ytext.observe(handleYTextChange);

    const handleSync = (synced) => {
      setIsSynced(synced);
      if (synced) {
        const existingContent = ytext.toString();
        if (existingContent.length === 0 && initialContent) {
          ydoc.transact(() => {
            ytext.insert(0, initialContent);
          }, 'init');
          lastRemoteContentRef.current = initialContent;
          if (editorRef.current && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = initialContent;
          }
        } else if (existingContent.length > 0) {
          lastRemoteContentRef.current = existingContent;
          if (editorRef.current) {
            editorRef.current.innerHTML = existingContent;
          }
        }
      }
    };

    provider.on('sync', handleSync);
    if (provider.synced) handleSync(true);

    return () => {
      ytext.unobserve(handleYTextChange);
      provider.off('sync', handleSync);
    };
  }, [ydoc, provider, initialContent]);

  // Handle local typing
  const handleInput = (e) => {
    if (isLocalUpdateRef.current || !ydoc) return;

    const ytext = ydoc.getText('document');
    const newContent = e.target.innerHTML;
    const oldContent = ytext.toString();

    let i = 0;
    while (i < Math.min(oldContent.length, newContent.length) && oldContent[i] === newContent[i]) i++;

    let j = 0;
    while (
      j < Math.min(oldContent.length - i, newContent.length - i) &&
      oldContent[oldContent.length - 1 - j] === newContent[newContent.length - 1 - j]
    ) j++;

    const deleteLength = oldContent.length - i - j;
    const insertText = newContent.substring(i, newContent.length - j);

    ydoc.transact(() => {
      if (deleteLength > 0) ytext.delete(i, deleteLength);
      if (insertText.length > 0) ytext.insert(i, insertText);
    }, 'local');

    onUpdate?.(newContent);
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    handleInput({ target: editorRef.current });
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    const applyInlineFormat = (tag) => {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
      const selectedText = range.toString();
      if (!selectedText.trim()) return;

      const isActive = document.queryCommandState(
        tag === 'strong' ? 'bold' : tag === 'em' ? 'italic' : 'underline'
      );
      const words = selectedText.split(' ');
      let newHtml = '';
      words.forEach((word, idx) => {
        if (word.trim()) {
          newHtml += isActive ? word : `<${tag}>${word}</${tag}>`;
        }
        if (idx < words.length - 1) newHtml += '&nbsp;';
      });

      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = newHtml;
      const fragment = document.createDocumentFragment();
      while (div.firstChild) fragment.appendChild(div.firstChild);
      range.insertNode(fragment);
      selection.removeAllRanges();
      selection.addRange(range);
      setTimeout(() => handleInput({ target: editorRef.current }), 0);
    };

    if ((e.ctrlKey || e.metaKey) && e.key === 'b') applyInlineFormat('strong');
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') applyInlineFormat('em');
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') applyInlineFormat('u');
  };

  // Expose imperative API to parent
  useImperativeHandle(ref, () => ({
    getHTML: () => editorRef.current?.innerHTML || '',
    getText: () => editorRef.current?.innerText || '',
    isEmpty: !editorRef.current?.innerHTML || editorRef.current.innerHTML.trim() === '',
    focus: () => editorRef.current?.focus(),
    setContent: (newContent) => {
      if (!ydoc) return;
      const ytext = ydoc.getText('document');
      ydoc.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, newContent);
      }, 'api');
      lastRemoteContentRef.current = newContent;
      if (editorRef.current) editorRef.current.innerHTML = newContent;
    },
    clearContent: () => {
      if (!ydoc) return;
      const ytext = ydoc.getText('document');
      ydoc.transact(() => { ytext.delete(0, ytext.length); }, 'api');
      lastRemoteContentRef.current = '';
      if (editorRef.current) editorRef.current.innerHTML = '';
    },
    commands: {
      setContent: (newContent) => {
        if (!ydoc) return;
        const ytext = ydoc.getText('document');
        ydoc.transact(() => {
          ytext.delete(0, ytext.length);
          ytext.insert(0, newContent);
        }, 'api');
        lastRemoteContentRef.current = newContent;
        if (editorRef.current) editorRef.current.innerHTML = newContent;
      },
      focus: () => editorRef.current?.focus(),
    }
  }), [ydoc]);

  return (
    <div className="w-full">
      {/*
        The editor div fills 100% of the page card given by the parent.
        NO fixed height, NO fixed width, NO padding (margins live in the parent).
        min-height ensures at least a comfortable editing area even when empty.
      */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          // A concrete min-height so the area is always clickable when empty.
          // 'minHeight: 100%' collapses to 0 because the parent has no fixed height.
          // This matches A4 minus the 1in top+bottom margins applied by the page shell.
          minHeight: 'calc(11.69in - 2in)',
          fontFamily: fontFamily || 'Calibri, Inter, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.6',
          color: currentColors.text,
          outline: 'none',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          cursor: 'text',
        }}
      ></div>

      {/* Sync status indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSynced ? 'bg-green-500' : 'bg-amber-400'}`} />
        <span className="text-xs" style={{ color: currentColors.textSecondary }}>
          {isSynced ? 'Connected' : 'Connecting…'}
        </span>
      </div>
    </div>
  );
});

CollaborativeEditor.displayName = 'CollaborativeEditor';

export default CollaborativeEditor;