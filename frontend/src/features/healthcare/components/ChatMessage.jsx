import { Bot, UserRound } from "lucide-react";

const formatMessageTime = (createdAt) =>
  new Date(createdAt).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

const ChatMessage = ({ message, isTyping = false }) => {
  const isPatientMessage = message?.sender === "patient";

  return (
    <div className={`flex gap-3 ${isPatientMessage ? "justify-end" : "justify-start"}`}>
      {!isPatientMessage && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Bot size={19} />
        </div>
      )}

      <div className={`max-w-[82%] ${isPatientMessage ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isPatientMessage
              ? "rounded-tr-md bg-emerald-700 text-white"
              : "rounded-tl-md border border-slate-100 bg-white text-slate-700"
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 px-1 py-1" aria-label="MediKiosk is typing">
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          )}
        </div>

        {!isTyping && (
          <p className={`mt-1 text-xs text-slate-400 ${isPatientMessage ? "text-right" : "text-left"}`}>
            {isPatientMessage ? "You" : "MediKiosk"} · {formatMessageTime(message.createdAt)}
          </p>
        )}
      </div>

      {isPatientMessage && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <UserRound size={19} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
