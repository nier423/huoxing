"use client";

import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const articles: Record<string, { title: string; author: string; date: string; content: string }> = {
  "bingchengxiadefuyu": {
    title: "冰层下的浮鱼",
    author: "Cee养花养鸟中",
    date: "2026.03.08",
    content: `
      <p>从小奶奶就和我说，你父亲爱你。</p>
      <p>那时是我又一次和父亲吵架完，躲在奶奶家避风头。</p>
      <p>她是个普通的东北农村老太太，年轻时候经历些风雨，年老时也很要强。</p>
      <p>她就像个普通老人一样絮絮叨叨为我父亲说好话。说他的辛苦，说他在我年幼时带着我去逛街，骑大马，被我挠破了脸也笑着不在意。</p>
      <p>我听着，眼里流出眼泪。</p>
      <p>我本是从家里躲到车里，但东北的冬天太冷了，我不知道还能去哪里过夜，就只能默默听。</p>
      <p>听完，等彼此消气，我还是要回家。</p>
      <p>那里已经很平静了，看不出吵过架。爸笑呵呵，妈打圆场。</p>
      <p>妈说一吵架就是世界大战，她也烦。</p>
      <p>我也烦。</p>
      <p>我妹也烦。</p>
      <p>可我还是要吵，似乎我也觉得，不吵不能活下去。</p>
      <p>妈让我躲着他，这家里的大少爷，家里喜怒不定的人，我总从别人口中听到他的爱。从电话里，从面对面，从爷奶、叔婶、姑姑和妈的口口相传，长大后连妹妹也说，可我找它不见。</p>
      <p>我见得分明是斥责，打骂，是嘲笑和谴责。这爱拷问着我的良心，让我在生前就下了地狱，被油锅煎炸。</p>
      <p>我不知道那爱是多厚重，无形无迹，令我胆颤心惊，夜不安寝，噩梦连连。</p>
      <p>如果那爱是水，我可能已经是一具浮尸。</p>
      <p>一具可笑的浮尸。</p>
      <p>父的爱是这样的东西嘛？让人恐惧。</p>
      <p>成年后，我与家人分隔在中国的两极。</p>
      <p>“南极”没有爱，但打捞了我这具浮尸上岸。我如同冬天冰下的鱼，终于找到了一个含有氧气的气泡。</p>
      <p>这气泡浮沉。</p>
      <p>又过了几年，我就如同每个背井离乡的女人一样，开始学会了“谅解”。</p>
      <p>这几年里妈妈不烦了，妹妹也不烦了。这时烦得另有其人。</p>
      <p>这鱼吸了氧，有力气游动。</p>
      <p>我便开始过年回家。</p>
      <p>又一次过年，回到老家。我和曾经的避风港促膝长谈。奶奶没再说起父爱，她谈到她的父亲。</p>
      <p>她年轻时是一把好手，刚好赶上那十年，她那么出色，又是在东北。曾经有好多个一飞冲天的机会。</p>
      <p>可她的父亲总是在怕，怕机会，怕名声，怕被抓进牛棚。</p>
      <p>怕那些她拼尽全力争抢来的东西，被他轻飘飘地放弃。</p>
      <p>于是机会就像是小鸟一样也轻飘飘地飞走了，纷纷扬扬，就像是一场经年的大雪，烂进泥巴。</p>
      <p>奶奶成了熟人嘴里的一声声叹息，成了一个有些伛偻的，东北农村的有点要强的老太太。</p>
      <p>“后悔嘛？”我问她。</p>
      <p>奶奶也叹息，过往的岁月化开，也如雪一样烂进泥巴里。</p>
      <p>“抓住机会，别再听别人的，也别听你爸的。”她说。</p>
      <p>也许她是对自己说。</p>
      <p>我看着她的眼睛，看见了她的孙女，而不是她儿子的女儿。</p>
      <p>她没再说爸爸爱我。</p>
      <p>也许是放弃了。</p>
    `,
  },
  "weishuochukoudexin": {
    title: "未说出口的信",
    author: "希希大王",
    date: "2026.03.08",
    content: `
      <p>我总在傍晚停在巷口那棵梧桐树下，看风卷着半黄的叶子擦过灰墙。风里裹着隔壁糖炒栗子的香，混着老墙根青苔的潮意，还有远处放学孩子跑过时带起的碎笑声。这些感觉在我心里拧成一团，像浸了温茶的棉花，软乎乎又沉甸甸。朋友凑过来问：“你在看什么呀？”我张了张嘴，最终只吐出一句：“没什么，风挺舒服的。”</p>
      <p>其实我想说，梧桐叶的影子落在地上，像奶奶缝衣服时掉的碎线头，旧旧的却很暖；晚霞是被谁打翻的橘子酱，沿着天边淌开，连墙根的砖都染成了蜜色。可这些话在舌头上打了个转，就又咽了回去——我找不到合适的词，怕说出来就变了味，像把精心叠的纸鹤拆开，只剩一堆皱巴巴的纸。</p>
      <p>楼下修鞋的李爷爷总坐在小马扎上，指尖的茧子厚得像老树皮，补鞋的针脚却细得像蚂蚁爬过的痕迹。有次我蹲在旁边看他补一双破了头的帆布鞋，鞋舌洗得发白，鞋底却沾着新泥，想来是某个学生舍不得丢的旧物。爷爷把线穿进针孔时，老花镜滑到鼻尖，他皱着眉用指尖推回去，阳光落在银白的发梢上，亮得像撒了碎钻。</p>
      <p>“爷爷，您补鞋多久啦？”我问。他抬头笑：“四十多年啦，这手艺，舍不得丢。”我心里忽然涌上来好多话——关于时间磨出来的踏实，关于旧物里藏着的牵挂，关于“舍得”两个字里的重量，可我只憋出一句：“您补的鞋，肯定很结实。”爷爷挥挥手应着，我看着他低头穿针的侧脸，心里像被软东西撞了一下，却没法说清那是敬佩还是心疼，只能默默递给他一瓶冰矿泉水。</p>
      <p>我总这样，心里装着一肚子的“小细节”：雨后的柏油路像泼了墨，却又映着路灯的光，像碎了的银河；流浪猫趴在车盖上晒太阳，尾巴尖偶尔抖一下，像在跟风打招呼；妈妈煮的银耳汤凉了，结的那层膜软得像云朵的皮肤。可这些，我从来都没能好好说给别人听。</p>
      <p>有时候会羡慕那些能口若悬河的人，他们能把一场雨写成诗，把一片云说成画。而我只能站在旁边，心里翻江倒海，嘴上却平淡无奇。但后来我慢慢发现，那些没说出口的感受，并没有消失。它们变成了我镜头里模糊的晚霞，变成了笔记本上画满的梧桐叶，变成了我给流浪猫的猫粮——虽然简单，却是我心里最真的温度。</p>
      <p>风又吹过梧桐叶，沙沙作响。我掏出手机拍了张照片，相册里已经存了几百张这样的“无意义”风景。翻遍通讯录，好像没人能立刻懂这些照片里的情绪。于是我编辑文案，删了又写，写了又删，最后只发了一个句号。</p>
      <p>没关系，那些拙于表达的感受，已经悄悄种在了我的心里。就像巷口的梧桐，不用开口，每片叶子的起落，都在说“秋天来了”；每阵风吹过的声响，都在讲“我在这儿呢”。而我那些藏在心里的、没说出口的话，也会像这些叶子，在某个不经意的瞬间，轻轻落在懂的人心里。</p>
    `,
  },
  "muaishenhua": {
    title: "母爱神话",
    author: "MOF-808",
    date: "2026.03.08",
    content: `
      <p>我有三个侄儿。</p>
      <p>我喜欢听祂们的呼喊，平日里软糯糯的音调慢吞吞地从喉咙伸了个懒腰才出来，急起来声母和韵母又前脚踩着后脚抢着往外跑，笑声和逻辑一样混乱无序，在小小的房间到处碰撞。</p>
      <p>忙碌时祂们会像萝卜糕被安放在电视机前面，认真地解读这个世界的语言，正如我们平时去分析祂们的婴语。</p>
      <p>我躺在床上听祂们流淌出自由又老道的呼噜声，像是期待一场惊蛰。睡醒后我伸进外套的袖子，穿针引线一样牵过他们的胳膊，扣上扣子，套好袜子，这时祂们会一边紧紧地依偎在我身上，一边慢慢把混沌的意识从睡梦中拔出来。散步时祂们会全力握紧我的手指，在天地之间指认万物，偶尔会尽情诉说些没有篇章的话，或是低声喃喃，或是激动挥拳，或是开朗大笑，祂们在大自然里无边无际，没有轮廓。</p>
      <p>曾经任何偏离正常的音调于我而言都是赛场上的发号令，可是后来我渐渐始隔岸观火。</p>
      <p>她曾经张开枫叶般的小手与我击掌，现在却一味地和奶奶说我责难她，而我只是尝试讲道理。我不再迷恋她身上延绵不绝的肥皂味，一群又一群热烈的哭闹撞上了我金属一样的血管，瞬间熄灭。</p>
      <p>他倔起来声音尖锐又不间断，像是一把带着锈味的锯子从耳朵伸进我的脑袋里，不停地磨我的神经。原本我的神经像树藤一样健康结实，但现在它像分叉的头发。</p>
      <p>祂们从早到晚地争夺足够多的玩具，一方得手另一方痛哭，此起彼伏的哭声像是在玩跷跷板。祂们似乎意识到哭声是把诱敌的利器，于是用起来得心应手。祂们会像陀螺一样在地面上转个不停，头骨坚硬，冷不丁就邦邦撞你一下。吃饭时祂们还没有养成足够的专注，总是心不在焉地展示出对食物最低劣的尊重——毫无征兆地会把食物吐在手上，洁净的衣服上，刚拖的地板上，我的温声细语逐渐滑向了怒音喝止。</p>
      <p>凌晨三点了，他的啼哭声忽而是一场暴雨梨花的飞镖；有时只是简单地抛出流星锤锁住正在下沉的自由意志；偶尔先是轻微的几声虚实摆架，然后隐入沉默，像是垫着脚尖试探地游走，游走，接着猝然转身朝你使出一套左摆拳，右直拳，高位鞭腿，搂脚勾腿摔，最后足球踢的连环招数，真他爹的狠。</p>
      <p>还好，幸好，太好了，我的肚子没有弹性，也没有长出脐带，我不是一个被需要的母亲，只是在隔壁房间叹息的姑姑。</p>
    `,
  },
};

export default function ArticleDetail() {
  const params = useParams();
  const id = params.id as string;
  const article = articles[id];

  if (!article) {
    return (
      <main className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-youyou text-4xl text-[#3A3A3A] mb-4">文章未找到</h1>
          <Link href="/slow-talk" className="text-[#A1887F] border-b border-[#A1887F] hover:opacity-80">
            返回有话漫谈
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <article className="pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto animate-fade-in">
        {/* Back Button */}
        <Link 
          href="/slow-talk" 
          className="inline-flex items-center text-[#9E9E9E] hover:text-[#A1887F] transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-serif tracking-widest">返回列表</span>
        </Link>

        {/* Article Header */}
        <header className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center gap-3 text-xs text-[#A1887F] font-medium tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full opacity-60" />
            <span>有话漫谈</span>
          </div>
          
          <h1 className="font-youyou text-4xl md:text-5xl lg:text-6xl text-[#2C2C2C] leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-[#9E9E9E] font-serif italic pt-4">
            <span>作者：{article.author}</span>
            <span className="w-1 h-1 bg-[#D7CCC8] rounded-full" />
            <span>{article.date}</span>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-stone prose-lg mx-auto font-serif text-[#3A3A3A] leading-loose
            prose-p:mb-8 prose-p:indent-8 prose-headings:font-youyou prose-headings:text-[#2C2C2C]
            prose-a:text-[#A1887F] prose-a:no-underline hover:prose-a:text-[#8D6E63]
            prose-blockquote:border-l-[#D7CCC8] prose-blockquote:text-[#757575] prose-blockquote:italic
            prose-strong:text-[#5D5D5D] prose-strong:font-normal"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Article Footer */}
        <div className="mt-24 pt-12 border-t border-[#D7CCC8]/30 text-center">
          <div className="w-8 h-8 mx-auto bg-[#EFEBE9] rounded-full flex items-center justify-center mb-6">
            <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full" />
          </div>
          <p className="font-youyou text-[#A1887F] text-lg tracking-widest opacity-80">
            星火 · 有话漫谈
          </p>
        </div>
      </article>
    </main>
  );
}
