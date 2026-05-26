import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notif, setNotif] = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setNotif({ msg, type, id: Date.now() });
    setTimeout(() => setNotif(null), 3500);
  }, []);

  return (
    <NotificationContext.Provider value={{ notif, notify }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
