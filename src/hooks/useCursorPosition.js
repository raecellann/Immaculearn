import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for tracking and syncing cursor position in collaborative editing
 * @param {Object} editor - TipTap editor instance
 * @param {Object} provider - Yjs WebSocket provider
 * @param {string} userId - Current user's ID
 * @returns {Object} Cursor position data and update function
 */
export function useCursorPosition(editor, provider, userId) {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selection, setSelection] = useState({ from: 0, to: 0 });
  const lastUpdateRef = useRef(0);
  const updateThrottle = 100; // Update every 100ms max

  // Update local cursor position in awareness
  const updateCursorPosition = useCallback((pos, selectionRange) => {
    if (!provider?.awareness || !editor) return;
    
    // Throttle updates to avoid overwhelming the network
    const now = Date.now();
    if (now - lastUpdateRef.current < updateThrottle) {
      return;
    }
    lastUpdateRef.current = now;

    try {
      setCursorPosition(pos);
      if (selectionRange) {
        setSelection(selectionRange);
      }

      // Get current user state
      const currentUser = provider.awareness.getLocalState()?.user;
      
      if (!currentUser) {
        console.warn('No user state found in awareness');
        return;
      }

      // Update awareness with new cursor position
      provider.awareness.setLocalStateField('user', {
        ...currentUser,
        cursor: {
          anchor: selectionRange?.from || pos,
          head: selectionRange?.to || pos,
          timestamp: now,
        }
      });

      console.log('Cursor updated:', {
        pos,
        selection: selectionRange,
        user: currentUser.name
      });
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }, [provider, editor]);

  // Listen to editor selection changes
  useEffect(() => {
    if (!editor) {
      console.log('Editor not available for cursor tracking');
      return;
    }

    const handleSelectionUpdate = ({ editor: currentEditor }) => {
      try {
        const { from, to } = currentEditor.state.selection;
        const pos = currentEditor.state.selection.$anchor.pos;
        
        updateCursorPosition(pos, { from, to });
      } catch (error) {
        console.error('Error in selection update handler:', error);
      }
    };

    const handleTransaction = ({ editor: currentEditor, transaction }) => {
      // Only update if selection changed
      if (!transaction.selectionSet) return;
      
      try {
        const { from, to } = currentEditor.state.selection;
        const pos = currentEditor.state.selection.$anchor.pos;
        
        updateCursorPosition(pos, { from, to });
      } catch (error) {
        console.error('Error in transaction handler:', error);
      }
    };

    // Listen to both selection updates and transactions
    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleTransaction);

    // Initial cursor position
    try {
      const { from, to } = editor.state.selection;
      const pos = editor.state.selection.$anchor.pos;
      updateCursorPosition(pos, { from, to });
    } catch (error) {
      console.error('Error getting initial cursor position:', error);
    }

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleTransaction);
    };
  }, [editor, updateCursorPosition]);

  // Listen to awareness changes to track other users' cursors
  useEffect(() => {
    if (!provider?.awareness) return;

    const handleAwarenessChange = () => {
      try {
        const states = Array.from(provider.awareness.getStates().entries());
        const otherUsers = states
          .filter(([clientId]) => clientId !== provider.awareness.clientID)
          .map(([clientId, state]) => ({
            clientId,
            user: state.user,
            cursor: state.user?.cursor,
          }))
          .filter(u => u.user && u.cursor);

        console.log('Other users cursors:', otherUsers);
      } catch (error) {
        console.error('Error handling awareness change:', error);
      }
    };

    provider.awareness.on('change', handleAwarenessChange);
    provider.awareness.on('update', handleAwarenessChange);

    return () => {
      provider.awareness.off('change', handleAwarenessChange);
      provider.awareness.off('update', handleAwarenessChange);
    };
  }, [provider, userId]);

  return { 
    cursorPosition, 
    selection, 
    updateCursorPosition 
  };
}