import { createFileRoute } from "@tanstack/react-router";
import ChatWorkspace from "@/components/ChatWorkspace";

export const Route = createFileRoute("/app/thread/$threadId")({
  ssr: false,
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  return <ChatWorkspace routeThreadId={threadId} />;
}