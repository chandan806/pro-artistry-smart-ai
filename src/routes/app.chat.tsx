import { createFileRoute } from "@tanstack/react-router";
import ChatWorkspace from "@/components/ChatWorkspace";

export const Route = createFileRoute("/app/chat")({
  ssr: false,
  component: ChatPage,
});

function ChatPage() {
  return <ChatWorkspace />;
}
