
import React, { useState, useEffect, useMemo } from "react";
import ProfSidebar from "../../component/profsidebar";
import { useNavigate, useParams } from "react-router";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { useFile } from "../../../contexts/file/fileContextProvider";

const ViewFilePage = () => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const navigate = useNavigate();
  const { resources } = useFile();

  /* ROUTE PARAMS */
  const { file_name, file_uuid, orig_file_name, file_id } = useParams();
  const fileName = file_name || orig_file_name;
  const fileUuid = file_uuid || file_id;
  const decodedFileName = decodeURIComponent(fileName || "");

  const file = useMemo(() => {
    return resources?.find(
      (resource) => resource.file_id === Number(fileUuid)
    );
  }, [resources, fileUuid]);

  /* STATES */
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState("binary");
  const [content, setContent] = useState("");
  const [zoomed, setZoomed] = useState(false);

  /* EXTENSIONS */
  const imageExt = ["jpg","jpeg","png","gif","webp","bmp","svg"];
  const textExt = ["txt","js","json","md","html","css","py","php","sql"];
  const docExt = ["doc","docx","ppt","pptx"];
  const excelExt = ["xls","xlsx"];

  /* DETECT FILE TYPE */
  useEffect(() => {
    if (!file) {
      setIsLoading(false);
      return;
    }

    const extension = file.file_name?.split(".").pop()?.toLowerCase();

    if (imageExt.includes(extension)) {
      setFileType("image");
    } else if (extension === "pdf") {
      setFileType("pdf");
    } else if (excelExt.includes(extension)) {
      setFileType("excel");
    } else if (docExt.includes(extension)) {
      setFileType("office");
    } else if (textExt.includes(extension)) {
      setFileType("text");

      fetch(file.file_url)
        .then((r) => r.text())
        .then((t) => setContent(t))
        .catch(() => setError("Failed to load text file."));
    } else {
      setFileType("binary");
    }

    setIsLoading(false);
  }, [file]);

  /* VIEWER URLS */
  const googleViewerUrl = file?.file_url
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(file.file_url)}&embedded=true`
    : "";

  const excelViewerUrl = file?.file_url
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url)}`
    : "";

  /* UI */
  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      <div className="hidden lg:block">
        <ProfSidebar />
      </div>

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

          {isLoading && (
            <div className="text-center p-10">
              <p>Loading file...</p>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {/* IMAGE */}
          {!isLoading && fileType === "image" && file?.file_url && (
            <>
              <div className="flex justify-center">
                <img
                  src={file.file_url}
                  alt={decodedFileName}
                  className="max-h-[70vh] cursor-zoom-in"
                  onClick={() => setZoomed(true)}
                />
              </div>

              {zoomed && (
                <div
                  className="fixed inset-0 bg-black/90 flex items-center justify-center"
                  onClick={() => setZoomed(false)}
                >
                  <img
                    src={file.file_url}
                    className="max-w-[90%] max-h-[90%]"
                  />
                </div>
              )}
            </>
          )}

          {/* PDF */}
          {!isLoading && fileType === "pdf" && file?.file_url && (
            <iframe
              src={file.file_url}
              width="100%"
              height="800"
              title="PDF Viewer"
            />
          )}

          {/* EXCEL */}
          {!isLoading && fileType === "excel" && (
            <iframe
              src={excelViewerUrl}
              width="100%"
              height="800"
              title="Excel Viewer"
            />
          )}

          {/* DOC / PPT */}
          {!isLoading && fileType === "office" && (
            <iframe
              src={googleViewerUrl}
              width="100%"
              height="800"
              title="Office Viewer"
            />
          )}

          {/* TEXT */}
          {!isLoading && fileType === "text" && (
            <pre className="p-4 overflow-x-auto">{content}</pre>
          )}

          {/* OTHER */}
          {!isLoading && fileType === "binary" && file?.file_url && (
            <button
              onClick={() => window.open(file.file_url)}
              className="underline"
            >
              Download / Open File
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewFilePage;
