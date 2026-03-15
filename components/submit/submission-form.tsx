"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { submitManuscript } from "@/app/actions/submissions";

const MAX_FILE_SIZE_LABEL = "4.5MB";
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.md";
const SUBMISSION_EMAIL = "xinghuo0308@outlook.com";

export default function SubmissionForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("manuscript");

    if (file instanceof File && file.size > 4.5 * 1024 * 1024) {
      setMessage(`稿件文件不能超过 ${MAX_FILE_SIZE_LABEL}。`);
      setIsError(true);
      setLoading(false);
      return;
    }

    const result = await submitManuscript(formData);
    setMessage(result.message);
    setIsError(!result.success);

    if (result.success) {
      form.reset();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
            作者
          </label>
          <input
            type="text"
            name="author"
            required
            className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
            placeholder="笔名或署名"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
            联系邮箱
          </label>
          <input
            type="email"
            name="contactEmail"
            required
            className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
            标题
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
            placeholder="稿件标题"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
            栏目
          </label>
          <select
            name="category"
            required
            className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
            defaultValue=""
          >
            <option value="" disabled>
              请选择栏目
            </option>
            <option value="有话慢谈">有话慢谈</option>
            <option value="人间剧场">人间剧场</option>
            <option value="胡说八道">胡说八道</option>
            <option value="三行两句">三行两句</option>
            <option value="见字如面">见字如面</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
          简短描述
        </label>
        <textarea
          name="description"
          required
          rows={5}
          className="w-full rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
          placeholder="简单介绍这篇稿件的主题、背景或你想表达的内容。"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
          上传稿件
        </label>
        <input
          type="file"
          name="manuscript"
          required
          accept={ACCEPTED_FILE_TYPES}
          className="block w-full rounded-xl border border-dashed border-[#D7CCC8] bg-white px-4 py-4 text-sm text-[#5D5D5D] file:mr-4 file:rounded-full file:border-0 file:bg-[#3A3A3A] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-[#2A2A2A]"
        />
        <p className="mt-2 text-sm text-[#8D8D8D]">
          最大 {MAX_FILE_SIZE_LABEL}。如果超过 {MAX_FILE_SIZE_LABEL}，请发送到我们的邮箱：
          <a
            href={`mailto:${SUBMISSION_EMAIL}`}
            className="ml-1 text-[#A1887F] transition-colors hover:text-[#8D6E63]"
          >
            {SUBMISSION_EMAIL}
          </a>
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-youyou ${
            isError
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-green-100 bg-green-50 text-green-600"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-[#3A3A3A] px-6 py-3 text-sm text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span className="font-youyou">{loading ? "提交中..." : "提交稿件"}</span>
      </button>
    </form>
  );
}
