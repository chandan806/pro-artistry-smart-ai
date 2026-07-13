// Chat logic snippet for AIChat.tsx

import React, { useState, useRef, useEffect } from "react";

const [input, setInput] = useState("");

const [messages, setMessages] = useState([
  {
    role: "assistant",
    content: "👋 Welcome to Artistry Smart AI.",
  },
]);

const [loading, setLoading] = useState(false);

const chatEndRef = useRef<HTMLDivElement>(null);

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = {
    role: "user",
    content: input,
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setLoading(true);

  setTimeout(() => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "This is a demo response. API will be connected in Part 3.",
      },
    ]);
    setLoading(false);
  }, 1000);
};

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>
) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
