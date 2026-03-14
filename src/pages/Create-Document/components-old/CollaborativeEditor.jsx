// components/CollaborativeEditor.jsx - Enhanced Version
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "../contexts-old/ThemeContext";

const CollaborativeEditor = forwardRef(
  (
    {
      ydoc,
      provider,
      user,
      paperSize,
      margins,
      fontFamily,
      onUpdate,
      initialContent,
    },
    ref,
  ) => {
    const { isDarkMode, colors } = useTheme();
    const currentColors = isDarkMode ? colors.dark : colors.light;

    const editorRef = useRef(null);
    const [isSynced, setIsSynced] = useState(false);
    const isLocalUpdateRef = useRef(false);
    const lastRemoteContentRef = useRef("");

    // Responsive: track viewport to scale the paper appropriately on small screens
    const [viewportWidth, setViewportWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 1024,
    );

    useEffect(() => {
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Compute scaled paper dimensions so the sheet always fits in the viewport
    const getResponsivePaperStyle = () => {
      const rawWidth = paperSize?.width || "8.27in";
      const rawHeight = paperSize?.height || "11.69in";
      const rawMarginTop = margins?.top || "1in";
      const rawMarginRight = margins?.right || "1in";
      const rawMarginBottom = margins?.bottom || "1in";
      const rawMarginLeft = margins?.left || "1in";

      // On small screens, use 100% width instead of fixed inches
      if (viewportWidth < 640) {
        return {
          width: "100%",
          minHeight: "80vh",
          marginTop: "0.5in",
          marginRight: "0.5in",
          marginBottom: "0.5in",
          marginLeft: "0.5in",
        };
      }
      if (viewportWidth < 1024) {
        return {
          width: "100%",
          maxWidth: rawWidth,
          minHeight: rawHeight,
          marginTop: rawMarginTop,
          marginRight: rawMarginRight,
          marginBottom: rawMarginBottom,
          marginLeft: rawMarginLeft,
        };
      }
      return {
        width: rawWidth,
        minHeight: rawHeight,
        marginTop: rawMarginTop,
        marginRight: rawMarginRight,
        marginBottom: rawMarginBottom,
        marginLeft: rawMarginLeft,
      };
    };

    // Get cursor position
    const getCursorPosition = () => {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const position = preCaretRange.toString().length;

      return position;
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
      if (!ydoc || !provider) {
        console.log("No ydoc or provider available");
        return;
      }

      const ytext = ydoc.getText("document");
      console.log("Setting up Y.Text observer");

      // Handle remote changes from other users
      const handleYTextChange = (event, transaction) => {
        // Ignore if this is our own change
        if (transaction.local) {
          console.log("Skipping local transaction");
          return;
        }

        console.log("Remote change detected from another user");
        const newContent = ytext.toString();

        // Don't update if content is the same
        if (newContent === lastRemoteContentRef.current) {
          console.log("Content unchanged, skipping update");
          return;
        }

        lastRemoteContentRef.current = newContent;

        // Save cursor position
        const cursorPos = getCursorPosition();
        console.log("Cursor position before update:", cursorPos);

        // Update editor content
        if (editorRef.current) {
          isLocalUpdateRef.current = true;
          editorRef.current.innerHTML = newContent;
          isLocalUpdateRef.current = false;

          // Restore cursor position
          if (cursorPos !== null) {
            setTimeout(() => {
              setCursorPosition(cursorPos);
            }, 0);
          }
        }

        console.log("Updated editor with remote content");
      };

      ytext.observe(handleYTextChange);

      // Handle sync event
      const handleSync = (synced) => {
        console.log("Provider sync status:", synced);
        setIsSynced(synced);

        if (synced) {
          const existingContent = ytext.toString();

          if (existingContent.length === 0 && initialContent) {
            // Set initial content if document is empty
            console.log(
              "Setting initial content:",
              initialContent.substring(0, 50) + "...",
            );
            ydoc.transact(() => {
              ytext.insert(0, initialContent);
            }, "init");

            lastRemoteContentRef.current = initialContent;
            if (editorRef.current && !editorRef.current.innerHTML) {
              editorRef.current.innerHTML = initialContent;
            }
          } else if (existingContent.length > 0) {
            // Load existing content from other users
            console.log("Loading existing content from server");
            lastRemoteContentRef.current = existingContent;
            if (editorRef.current) {
              editorRef.current.innerHTML = existingContent;
            }
          }
        }
      };

      provider.on("sync", handleSync);

      // Check if already synced
      if (provider.synced) {
        handleSync(true);
      }

      return () => {
        console.log("Cleaning up Y.Text observer");
        ytext.unobserve(handleYTextChange);
        provider.off("sync", handleSync);
      };
    }, [ydoc, provider, initialContent]);

    const [showPlaceholder, setShowPlaceholder] = useState(!initialContent?.trim());

    // Handle focus/blur for placeholder
    const handleFocus = () => {
      setShowPlaceholder(false);
    };

    const handleBlur = () => {
      if (!editorRef.current?.innerHTML.trim()) {
        setShowPlaceholder(true);
      }
    };

    // Handle local changes (user typing)
    const handleInput = (e) => {
      const hasContent = e.target.innerHTML.trim();
      setShowPlaceholder(!hasContent);
      
      if (isLocalUpdateRef.current) {
        console.log("Skipping input handler - local update in progress");
        return;
      }

      if (!ydoc) {
        console.warn("No ydoc available for input handling");
        return;
      }

      const ytext = ydoc.getText("document");
      const newContent = e.target.innerHTML;
      const oldContent = ytext.toString();

      console.log("Local input change");
      console.log("Old content length:", oldContent.length);
      console.log("New content length:", newContent.length);

      // Perform character-level diff
      let i = 0;
      while (
        i < Math.min(oldContent.length, newContent.length) &&
        oldContent[i] === newContent[i]
      ) {
        i++;
      }

      let j = 0;
      while (
        j < Math.min(oldContent.length - i, newContent.length - i) &&
        oldContent[oldContent.length - 1 - j] ===
          newContent[newContent.length - 1 - j]
      ) {
        j++;
      }

      const deleteLength = oldContent.length - i - j;
      const insertText = newContent.substring(i, newContent.length - j);

      console.log(
        `Diff: delete ${deleteLength} chars at pos ${i}, insert "${insertText}"`,
      );

      // Apply changes to Y.Text
      ydoc.transact(() => {
        if (deleteLength > 0) {
          ytext.delete(i, deleteLength);
        }
        if (insertText.length > 0) {
          ytext.insert(i, insertText);
        }
      }, "local");

      // Notify parent for auto-save
      onUpdate?.(newContent);
    };

    // Handle paste events
    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");

      // Insert text at cursor position
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger input event
      handleInput({ target: editorRef.current });
    };

    // Handle key events for formatting
    const handleKeyDown = (e) => {
      // Handle bold (Ctrl/Cmd + B)
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        document.execCommand("bold", false, null);
        setTimeout(() => handleInput({ target: editorRef.current }), 0);
      }

      // Handle italic (Ctrl/Cmd + I)
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        document.execCommand("italic", false, null);
        setTimeout(() => handleInput({ target: editorRef.current }), 0);
      }

      // Handle underline (Ctrl/Cmd + U)
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        document.execCommand("underline", false, null);
        setTimeout(() => handleInput({ target: editorRef.current }), 0);
      }
    };

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editorRef.current?.innerHTML || "",
        getText: () => editorRef.current?.innerText || "",
        isEmpty:
          !editorRef.current?.innerHTML ||
          editorRef.current.innerHTML.trim() === "",
        setContent: (newContent) => {
          if (!ydoc) return;
          const ytext = ydoc.getText("document");
          ydoc.transact(() => {
            ytext.delete(0, ytext.length);
            ytext.insert(0, newContent);
          }, "api");
          lastRemoteContentRef.current = newContent;
          if (editorRef.current) {
            editorRef.current.innerHTML = newContent;
          }
        },
        clearContent: () => {
          if (!ydoc) return;
          const ytext = ydoc.getText("document");
          ydoc.transact(() => {
            ytext.delete(0, ytext.length);
          }, "api");
          lastRemoteContentRef.current = "";
          if (editorRef.current) {
            editorRef.current.innerHTML = "";
          }
        },
        focus: () => editorRef.current?.focus(),
        commands: {
          setContent: (newContent) => {
            if (!ydoc) return;
            const ytext = ydoc.getText("document");
            ydoc.transact(() => {
              ytext.delete(0, ytext.length);
              ytext.insert(0, newContent);
            }, "api");
            lastRemoteContentRef.current = newContent;
            if (editorRef.current) {
              editorRef.current.innerHTML = newContent;
            }
          },
          focus: () => editorRef.current?.focus(),
        },
      }),
      [ydoc],
    );

    const responsivePaperStyle = getResponsivePaperStyle();

    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center px-2 sm:px-4 md:px-0">
          <div className="relative w-full">
            {showPlaceholder && (
              <div
                className="absolute top-0 left-0 pointer-events-none p-4 sm:p-6 md:p-8"
                style={{
                  color: currentColors.textSecondary,
                  fontFamily: fontFamily || "Inter, sans-serif",
                  fontSize: "16px",
                  zIndex: 1,
                }}
              >
                Start typing here...
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable={true}
              onInput={handleInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              className="prose prose-sm sm:prose-base lg:prose-lg focus:outline-none max-w-none min-h-[400px] sm:min-h-[500px] p-4 sm:p-6 md:p-8 relative"
              style={{
                ...responsivePaperStyle,
                fontFamily: fontFamily || "Inter, sans-serif",
                background: currentColors.surface,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: currentColors.text,
                outline: "none",
                border: `1px solid ${currentColors.border}`,
                boxSizing: "border-box",
                zIndex: 2,
              }}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 justify-start px-2 sm:px-4 md:px-0">
          <div
            className={`w-2 h-2 rounded-full ${isSynced ? "bg-green-500" : "bg-red-500"}`}
          />
          <span
            className="text-xs sm:text-sm"
            style={{ color: currentColors.textSecondary }}
          >
            {isSynced ? "Connected to collaboration" : "Connecting..."}
          </span>
        </div>
      </div>
    );
  },
);

CollaborativeEditor.displayName = "CollaborativeEditor";

export default CollaborativeEditor;
