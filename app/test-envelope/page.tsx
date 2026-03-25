"use client";

import { useState } from "react";
import SuccessLetterModal from "@/components/submit/success-letter-modal";

const SUCCESS_MODAL_CONTENT = {
  greeting: "您好！",
  paragraphs: [
    "感谢您将文字托付给《星火好看》编辑部。稿件已进入初评队列，由于全员均为志愿者，请知悉以下默契：",
    "契合本期主题的稿件，14 个自然日内会收到是否收录通知。投稿的稿件默认编辑部可简单修改，并有可能在公众号、小红书、抖音等平台发布。",
    "逾期未回复 ≠ 拒稿，稿件已存入火种库，后续有合适主题会主动联系。期待与您的再次会面。",
    "志愿者团队人力有限，无法为每一份稿件提供一对一回复，还望见谅。但请相信，我们认真读过您写下的每一个字。",
  ],
  exploreTitle: "探索《星火》的更多角落：",
  officialSiteTitle: "官方网站：",
  officialSiteText: "注册官网需邀请码，申请邀请码添加微信：",
  officialSiteWeChat: "xinghuotakan0308",
  officialSiteHint: "—— 那些文字，正等待您的共鸣",
  wechatTitle: "公众号：星火-好看",
  wechatHint: "关注并回复“加入”，进入我们的深度交流群，与更多同类一起点亮微光。",
  signature: "《星火好看》编辑部 敬上",
};

export default function TestEnvelopePage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-black text-white rounded">
        Open Envelope
      </button>
      <SuccessLetterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={SUCCESS_MODAL_CONTENT}
      />
    </div>
  );
}
