"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type ProjectDetailKind = "song" | "idol" | "video" | "live";

type ProjectDetailDialogProps = {
  project: ProjectDetailKind | null;
  onClose: () => void;
  onVideoPlay?: () => void;
};

const detailTitles: Record<ProjectDetailKind, string> = {
  song: "苦尽甘来",
  idol: "虚拟偶像翁沁",
  video: "两个世界的孤单",
  live: "在现场，与声音相遇",
};

const liveImages = [
  { src: "/assets/live-gallery-01.webp", alt: "室内舞台演唱现场" },
  { src: "/assets/live-gallery-02.webp", alt: "红色舞台灯光下的键盘演奏" },
  { src: "/assets/live-gallery-03.webp", alt: "蓝红舞台灯光下的演出肖像" },
  { src: "/assets/live-gallery-04.webp", alt: "鼓浪屿音乐季大型舞台" },
  { src: "/assets/live-gallery-05.webp", alt: "济南巡演舞台互动现场" },
  { src: "/assets/live-gallery-06.webp", alt: "济南站演唱会观众视角" },
  { src: "/assets/live-gallery-07.webp", alt: "黑白演唱舞台特写" },
  { src: "/assets/live-gallery-08.webp", alt: "影像投影中的演出肖像" },
  { src: "/assets/live-gallery-09.webp", alt: "展开双臂演唱的舞台瞬间" },
];

const idolLooks = [
  { src: "/assets/idol-look-01.webp", alt: "翁沁黑白日常造型三视图", label: "日常系列 · 01" },
  { src: "/assets/idol-look-02.webp", alt: "翁沁银发日常造型三视图", label: "日常系列 · 02" },
  { src: "/assets/idol-look-03.webp", alt: "翁沁粉发狐耳 COS 造型三视图", label: "COS 系列" },
  { src: "/assets/idol-look-04.webp", alt: "翁沁金发 Y2K 造型三视图", label: "Y2K 系列" },
];

type LightboxState = { group: "live" | "idol"; index: number } | null;

function DetailActions({ artistHref }: { artistHref?: string }) {
  const primaryHref = artistHref ?? "https://music.163.com/#/mv?id=34790960";
  return (
    <div className="detail-actions">
      <DialogClose asChild>
        <a href={primaryHref} target="_blank" rel="noreferrer">
          {artistHref ? "艺人主页" : "观看完整作品"} <ArrowUpRight size={15} />
        </a>
      </DialogClose>
      <DialogClose asChild>
        <a href="#contact">洽谈合作 <ArrowUpRight size={15} /></a>
      </DialogClose>
    </div>
  );
}

function SongDetail() {
  return (
    <div className="detail-layout detail-layout--song">
      <figure className="detail-visual detail-visual--square">
        <img src="/assets/work-bitter-sweet.webp" alt="苦尽甘来专辑封面" decoding="async" />
      </figure>
      <div className="detail-copy">
        <p className="detail-eyebrow">代表作品</p>
        <h2>苦尽甘来</h2>
        <p className="detail-description">代表作品《苦尽甘来》。</p>
        <dl className="detail-facts">
          <div><dt>作词</dt><dd>翁梓铭</dd></div>
          <div><dt>作曲</dt><dd>翁梓铭</dd></div>
          <div><dt>编曲</dt><dd>翁梓铭</dd></div>
          <div><dt>制作人</dt><dd>翁梓铭</dd></div>
        </dl>
        <DetailActions artistHref="https://music.163.com/#/artist/album?id=12122236" />
      </div>
    </div>
  );
}

function IdolDetail({ onOpenImage }: { onOpenImage: (index: number) => void }) {
  return (
    <div className="detail-layout detail-layout--idol">
      <figure className="detail-visual detail-visual--portrait">
        <img src="/assets/work-virtual-idol-2026.webp" alt="虚拟偶像翁沁造型肖像" decoding="async" />
      </figure>
      <div className="detail-copy">
        <p className="detail-eyebrow">VIRTUAL IDOL</p>
        <h2>虚拟偶像翁沁</h2>
        <dl className="detail-facts">
          <div><dt>姓名</dt><dd>翁沁</dd></div>
          <div><dt>身高</dt><dd>165 cm</dd></div>
          <div><dt>年龄</dt><dd>18岁</dd></div>
          <div><dt>擅长风格</dt><dd>电子、流行、R&amp;B</dd></div>
        </dl>
        <DetailActions artistHref="https://music.163.com/#/artist?id=127869733" />
        <div className="idol-lookbook">
          <div className="lookbook-heading"><span>造型图集</span><span>点击查看大图 <ArrowUpRight size={12} aria-hidden="true" /></span></div>
          <div className="lookbook-grid">
            {idolLooks.map((look, index) => (
              <button type="button" key={look.src} onClick={() => onOpenImage(index)} aria-label={`放大查看${look.label}`}>
                <img src={look.src} alt={look.alt} loading="lazy" decoding="async" />
                <span className="lookbook-shade" aria-hidden="true" />
                <i>{look.label}</i><ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoDetail({ onPlay }: { onPlay?: () => void }) {
  return (
    <div className="video-detail">
      <video
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        preload="metadata"
        poster="/assets/aimv-preview-poster.webp"
        onPlay={onPlay}
        onContextMenu={(event) => event.preventDefault()}
      >
        <source src="/assets/aimv-preview.mp4" type="video/mp4" />
        你的浏览器暂不支持视频播放。
      </video>
      <div className="video-detail-copy">
        <p className="detail-eyebrow">AI MUSIC VIDEO</p>
        <h2>两个世界的孤单</h2>
        <DetailActions />
      </div>
    </div>
  );
}

function LiveDetail({ onOpenImage }: { onOpenImage: (index: number) => void }) {
  return (
    <div className="live-detail">
      <p className="detail-eyebrow">LIVE ARCHIVE / 18</p>
      <h2>在现场，与声音相遇</h2>
      <div className="live-gallery">
        {liveImages.map((image, index) => (
          <button type="button" key={image.src} onClick={() => onOpenImage(index)} aria-label={`放大查看第 ${index + 1} 张演出照片`}>
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailDialog({ project, onClose, onVideoPlay }: ProjectDetailDialogProps) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const lightboxImages = lightbox?.group === "idol" ? idolLooks : liveImages;
  const activeImage = lightbox === null ? null : lightboxImages[lightbox.index];
  const showPrevious = () => setLightbox((current) => current === null ? null : {
    ...current,
    index: (current.index - 1 + (current.group === "idol" ? idolLooks.length : liveImages.length)) % (current.group === "idol" ? idolLooks.length : liveImages.length),
  });
  const showNext = () => setLightbox((current) => current === null ? null : {
    ...current,
    index: (current.index + 1) % (current.group === "idol" ? idolLooks.length : liveImages.length),
  });

  return (
    <>
      <Dialog open={project !== null} onOpenChange={(open) => { if (!open) { setLightbox(null); onClose(); } }}>
        <DialogContent className={`project-modal${project ? ` project-modal--${project}` : ""}`} showCloseButton={false}>
          {project && (
            <>
              <DialogTitle className="visually-hidden">{detailTitles[project]}</DialogTitle>
              <DialogDescription className="visually-hidden">{detailTitles[project]}项目详情</DialogDescription>
              <DialogClose className="project-modal-close" aria-label="关闭详情页"><X /></DialogClose>
              {project === "song" && <SongDetail />}
              {project === "idol" && <IdolDetail onOpenImage={(index) => setLightbox({ group: "idol", index })} />}
              {project === "video" && <VideoDetail onPlay={onVideoPlay} />}
              {project === "live" && <LiveDetail onOpenImage={(index) => setLightbox({ group: "live", index })} />}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={lightbox !== null} onOpenChange={(open) => { if (!open) setLightbox(null); }}>
        <DialogContent
          className="live-lightbox"
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") showPrevious();
            if (event.key === "ArrowRight") showNext();
          }}
        >
          <DialogTitle className="visually-hidden">{lightbox?.group === "idol" ? "翁沁造型大图" : "演出照片大图"}</DialogTitle>
          <DialogDescription className="visually-hidden">使用左右按钮切换图片</DialogDescription>
          <DialogClose className="live-lightbox-close" aria-label="关闭大图"><X /></DialogClose>
          <button className="live-lightbox-nav live-lightbox-nav--previous" type="button" onClick={showPrevious} aria-label="查看上一张"><ChevronLeft /></button>
          {activeImage && (
            <figure>
              <img src={activeImage.src} alt={activeImage.alt} decoding="async" />
              <figcaption>{"label" in activeImage ? `${activeImage.label} · ` : ""}{String((lightbox?.index ?? 0) + 1).padStart(2, "0")} / {String(lightboxImages.length).padStart(2, "0")}</figcaption>
            </figure>
          )}
          <button className="live-lightbox-nav live-lightbox-nav--next" type="button" onClick={showNext} aria-label="查看下一张"><ChevronRight /></button>
        </DialogContent>
      </Dialog>
    </>
  );
}
