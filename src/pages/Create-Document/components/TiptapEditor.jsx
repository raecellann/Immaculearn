// components/TiptapEditor.jsx
import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

const TiptapEditor = forwardRef(({
  ydoc,
  provider,
  user,
  paperSize,
  margins,
  fontFamily,
  onUpdate,
  initialContent
}, ref) => {
  
  // Create collaboration extensions only if ydoc exists
  const getCollaborationExtensions = () => {
    if (!ydoc || !provider) return [];

    // Get ProseMirror-compatible fragment
    // const yxmlFragment = ydoc.get('prosemirror', ydoc.XmlFragment);
    const ytext = ydoc.getText('document'); // <-- Y.Text

    return [
      
      Collaboration.configure({
        document: ytext,
        field: "document"
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: user?.name || 'Anonymous',
          color: user?.color || '#3b82f6',
          avatar: user?.avatar,
        },
        render: (user) => {
          const cursor = document.createElement('span');
          cursor.classList.add('collaboration-cursor__caret');
          cursor.setAttribute('style', `border-color: ${user.color}`);

          const label = document.createElement('div');
          label.classList.add('collaboration-cursor__label');
          label.setAttribute('style', `background-color: ${user.color}`);
          label.appendChild(document.createTextNode(user.name));
          cursor.appendChild(label);

          return cursor;
        },
      }),
    ];
  };


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({ HTMLAttributes: { class: 'list-disc pl-4' } }),
      OrderedList.configure({ HTMLAttributes: { class: 'list-decimal pl-4' } }),
      ListItem,
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left','center','right','justify'] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Color,
      Placeholder.configure({ placeholder: 'Start typing here...' }),

      ...getCollaborationExtensions(), // ✅ inject collaboration extensions here

      ydoc && provider
        ? Collaboration.configure({ document: ydoc.getText("document") })
        : null,
      ydoc && provider
        ? CollaborationCursor.configure({ provider, user })
        : null,
      
    ].filter(Boolean),
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      if (!editor) return;
      onUpdate?.(editor.getHTML()); // send HTML string directly
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[500px] p-8',
        style: `
          width: ${paperSize?.width || '8.27in'};
          min-height: ${paperSize?.height || '11.69in'};
          margin-top: ${margins?.top || '1in'};
          margin-right: ${margins?.right || '1in'};
          margin-bottom: ${margins?.bottom || '1in'};
          margin-left: ${margins?.left || '1in'};
          font-family: ${fontFamily || 'Inter'}, sans-serif;
          background: white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          color: black;
        `,
      },
    },
  });

  // Helper function to update cursor position in awareness
  const updateCursorPosition = (editorInstance) => {
    if (!provider?.awareness || !editorInstance) return;
    
    try {
      const { from, to } = editorInstance.state.selection;
      const currentState = provider.awareness.getLocalState();
      
      if (currentState?.user) {
        provider.awareness.setLocalStateField('user', {
          ...currentState.user,
          cursor: {
            anchor: from,
            head: to,
          },
        });
      }
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  };

  // Sync initial content when ydoc is ready
  useEffect(() => {
    if (!editor || !ydoc) return;

    // console.log(Object.keys(editor?.commands?));


    // Wait for provider to sync before setting initial content
    if (provider) {
      const handleSync = (isSynced) => {
        if (isSynced && initialContent) {
          const ytext = ydoc.getText('document');
          // Only set content if the document is empty
          if (ytext.length === 0 && editor.isEmpty) {
            ydoc.transact(() => {
              ytext.delete(0, ytext.length);
              ytext.insert(0, initialContent);
            });
          }
        }
      };

      provider.on('sync', handleSync);
      
      // Check if already synced
      if (provider.synced && initialContent && editor.isEmpty) {
        const ytext = ydoc.getText('content');
        if (ytext.length === 0) {
          ydoc.transact(() => {
            ytext.delete(0, ytext.length);
            ytext.insert(0, initialContent);
          });
        }
      }

      return () => {
        provider.off('sync', handleSync);
      };
    }
  }, [editor, ydoc, provider, initialContent]);

  // Update user info in awareness when user prop changes
  useEffect(() => {
    if (!provider?.awareness || !user) return;

    const currentState = provider.awareness.getLocalState();
    
    provider.awareness.setLocalState({
      ...currentState,
      user: {
        id: user.id,
        name: user.name,
        color: user.color,
        avatar: user.avatar,
        cursor: currentState?.user?.cursor || null,
      },
    });

    console.log('Updated user info in awareness:', user);
  }, [provider, user?.id, user?.name, user?.color, user?.avatar]);

  // Periodically update cursor position and keep connection alive
  useEffect(() => {
    if (!editor || !provider?.awareness) return;

    const updateInterval = setInterval(() => {
      // Update cursor position
      updateCursorPosition(editor);
      
      // Keep connection alive by touching the awareness state
      const currentState = provider.awareness.getLocalState();
      if (currentState) {
        provider.awareness.setLocalState({
          ...currentState,
          _keepAlive: Date.now(), // Add timestamp to force update
        });
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(updateInterval);
  }, [editor, provider]);

  // Monitor focus state and update awareness
  useEffect(() => {
    if (!editor || !provider?.awareness) return;

    const handleFocus = () => {
      const currentState = provider.awareness.getLocalState();
      if (currentState?.user) {
        provider.awareness.setLocalStateField('user', {
          ...currentState.user,
          focused: true,
        });
      }
      updateCursorPosition(editor);
    };

    const handleBlur = () => {
      const currentState = provider.awareness.getLocalState();
      if (currentState?.user) {
        provider.awareness.setLocalStateField('user', {
          ...currentState.user,
          focused: false,
        });
      }
    };

    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, [editor, provider]);

  useEffect(() => {
    // if (!editor || !initialContent) return;

    console.log(editor?.getHTML())

    // Only set initial content if editor is empty
    if (editor?.isEmpty) {
      editor?.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  



  // Expose editor methods to parent component
  useImperativeHandle(ref, () => {
    if (!editor) {
      return {
        getHTML: () => '',
        getText: () => '',
        getJSON: () => ({}),
        getCursorPosition: () => 0,
        getSelection: () => ({ from: 0, to: 0 }),
        setCursorPosition: () => {},
        chain: () => ({ focus: () => ({ toggleBold: () => ({ run: () => {} }) }) }),
        focus: () => {},
        insertAtPosition: () => false,
        isActive: () => false,
        setContent: () => {},
        clearContent: () => {},
        destroy: () => {},
      };
    }

    return {
      // Basic editor methods
      getHTML: () => editor.getHTML(),
      getText: () => editor.getText(),
      getJSON: () => editor.getJSON(),
      getCursorPosition: () => {
        try {
          return editor.state.selection.$anchor.pos;
        } catch {
          return 0;
        }
      },
      getSelection: () => {
        try {
          return editor.state.selection;
        } catch {
          return { from: 0, to: 0 };
        }
      },
      setCursorPosition: (pos) => {
        try {
          editor?.commands?.setTextSelection(pos);
          editor?.commands?.focus();
          updateCursorPosition(editor);
        } catch (error) {
          console.error('Error setting cursor position:', error);
        }
      },
      
      // TipTap chain API
      chain: () => editor.chain(),
      focus: () => {
        editor?.commands?.focus();
        updateCursorPosition(editor);
      },
      isActive: (type, attributes) => {
        try {
          return editor.isActive(type, attributes);
        } catch {
          return false;
        }
      },
      
      // Insert/Replace methods
      insertAtPosition: (text, position, replaceLength = 0) => {
        try {
          editor?.commands?.focus();
          
          if (replaceLength > 0) {
            editor?.commands?.deleteRange({
              from: position,
              to: position + replaceLength,
            });
          }
          
          editor?.commands?.insertContentAt(position, text);
          updateCursorPosition(editor);
          return true;
        } catch (error) {
          console.error('Error inserting text:', error);
          return false;
        }
      },
      
      // Content methods
      setContent: (content) => {
        try {
          editor?.commands?.setContent(content);
          updateCursorPosition(editor);
        } catch (error) {
          console.error('Error setting content:', error);
        }
      },
      clearContent: () => {
        try {
          editor?.commands?.clearContent();
          updateCursorPosition(editor);
        } catch (error) {
          console.error('Error clearing content:', error);
        }
      },
      
      // Yjs integration methods
      getYDoc: () => ydoc,
      getProvider: () => provider,
      isCollaborating: () => !!ydoc && !!provider,
      
      // Manual awareness update
      updateAwareness: () => updateCursorPosition(editor),
      
      // Editor instance (for debugging)
      _editor: editor,
      
      // Cleanup
      destroy: () => {
        try {
          editor.destroy();
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, [editor, ydoc, provider]);
  

  return (
    <div className="w-full max-w-7xl">
      <style>{`
        .collaboration-cursor__caret {
          position: relative;
          margin-left: -1px;
          margin-right: -1px;
          border-left: 1px solid #0d0d0d;
          border-right: 1px solid #0d0d0d;
          word-break: normal;
          pointer-events: none;
        }

        .collaboration-cursor__label {
          position: absolute;
          top: -1.4em;
          left: -1px;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          user-select: none;
          color: #fff;
          padding: 0.1rem 0.3rem;
          border-radius: 3px 3px 3px 0;
          white-space: nowrap;
        }

        .ProseMirror {
          position: relative;
        }

        .ProseMirror-focused {
          outline: none;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;