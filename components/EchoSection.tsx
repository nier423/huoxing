"use client";

import { useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { submitEcho, type Echo } from "@/app/actions/echoes";

interface EchoSectionProps {
  articleId: string;
  isLoggedIn: boolean;
  initialEchoes: Echo[];
}

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function EchoSection({
  articleId,
  isLoggedIn,
  initialEchoes,
}: EchoSectionProps) {
  const [echoes, setEchoes] = useState(initialEchoes);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await submitEcho({
        articleId,
        content,
      });

      if (!result.success || !result.echo) {
        setMessage(result.message);
        return;
      }

      setEchoes((prev) => [...prev, result.echo!]);
      setContent("");
      setMessage("回音发送成功");
    });
  };

  return (
    <section className="mt-20 border-t border-[#D7CCC8]/40 pt-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-[#A1887F]" />
        <h2 className="font-youyou text-2xl text-[#3A3A3A] tracking-widest">Echoes 回响</h2>
      </div>

      {isLoggedIn ? (
        <form onSubmit={onSubmit} className="bg-[#FAF9F6] border border-[#EFEBE9] p-5 rounded-sm space-y-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="写下你的回音..."
            rows={4}
            className="w-full border border-[#E0DAD6] bg-white px-3 py-2 text-sm leading-7 focus:outline-none focus:border-[#A1887F] resize-y"
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9E9E9E]">{message}</p>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-xs tracking-widest border border-[#A1887F] text-[#A1887F] hover:bg-[#A1887F] hover:text-white transition-colors disabled:opacity-60"
            >
              {isPending ? "发送中..." : "发送回音"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#FAF9F6] border border-[#EFEBE9] p-5 rounded-sm text-sm text-[#8D8D8D]">
          请先点亮身份，再留下你的星火。
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {echoes.length === 0 ? (
          <p className="text-sm text-[#9E9E9E] md:col-span-2">旷野安静，等待第一声回响。</p>
        ) : (
          echoes.map((echo, index) => (
            <article
              key={echo.id}
              className={`border p-5 rounded-sm ${
                index % 3 === 0
                  ? "bg-[#F4EFEA] border-[#E6DDD5]"
                  : index % 3 === 1
                    ? "bg-[#EEF1ED] border-[#DDE3DA]"
                    : "bg-[#EEF0F4] border-[#DCE0E8]"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#9E9E9E] mb-3">
                <span>点亮者</span>
                <span>{formatDate(echo.createdAt)}</span>
              </div>
              <p className="font-serif text-[#3A3A3A] leading-7 text-[15px] whitespace-pre-wrap">
                {echo.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
