import React, { useState } from "react";
import {
  Menu,
  Send,
  Plus,
  Search,
  User,
  Moon,
  Sun
} from "lucide-react";

export default function AIChat() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-zinc-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <aside className="w-72 border-r border-zinc-700 flex flex-col">
        <div className="p-4 text-xl font-bold">Artistry Smart AI</div>

        <button className="mx-4 mb-4 bg-blue-600 rounded-lg p-3 hover:bg-blue-700">
          <Plus className="inline mr-2" />
          New Chat
        </button>

        <div className="px-4">
          <div className="flex items-center bg-zinc-800 rounded-lg px-3 py-2">
            <Search size={18} />
            <input
              placeholder="Search chats..."
              className="bg-transparent outline-none ml-2 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="p-3 rounded-lg hover:bg-zinc-800 cursor-pointer">
            New Conversation
          </div>
        </div>

        <div className="p-4 border-t border-zinc-700 flex justify-between items-center">
          <User />
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun /> : <Moon />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-zinc-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Menu />
            <h2 className="font-bold text-lg">AI Chat</h2>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="bg-blue-600 rounded-xl p-4 w-fit max-w-xl">
            Hello 👋
          </div>

          <div className="bg-zinc-800 rounded-xl p-4 w-fit max-w-xl">
            Welcome to Artistry Smart AI.
          </div>
        </div>

        <div className="border-t border-zinc-700 p-4">
          <div className="flex gap-3">
            <textarea
              rows={2}
              className="flex-1 rounded-lg bg-zinc-800 p-3 outline-none resize-none"
              placeholder="Ask anything..."
            />
            <button className="bg-blue-600 px-5 rounded-lg hover:bg-blue-700">
              <Send />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
