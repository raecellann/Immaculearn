import React, { useState, useRef, useEffect, useMemo } from "react";
import ProfSidebar from "../../component/profsidebar";
import { useNavigate, useParams } from "react-router";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { useFile } from "../../../contexts/file/fileContextProvider";

const ViewFilePage = () => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const navigate = useNavigate();
  const { resources } = useFile();

  /* ================= ROUTE PARAMS ================= */

  const { file_name, file_uuid, orig_file_name, file_id } = useParams();
  const fileName = file_name || orig_file_name;
  const fileUuid = file_uuid || file_id;

  const decodedFileName = decodeURIComponent(fileName || "");

  const file = useMemo(() => {
    return resources?.find(
      (resource) => resource.file_id === parseInt(fileUuid)
    );
  }, [resources, fileUuid]);

  /* ================= STATES ================= */

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState("text"); // text | image | binary
  const [content, setContent] = useState("");
  const [zoomed, setZoomed] = useState(false);

  /* ================= FETCH FILE ================= */

  useEffect(() => {
    const fetchFile = async () => {
      if (!file) {
        setError("File not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(file.file_url);

        if (!response.ok) {
          throw new Error("Failed to fetch file.");
        }

        const contentType = response.headers.get("content-type");
        const fileExtension = file.file_name
          ?.split(".")
          .pop()
          ?.toLowerCase();

        /* ================= IMAGE HANDLING ================= */
        if (
          contentType?.startsWith("image/") ||
          ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
            fileExtension
          )
        ) {
          setFileType("image");
          setIsLoading(false);
          return;
        }

        /* ================= TEXT HANDLING ================= */
        if (
          contentType?.includes("text") ||
          contentType?.includes("json") ||
          contentType?.includes("javascript") ||
          contentType?.includes("xml") ||
          ["txt", "js", "json", "md", "html", "css", "py", "php", "sql"].includes(
            fileExtension
          )
        ) {
          const text = await response.text();
          setContent(text);
          setFileType("text");
          setIsLoading(false);
          return;
        }

        /* ================= BINARY FALLBACK ================= */
        setFileType("binary");
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load file.");
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [file]);

  /* ================= UI ================= */

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* SIDEBAR */}
      <div className="hidden lg:block">
        <ProfSidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm underline"
          style={{ color: currentColors.primary }}
        >
          ← Back
        </button>

        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: currentColors.surface,
            border: `1px solid ${currentColors.border}`,
          }}
        >
          <h1 className="text-2xl font-bold mb-4">{decodedFileName}</h1>

          {/* ================= LOADING ================= */}
          {isLoading && (
            <div className="text-center p-10">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4 rounded-full"></div>
              <p style={{ color: currentColors.textSecondary }}>
                Loading file...
              </p>
            </div>
          )}

          {/* ================= ERROR ================= */}
          {error && (
            <div className="text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* ================= IMAGE VIEWER ================= */}
          {!isLoading && !error && fileType === "image" && (
            <>
              <div className="flex justify-center">
                <img
                  src={file.file_url}
                  alt={decodedFileName}
                  onClick={() => setZoomed(true)}
                  className="max-w-full max-h-[70vh] rounded shadow-lg cursor-zoom-in transition hover:scale-105"
                />
              </div>

              {zoomed && (
                <div
                  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                  onClick={() => setZoomed(false)}
                >
                  <img
                    src={file.file_url}
                    alt={decodedFileName}
                    className="max-w-[90%] max-h-[90%] rounded"
                  />
                </div>
              )}
            </>
          )}

          {/* ================= TEXT VIEWER ================= */}
          {!isLoading && !error && fileType === "text" && (
            <div
              className="p-4 rounded font-mono text-sm overflow-x-auto whitespace-pre-wrap"
              style={{
                backgroundColor: currentColors.background,
                border: `1px solid ${currentColors.border}`,
                minHeight: "200px",
              }}
            >
              {content || "Empty file."}
            </div>
          )}

          {/* ================= BINARY ================= */}
          {!isLoading && !error && fileType === "binary" && (
            <div
              className="p-4 rounded"
              style={{
                backgroundColor: currentColors.background,
                border: `1px solid ${currentColors.border}`,
              }}
            >
              <p>This file cannot be previewed.</p>
              <button
                onClick={() => window.open(file.file_url, "_blank")}
                className="mt-3 underline text-sm"
                style={{ color: currentColors.primary }}
              >
                Download / Open File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFilePage;