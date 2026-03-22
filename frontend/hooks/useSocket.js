import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: { token },
      });
    }
    socketRef.current = socket;

    return () => {
      // Don't disconnect on unmount — keep persistent connection
    };
  }, []);

  return socketRef;
}
