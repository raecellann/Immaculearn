// components/CollaborativeEditor.jsx - Enhanced Responsive Version with MS Word-like Margins
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

    // Enhanced responsive tracking with device pixel ratio and screen dimensions
    const [viewportInfo, setViewportInfo] = useState({
      width: typeof window !== "undefined" ? window.innerWidth : 1024,
      height: typeof window !== "undefined" ? window.innerHeight : 768,
      pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      orientation: typeof window !== "undefined" 
        ? (window.innerHeight > window.innerWidth ? "portrait" : "landscape")
        : "landscape",
    });

    useEffect(() => {
      const handleResize = () => {
        setViewportInfo({
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio || 1,
          orientation: window.innerHeight > window.innerWidth ? "portrait" : "landscape",
        });
      };
      
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }, []);

    // Parse dimension strings to pixels with high precision
    const parseDimension = (dimStr, baseDimension = 96) => {
      if (typeof dimStr !== 'string') return 0;
      
      // Remove any whitespace
      dimStr = dimStr.trim();
      
      // Handle different units
      if (dimStr.includes('in')) {
        const inches = parseFloat(dimStr) || 0;
        return inches * 96; // 1in = 96px in CSS
      }
      if (dimStr.includes('px')) {
        return parseFloat(dimStr) || 0;
      }
      if (dimStr.includes('cm')) {
        const cm = parseFloat(dimStr) || 0;
        return cm * 37.8; // 1cm ≈ 37.8px
      }
      if (dimStr.includes('mm')) {
        const mm = parseFloat(dimStr) || 0;
        return mm * 3.78; // 1mm ≈ 3.78px
      }
      if (dimStr.includes('pt')) {
        const pt = parseFloat(dimStr) || 0;
        return pt * 1.33; // 1pt ≈ 1.33px
      }
      if (dimStr.includes('pc')) {
        const pc = parseFloat(dimStr) || 0;
        return pc * 16; // 1pc = 12pt = 16px (approx)
      }
      
      // Default to pixels if no unit specified
      return parseFloat(dimStr) || 0;
    };

    // Convert pixels back to inches for display (preserves original intent)
    const pixelsToInches = (px) => {
      return px / 96;
    };

    // Calculate scaled margins based on device size (like MS Word)
    const getScaledMargins = () => {
      const rawMarginTop = margins?.top || "1in";
      const rawMarginRight = margins?.right || "1in";
      const rawMarginBottom = margins?.bottom || "1in";
      const rawMarginLeft = margins?.left || "1in";

      const { width: screenWidth } = viewportInfo;
      
      // Convert to pixels for calculations
      const marginTopPx = parseDimension(rawMarginTop);
      const marginRightPx = parseDimension(rawMarginRight);
      const marginBottomPx = parseDimension(rawMarginBottom);
      const marginLeftPx = parseDimension(rawMarginLeft);

      // MS Word-like scaling factors for different devices
      // On very small screens, margins are reduced but maintain proportion
      let scaleFactor = 1.0;
      
      if (screenWidth < 320) {
        // Ultra small devices (1-inch screens) - minimal but readable margins
        scaleFactor = 0.25;
      } else if (screenWidth < 375) {
        // Very small phones
        scaleFactor = 0.35;
      } else if (screenWidth < 425) {
        // Small phones
        scaleFactor = 0.45;
      } else if (screenWidth < 640) {
        // Medium phones
        scaleFactor = 0.55;
      } else if (screenWidth < 768) {
        // Tablets portrait
        scaleFactor = 0.7;
      } else if (screenWidth < 1024) {
        // Tablets landscape / Small laptops
        scaleFactor = 0.85;
      } else {
        // Desktop - full margins
        scaleFactor = 1.0;
      }

      // Ensure minimum margins for readability on tiny screens
      const minMargin = screenWidth < 375 ? 4 : 8; // pixels

      return {
        top: Math.max(marginTopPx * scaleFactor, minMargin),
        right: Math.max(marginRightPx * scaleFactor, minMargin),
        bottom: Math.max(marginBottomPx * scaleFactor, minMargin),
        left: Math.max(marginLeftPx * scaleFactor, minMargin),
        scaleFactor, // Return for debugging/info
      };
    };

    // Ultra-responsive paper sizing for all screen sizes (like MS Word)
    const getResponsivePaperStyle = () => {
      const rawWidth = paperSize?.width || "8.27in"; // A4 default
      const rawHeight = paperSize?.height || "11.69in";

      const { width: screenWidth, height: screenHeight, orientation } = viewportInfo;
      
      // Get scaled margins
      const scaledMargins = getScaledMargins();
      
      // Convert dimensions to pixels
      const widthPx = parseDimension(rawWidth);
      const heightPx = parseDimension(rawHeight);

      // Calculate available content width after margins
      const contentWidth = screenWidth - scaledMargins.left - scaledMargins.right - 32; // 32px for padding

      // Determine paper width based on screen size
      let paperWidth;
      let paperHeight;
      let fontSize;

      if (screenWidth < 320) {
        // Ultra small devices - full width with minimal gutters
        paperWidth = "100%";
        paperHeight = `${Math.min(screenHeight * 0.7, 400)}px`;
        fontSize = "12px";
      } else if (screenWidth < 375) {
        paperWidth = "100%";
        paperHeight = `${Math.min(screenHeight * 0.72, 450)}px`;
        fontSize = "13px";
      } else if (screenWidth < 425) {
        paperWidth = "100%";
        paperHeight = `${Math.min(screenHeight * 0.75, 500)}px`;
        fontSize = "14px";
      } else if (screenWidth < 640) {
        paperWidth = "100%";
        paperHeight = `${Math.min(screenHeight * 0.78, 550)}px`;
        fontSize = "15px";
      } else if (screenWidth < 768) {
        // Tablets - maintain aspect ratio but scale down
        paperWidth = `${Math.min(widthPx, contentWidth)}px`;
        paperHeight = orientation === 'portrait' 
          ? `${Math.min(heightPx, screenHeight * 0.7)}px`
          : `${Math.min(heightPx, screenHeight * 0.8)}px`;
        fontSize = "16px";
      } else if (screenWidth < 1024) {
        paperWidth = `${Math.min(widthPx, contentWidth * 0.9)}px`;
        paperHeight = orientation === 'landscape' 
          ? `${Math.min(heightPx, screenHeight * 0.8)}px`
          : `${Math.min(heightPx, screenHeight * 0.85)}px`;
        fontSize = "16px";
      } else {
        // Desktop - original dimensions with max width constraint
        paperWidth = `${Math.min(widthPx, screenWidth * 0.8)}px`;
        paperHeight = `${Math.min(heightPx, screenHeight * 0.9)}px`;
        fontSize = "16px";
      }

      return {
        width: paperWidth,
        minHeight: paperHeight,
        padding: `${scaledMargins.top}px ${scaledMargins.right}px ${scaledMargins.bottom}px ${scaledMargins.left}px`,
        fontSize: fontSize,
        lineHeight: screenWidth < 640 ? "1.5" : "1.6",
        // Additional MS Word-like properties
        maxWidth: screenWidth >= 1024 ? `${widthPx}px` : "100%",
        margin: screenWidth < 640 ? "0 auto" : "0 auto", // Centered
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
        if (transaction.local) {
          console.log("Skipping local transaction");
          return;
        }

        console.log("Remote change detected from another user");
        const newContent = ytext.toString();

        if (newContent === lastRemoteContentRef.current) {
          console.log("Content unchanged, skipping update");
          return;
        }

        lastRemoteContentRef.current = newContent;

        const cursorPos = getCursorPosition();

        if (editorRef.current) {
          isLocalUpdateRef.current = true;
          editorRef.current.innerHTML = newContent;
          isLocalUpdateRef.current = false;

          if (cursorPos !== null) {
            setTimeout(() => {
              setCursorPosition(cursorPos);
            }, 0);
          }
        }

        console.log("Updated editor with remote content");
      };

      ytext.observe(handleYTextChange);

      const handleSync = (synced) => {
        console.log("Provider sync status:", synced);
        setIsSynced(synced);

        if (synced) {
          const existingContent = ytext.toString();

          if (existingContent.length === 0 && initialContent) {
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
            console.log("Loading existing content from server");
            lastRemoteContentRef.current = existingContent;
            if (editorRef.current) {
              editorRef.current.innerHTML = existingContent;
            }
          }
        }
      };

      provider.on("sync", handleSync);

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

    const handleFocus = () => {
      setShowPlaceholder(false);
    };

    const handleBlur = () => {
      if (!editorRef.current?.innerHTML.trim()) {
        setShowPlaceholder(true);
      }
    };

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

      ydoc.transact(() => {
        if (deleteLength > 0) {
          ytext.delete(i, deleteLength);
        }
        if (insertText.length > 0) {
          ytext.insert(i, insertText);
        }
      }, "local");

      onUpdate?.(newContent);
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");

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

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        document.execCommand("bold", false, null);
        setTimeout(() => handleInput({ target: editorRef.current }), 0);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        document.execCommand("italic", false, null);
        setTimeout(() => handleInput({ target: editorRef.current }), 0);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        document.execCommand("underline", false, null);
        setTimeout(() => handleInput({ target: editorRef.current }), 0);
      }
    };

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
    const scaledMargins = getScaledMargins();
    const { width: screenWidth } = viewportInfo;

    const isUltraSmall = screenWidth < 320;
    const isVerySmall = screenWidth >= 320 && screenWidth < 375;

    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center">
          <div className="relative w-full flex justify-center">
            {showPlaceholder && (
              <div
                className="absolute pointer-events-none"
                style={{
                  color: currentColors.textSecondary,
                  fontFamily: fontFamily || "Inter, sans-serif",
                  fontSize: responsivePaperStyle.fontSize,
                  padding: responsivePaperStyle.padding,
                  zIndex: 1,
                  width: '100%',
                  maxWidth: responsivePaperStyle.width,
                  boxSizing: 'border-box',
                  opacity: 0.6,
                }}
              >
                {isUltraSmall ? 'Tap to type...' : isVerySmall ? 'Start typing...' : 'Start typing here...'}
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
              className="prose focus:outline-none max-w-none relative overflow-auto"
              style={{
                ...responsivePaperStyle,
                fontFamily: fontFamily || "Inter, sans-serif",
                background: currentColors.surface,
                boxShadow: screenWidth < 640 
                  ? "0 2px 8px -2px rgb(0 0 0 / 0.1)" // MS Word-like subtle shadow
                  : "0 4px 12px -4px rgb(0 0 0 / 0.15)",
                color: currentColors.text,
                outline: "none",
                border: `1px solid ${currentColors.border}`,
                borderRadius: screenWidth < 640 ? '2px' : '4px', // MS Word minimal border radius
                boxSizing: "border-box",
                zIndex: 2,
                WebkitOverflowScrolling: 'touch',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                // MS Word-like text rendering
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>
        
        {/* Status indicator with MS Word-like subtlety */}
        <div className="mt-3 sm:mt-4 flex items-center gap-2 justify-between px-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isSynced ? "bg-green-500" : "bg-red-500"}`}
              style={{
                animation: isSynced ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <span
              className="text-xs"
              style={{ color: currentColors.textSecondary }}
            >
              {isSynced 
                ? (screenWidth < 375 ? 'Online' : 'Connected')
                : (screenWidth < 375 ? 'Offline' : 'Connecting...')}
            </span>
          </div>
          
          {/* Show page dimensions like MS Word status bar */}
          {screenWidth >= 640 && (
            <div className="flex items-center gap-3 text-xs" style={{ color: currentColors.textSecondary }}>
              <span>{paperSize?.width || "8.27"} × {paperSize?.height || "11.69"}</span>
              <span>•</span>
              <span>{(scaledMargins.scaleFactor * 100).toFixed(0)}%</span>
              {provider?.awareness && (
                <>
                  <span>•</span>
                  <span>{provider.awareness.getStates().size} user(s)</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Add animation keyframes */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}</style>
      </div>
    );
  },
);

CollaborativeEditor.displayName = "CollaborativeEditor";

export default CollaborativeEditor;