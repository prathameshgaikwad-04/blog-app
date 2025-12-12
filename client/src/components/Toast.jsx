// client/src/components/Toast.jsx
import React, { useEffect, useState } from "react";

export default function Toast({ message, type = "success", duration = 2500, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration - 300);
    const removeTimer = setTimeout(() => onClose?.(), duration);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`toast toast-${type} ${visible ? "toast-in" : "toast-out"}`}
      role="alert"
    >
      {message}
    </div>
  );
}
