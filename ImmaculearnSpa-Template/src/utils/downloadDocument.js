export const downloadDocument = (format, setIsDownloadDropdownOpen, editorRef) => {
    const content = editorRef.current?.innerText || '';
    const title = title || 'Document';
    
    if (format === 'txt') {
      // Download as text file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'html') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: ${selectedFont}, Arial, sans-serif; line-height: 1.5; }
            @page { size: ${paperSizes[selectedPaperSize].width} ${paperSizes[selectedPaperSize].height}; margin: ${marginOptions[selectedMargin].top} ${marginOptions[selectedMargin].right} ${marginOptions[selectedMargin].bottom} ${marginOptions[selectedMargin].left}; }
          </style>
        </head>
        <body>
          ${editorRef.current?.innerHTML || ''}
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'll use window.print() as a fallback
      // In a real app, you'd use a library like jsPDF or puppeteer
      window.print();
    }
    
    setIsDownloadDropdownOpen(false);
  };