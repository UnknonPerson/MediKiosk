import { useState } from "react";
import { Send } from "lucide-react";

import Button from "../../../components/ui/button/Button";

const ChatInput = ({ onSend, disabled, isSending }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim() || disabled || isSending) {
      return;
    }

    await onSend(message);
    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <label className="sr-only" htmlFor="modern-health-message">
        Describe what you would like to share
      </label>
      <textarea
        id="modern-health-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
        rows="1"
        placeholder="Type your response..."
        className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled || isSending}
        aria-label="Send message"
        className="h-11 w-11 shrink-0 px-0"
      >
        <Send size={18} />
      </Button>
    </form>
  );
};

export default ChatInput;
