// src/components/CustomQuillEditor.jsx
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const CustomQuillEditor = forwardRef(({
  value = '',
  onChange,
  onSelectionChange,
  readOnly = false,
  placeholder = 'Start typing...',
  className = '',
  style = {},
  toolbarOptions = null,
  modules = {},
  formats = [],
  ...props
}, ref) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const containerRef = useRef(null);

  // Default toolbar
  const defaultToolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ];

  // Default modules
  const defaultModules = {
    toolbar: toolbarOptions || defaultToolbarOptions,
    clipboard: {
      matchVisual: false,
    },
    ...modules
  };

  // Default formats
  const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'script',
    'direction',
    'size',
    'color', 'background',
    'font',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    ...formats
  ];

  // Initialize Quill
  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    // Create Quill instance
    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      modules: defaultModules,
      formats: defaultFormats,
      placeholder,
      readOnly,
    });

    quillRef.current = quill;

    // Set initial value
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // Handle text changes
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user' && onChange) {
        const html = containerRef.current.querySelector('.ql-editor').innerHTML;
        onChange(html, delta, source, quill);
      }
    });

    // Handle selection changes
    quill.on('selection-change', (range, oldRange, source) => {
      if (onSelectionChange) {
        onSelectionChange(range, oldRange, source, quill);
      }
    });

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current.off('selection-change');
      }
    };
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (!quillRef.current || !value) return;

    const currentHtml = containerRef.current?.querySelector('.ql-editor')?.innerHTML;
    if (currentHtml !== value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  // Update readOnly
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current,
    getContent: () => quillRef.current?.root.innerHTML || '',
    getText: () => quillRef.current?.getText() || '',
    getSelection: () => quillRef.current?.getSelection(),
    focus: () => quillRef.current?.focus(),
    blur: () => quillRef.current?.blur(),
    insertText: (index, text, formats = {}) => quillRef.current?.insertText(index, text, formats),
    insertEmbed: (index, type, value) => quillRef.current?.insertEmbed(index, type, value),
    formatText: (range, formats) => quillRef.current?.formatText(range, formats),
    formatLine: (range, formats) => quillRef.current?.formatLine(range, formats),
    deleteText: (range) => quillRef.current?.deleteText(range),
  }));

  return (
    <div 
      ref={editorRef}
      className={`custom-quill-editor ${className}`}
      style={style}
    >
      <div ref={containerRef}></div>
    </div>
  );
});

CustomQuillEditor.displayName = 'CustomQuillEditor';

export default CustomQuillEditor;