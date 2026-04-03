"use client";

import { useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import {
  submitDrawingComment,
  type DrawingComment,
} from "@/app/actions/drawing-comments";

interface DrawingCommentSectionProps {
  issueId: string;
  issueSlug: string;
  isLoggedIn: boolean;
  initialComments: DrawingComment[];
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

export default function DrawingCommentSection({
  issueId,
  issueSlug,
  isLoggedIn,
  initialComments,
}: DrawingCommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await submitDrawingComment({
        issueId,
        issueSlug,
        content,
      });

      if (!result.success || !result.comment) {
        setMessage(result.message);
        return;
      }

      setComments((prev) => [...prev, result.comment!]);
      setContent("");
      setMessage(result.message);
    });
  };

  return (
    <section className="mt-10 border-t border-[#D7CCC8]/40 pt-12">
      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-[#A1887F]" />
        <h2 className="font-youyou text-2xl tracking-widest text-[#3A3A3A]">
          Comments 评论区
        </h2>
      </div>

      {isLoggedIn ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-sm border border-[#EFEBE9] bg-[#FAF9F6] p-5"
        >
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="写下你的留言..."
            rows={4}
            className="w-full resize-y border border-[#E0DAD6] bg-white px-3 py-2 text-sm leading-7 focus:border-[#A1887F] focus:outline-none"
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9E9E9E]">{message}</p>
            <button
              type="submit"
              disabled={isPending}
              className="border border-[#A1887F] px-4 py-2 text-xs tracking-widest text-[#A1887F] transition-colors hover:bg-[#A1887F] hover:text-white disabled:opacity-60"
            >
              {isPending ? "发送中..." : "发送留言"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-sm border border-[#EFEBE9] bg-[#FAF9F6] p-5 text-sm text-[#8D8D8D]">
          请先点亮身份，再留下你的星火。
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {comments.length === 0 ? (
          <p className="text-sm text-[#9E9E9E] md:col-span-2">
            旷野安静，等待第一条留言。
          </p>
        ) : (
          comments.map((item, index) => (
            <article
              key={item.id}
              className={`rounded-sm border p-5 ${index % 3 === 0
                  ? "border-[#E6DDD5] bg-[#F4EFEA]"
                  : index % 3 === 1
                    ? "border-[#DDE3DA] bg-[#EEF1ED]"
                    : "border-[#DCE0E8] bg-[#EEF0F4]"
                }`}
            >
              <div className="mb-3 space-y-2 text-xs text-[#9E9E9E]">
                <p className="text-[11px] leading-relaxed text-[#6A6A6A]">
                  点亮者
                </p>
                <p>{formatDate(item.createdAt)}</p>
              </div>
              <p className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-[#3A3A3A]">
                {item.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
