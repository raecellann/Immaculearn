// src/hooks/useYjs.js
import { useEffect, useRef, useState } from 'react';
import { yjsProvider } from '../core/yjsProvider';
import * as Y from 'yjs';

export function useYjs(roomName, options = {}) {
  const { fieldName = 'content' } = options;
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const awarenessRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!roomName) return;

    // Get Yjs provider
    const { provider, doc } = yjsProvider.getProvider(roomName);
    const yText = doc.getText(fieldName);
    textRef.current = yText;

    // Set initial text
    setText(yText.toString());

    // Observe text changes
    const observer = (event) => {
      setText(yText.toString());
      
      // Also dispatch custom event for rich text editors
      window.dispatchEvent(new CustomEvent('yjs-update', {
        detail: { roomName, text: yText.toString() }
      }));
    };
    
    yText.observe(observer);

    // Set up awareness (cursor positions, user info)
    awarenessRef.current = provider.awareness;
    
    awarenessRef.current.on('change', () => {
      const states = Array.from(awarenessRef.current.getStates().values());
      setUsers(states);
    });

    // Set user info
    awarenessRef.current.setLocalState({
      name: options.userName || 'Anonymous',
      color: options.userColor || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      cursor: null
    });

    // Monitor connection status
    provider.on('status', (event) => {
      setConnected(event.status === 'connected');
    });

    // Cleanup
    return () => {
      yText.unobserve(observer);
      if (awarenessRef.current) {
        awarenessRef.current.setLocalState(null);
      }
    };
  }, [roomName, fieldName]);

  // Function to update text
  const updateText = (newText) => {
    if (textRef.current) {
      yjsProvider.getText(roomName, fieldName).delete(0, textRef.current.length);
      yjsProvider.getText(roomName, fieldName).insert(0, newText);
    }
  };

  // Function to update cursor position
  const updateCursor = (position) => {
    if (awarenessRef.current) {
      awarenessRef.current.setLocalStateField('cursor', position);
    }
  };

  return {
    text,
    updateText,
    connected,
    users,
    updateCursor,
    getText: () => textRef.current,
    getProvider: () => yjsProvider.getProvider(roomName)
  };
}