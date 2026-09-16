"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Asterisk,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  CircleDot,
  Command,
  Mail,
  Menu,
  Pause,
  Play,
  Waves,
  X,
} from "lucide-react";
import AccordionGallery from "@/components/AccordionGallery";
import BorderGlow from "@/components/BorderGlow";
import EditorialBackground from "@/components/EditorialBackground";
import FuzzyText from "@/components/FuzzyText";
import ProjectDetailDialog, { type ProjectDetailKind } from "@/components/ProjectDetailDialog";
import SpecularButton from "@/components/SpecularButton";
import { usePortfolioMotion } from "@/lib/usePortfolioMotion";

const projects = [
  { title: "长岛冰茶", subtitle: "Latest Release", image: "/assets/release-long-island.webp", index: "01", audio: "/assets/audio/release-long-island.m4a" },
  { title: "失眠症患者", subtitle: "Latest Release", image: "/assets/release-insomnia.webp", index: "02", audio: "/assets/audio/release-insomnia.m4a" },
  { title: "Fall in Love", subtitle: "Latest Release", image: "/assets/release-fall-in-love.webp", index: "03", audio: "/assets/audio/release-fall-in-love.m4a" },
  { title: "安静的阳光午后", subtitle: "Latest Release", image: "/assets/release-sunny-afternoon.webp", index: "04", audio: "/assets/audio/release-sunny-afternoon.m4a" },
  { title: "霉运霉运快划走", subtitle: "Latest Release", image: "/assets/release-bad-luck-away.webp", index: "05", audio: "/assets/audio/release-bad-luck-away.m4a" },
];

const strengths = [
  { index: "01", icon: Waves, title: "音乐制作", en: "Music Production", copy: "从旋律的第一笔，到完整的声音表达。作曲、作词、编曲与管弦乐配器，贯穿创作全流程。", tags: "作曲 / 作词 / 编曲 / 管弦乐配器", href: "https://i2.y.qq.com/n3/other/pages/details/playlist.html?platform=11&appshare=android_qq&appversion=20080508&hosteuin=7ecq7eo57K-F&id=8357177888&ADTAG=wxfshare" },
  { index: "02", icon: Asterisk, title: "唱作与演唱", en: "Songwriting & Vocals", copy: "以唯美、细腻的表达为起点，在流行、音乐剧、交响与电子之间，寻找属于作品的情绪。", tags: "原创音乐 / 人声表达 / 多元曲风", href: "https://i2.y.qq.com/n3/other/pages/details/playlist.html?platform=11&appshare=android_qq&appversion=20080508&hosteuin=7ecq7eo57K-F&id=9367660988&fromShare=1&ADTAG=wxfshare" },
  { index: "03", icon: CircleDot, title: "舞台与现场", en: "Live Performance", copy: "将录音室里的细节带到现场。用声音连接观众，让每一次演出拥有独立的情绪和记忆。", tags: "Livehouse / 音乐节 / 现场演唱", href: "https://v.douyin.com/hWFadHm2faA/" },
  { index: "04", icon: Command, title: "AI 音乐影像", en: "AI Music Video", copy: "将音乐的情绪延伸为影像语言，探索声音、视觉与人工智能共同参与的创作。", tags: "AIMV 导演 / 视听创作", href: "https://music.163.com/#/artist/mv?id=12122236" },
];

const stats = [
  { value: "50", suffix: "亿+", label: "全网音乐播放量" },
  { value: "40", suffix: "+", label: "主办 Livehouse 演出" },
  { value: "100", suffix: "+", label: "现场与音乐节演出" },
];

const portraitFrames = [
  { image: "/assets/about-portrait-01.webp", alt: "翁梓铭黑白学院风艺术家肖像", label: "PORTRAIT / 01", position: "50% 24%" },
  { image: "/assets/about-portrait-02.webp", alt: "翁梓铭蓝色霓虹舞台肖像", label: "NEON / 02", position: "50% 48%" },
  { image: "/assets/about-portrait-03.webp", alt: "翁梓铭蓝色风中肖像", label: "WIND / 03", position: "50% 45%" },
  { image: "/assets/about-portrait-04.webp", alt: "翁梓铭红玫瑰艺术肖像", label: "ROSE / 04", position: "50% 50%" },
  { image: "/assets/about-portrait-05.webp", alt: "翁梓铭红色光影全身肖像", label: "SHADOW / 05", position: "50% 38%" },
];

const songs = [
  { title: "苦尽甘来", audio: "/assets/audio/work-bitter-sweet.m4a" },
  { title: "太迟", audio: "/assets/audio/work-too-late.m4a" },
  { title: "原来如此", audio: "/assets/audio/work-so-it-is.m4a" },
  { title: "梨花笑", audio: "/assets/audio/work-pear-blossom-smile.m4a" },
  { title: "都怪我", audio: "/assets/audio/work-blame-me.m4a" },
  { title: "舒伯特玫瑰", audio: "/assets/audio/work-schubert-rose.m4a" },
  { title: "冷夜", audio: "/assets/audio/work-cold-night.m4a" },
  { title: "该死的爱情", audio: "/assets/audio/work-damned-love.m4a" },
];

const featuredWorks = [
  { index: "01", title: "苦尽甘来", category: "Original Music", note: "播放量10亿+", image: "/assets/work-bitter-sweet.webp", action: "open", detail: "song" as ProjectDetailKind },
  { index: "02", title: "虚拟偶像翁沁", category: "Virtual Idol", image: "/assets/work-virtual-idol-2026.webp", action: "open", detail: "idol" as ProjectDetailKind },
  { index: "03", title: "AIMV作品展示 · 两个世界的孤单", category: "AI Music Video", note: "AIMV / 视觉叙事", image: "/assets/aimv-preview-poster.webp", action: "play", detail: "video" as ProjectDetailKind },
  { index: "04", title: "在现场，与声音相遇", category: "Live Performance", note: "舞台 / 音乐节", image: "/assets/work-live-2025.webp", action: "open", detail: "live" as ProjectDetailKind },
];

function BrandMark() {
  return (
    <a className="brand" href="#top" aria-label="返回首页">
      <span className="brand-row"><span className="brand-main">JONG</span><span className="brand-cn">翁梓铭</span></span>
      <span className="brand-sub">MUSIC / VISUAL</span>
    </a>
  );
}

function AnimatedSectionTitle({ title, mobileLines }: { title: string; mobileLines?: string[] }) {
  const renderFuzzyTitle = (line: string, key?: string) => (
    <FuzzyText
      key={key ?? line}
      className="section-title-fuzzy"
      fontSize="var(--section-title-size)"
      fontWeight={700}
      fontFamily={'"Arial Narrow", "Helvetica Neue", Arial, sans-serif'}
      color="#dce6f4"
      baseIntensity={0.06}
      hoverIntensity={0.25}
      fuzzRange={18}
      fps={24}
      direction="horizontal"
      transitionDuration={170}
      glitchMode
      glitchInterval={3400}
      glitchDuration={140}
      letterSpacing={-7}
    >
      {line}
    </FuzzyText>
  );

  return (
    <h2 className={`section-title section-title--fuzzy${mobileLines ? " has-mobile-lines" : ""}`} data-reveal aria-label={title}>
      <span className="section-title-render section-title-render--desktop">{renderFuzzyTitle(title)}</span>
      {mobileLines ? (
        <span className="section-title-render section-title-render--mobile" aria-hidden="true">
          {mobileLines.map((line, index) => renderFuzzyTitle(line, `${line}-${index}`))}
        </span>
      ) : null}
    </h2>
  );
}

export default function Home() {
  usePortfolioMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectDetailKind | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState("");
  const [songPreviewStatus, setSongPreviewStatus] = useState("");
  const [headerPinned, setHeaderPinned] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let frame = 0;
    let pinned = false;
    const updateHeader = () => {
      frame = 0;
      const nextPinned = window.scrollY > 24;
      if (nextPinned === pinned) return;
      pinned = nextPinned;
      setHeaderPinned(nextPinned);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };
    frame = window.requestAnimationFrame(updateHeader);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => previewAudioRef.current?.pause(), []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const playAudioPreview = (key: string, title: string, source: string, setStatus: (message: string) => void) => {
    setPreviewStatus("");
    setSongPreviewStatus("");

    if (playingPreview === key) {
      previewAudioRef.current?.pause();
      previewAudioRef.current = null;
      setPlayingPreview(null);
      setStatus(`${title}已暂停`);
      return;
    }

    previewAudioRef.current?.pause();
    const audio = new Audio(source);
    audio.preload = "auto";
    previewAudioRef.current = audio;
    audio.addEventListener("ended", () => {
      if (previewAudioRef.current !== audio) return;
      previewAudioRef.current = null;
      setPlayingPreview(null);
      setStatus(`${title}试听结束`);
    }, { once: true });
    void audio.play().then(() => {
      if (previewAudioRef.current !== audio) return;
      setPlayingPreview(key);
      setStatus(`正在试听${title}`);
    }).catch(() => {
      if (previewAudioRef.current === audio) previewAudioRef.current = null;
      setPlayingPreview(null);
      setStatus(`${title}暂时无法播放，请稍后重试`);
    });
  };

  const stopAudioPreview = () => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setPlayingPreview(null);
    setPreviewStatus("");
    setSongPreviewStatus("");
  };

  const playPreview = (project: (typeof projects)[number]) => {
    playAudioPreview(`release-${project.index}`, project.title, project.audio, setPreviewStatus);
  };

  const closeMenu = () => setMenuOpen(false);
  const playSongPreview = (song: (typeof songs)[number]) => {
    playAudioPreview(`work-${song.title}`, song.title, song.audio, setSongPreviewStatus);
  };

  return (
    <main id="top">
      <div className="opening-sequence" aria-hidden="true">
        <div className="opening-sequence__panels">
          <i className="opening-sequence__panel" />
          <i className="opening-sequence__panel" />
          <i className="opening-sequence__panel" />
        </div>
        <span className="opening-sequence__index">JONG — ARTIST PROFILE / 01</span>
        <span className="opening-sequence__line" />
      </div>
      <section className="hero" aria-label="首页">
        <div className="hero-portrait" aria-hidden="true">
          <img src="/assets/jong-hero-portrait-2026.webp" alt="" width="1600" height="2163" fetchPriority="high" decoding="async" />
        </div>
        <div className="hero-scrim" />

        <header className={`site-header shell${headerPinned ? " is-scrolled" : ""}`}>
          <BrandMark />
          <nav className="desktop-nav" aria-label="主导航">
            <a href="#about">关于</a>
            <a href="#works">作品</a>
            <a href="#capabilities">创作领域</a>
          </nav>
          <a className="contact-link desktop-contact" href="#contact">
            联系合作 <ArrowUpRight size={16} strokeWidth={1.6} />
          </a>
          <button className="menu-button" type="button" aria-label={menuOpen ? "关闭菜单" : "打开菜单"} aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>

        <div id="mobile-navigation" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen} inert={menuOpen ? undefined : true}>
          <a href="#about" onClick={closeMenu}>关于</a>
          <a href="#works" onClick={closeMenu}>作品</a>
          <a href="#capabilities" onClick={closeMenu}>创作领域</a>
          <a href="#contact" onClick={closeMenu}>联系合作</a>
        </div>

        <div className="hero-stage shell">
          <p className="hero-side-index" aria-hidden="true">JONG MUSIC — ARTIST PROFILE / 01</p>

          <div className="hero-profile">
            <div className="hero-profile-top">
              <p className="hero-disciplines"><span>独立音乐人</span><span>影像创作者</span></p>
              <p className="hero-profile-index">ARTIST<br />PROFILE — 01</p>
            </div>

            <div className="hero-name-lockup">
              <h1 aria-label="JONG">
                <FuzzyText
                  className="hero-fuzzy-name"
                  fontSize="var(--hero-name-size)"
                  fontWeight={800}
                  fontFamily={'Impact, "Arial Narrow", "Helvetica Neue", sans-serif'}
                  color="#f0f3f7"
                  baseIntensity={0.08}
                  hoverIntensity={0.28}
                  fuzzRange={20}
                  fps={36}
                  direction="horizontal"
                  transitionDuration={180}
                  glitchMode
                  glitchInterval={2800}
                  glitchDuration={150}
                >
                  JONG
                </FuzzyText>
              </h1>
              <span>翁<br />梓<br />铭</span>
            </div>

            <div className="hero-panel-rule">
              <i aria-hidden="true" />
              <span>SOUND × VISION</span>
            </div>

            <div className="hero-summary">
              <p>音乐制作人 / 音乐唱作人</p>
              <p>歌手 / AIMV 导演 / 虚拟偶像制作</p>
              <p>让声音，成为看得见的情绪。</p>
            </div>

            <a className="hero-works-cta" href="#works">
              <strong>SELECTED<br />WORKS</strong>
              <span>探索作品 <ArrowDownRight size={34} strokeWidth={1.35} /></span>
            </a>
          </div>

          <div className="hero-releases">
            <div className="hero-releases-heading">
              <strong>最近新歌</strong>
              <span>LATEST RELEASES / 05</span>
            </div>

            <div className="hero-release-grid">
              {projects.map((project) => (
                <BorderGlow className="hero-release-glow" key={`hero-${project.index}`} edgeSensitivity={18} glowRadius={20} glowIntensity={0.62} fillOpacity={0.13}>
                  <button className="hero-release-card" type="button" onClick={() => playPreview(project)} aria-label={`${playingPreview === `release-${project.index}` ? "暂停" : "试听"}${project.title}`}>
                    <img src={project.image} alt={`${project.title}封面`} decoding="async" />
                    <span><i>{project.index}</i>{project.title}{playingPreview === `release-${project.index}` ? <Pause size={14} /> : <Play size={14} />}</span>
                  </button>
                </BorderGlow>
              ))}
            </div>
            <p className={`hero-preview-status${previewStatus ? " is-visible" : ""}`} role="status" aria-live="polite">{previewStatus}</p>

            <div className="hero-footer-meta">
              <a href="#about">向下探索 / SCROLL <ArrowDownRight size={15} /></a>
              <span>MUSIC / VISUAL / LIVE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about editorial-section" id="about">
        <EditorialBackground />
        <div className="section-shell shell">
          <div className="section-ref" data-reveal><span>01 / ABOUT</span><span>关于我</span></div>
          <AnimatedSectionTitle title="ABOUT" />

          <div className="about-layout">
            <div className="portrait-gallery" data-reveal>
              <AccordionGallery
                items={portraitFrames}
                defaultIndex={2}
                accentColor="#dce9ff"
                overlayColor="#002f55"
                expandRatio={0.52}
                height={620}
                gap={10}
                radius={20}
                duration={0.75}
                ease="power2.inOut"
                parallax={0.5}
                tilt={8}
                trigger="click"
                showLabels={false}
              />
              <div className="portrait-meta"><span>JONG / 翁梓铭</span><span>ARTIST PORTRAITS / 05</span></div>
              <p>悬停或轻触，展开不同的我。</p>
            </div>

            <div className="about-copy" data-reveal>
              <p className="section-eyebrow">MORE THAN ONE EXPRESSION</p>
              <h3>在声音之中<br />也在画面之外</h3>
              <p className="about-lead">我是翁梓铭 JONG，<br />一个用音乐和影像表达的创作者。</p>
              <p>毕业于星海音乐学院，从词曲创作、编曲到管弦乐配器，以唯美、细腻、大气的声音语言，连接作品与听众。擅长风格多元化，流行、电子、爵士、Hiphop、R&amp;B、纯音乐......</p>
              <p>曾合作李宇春、古巨基、EXO、尚雯婕、杨宗纬、陶喆、鹿晗、黄龄等艺人；参与《乘风破浪的姐姐》《中国好歌曲》《中国好声音》《我是歌手》等音乐节目的音乐制作。</p>

              <div className="song-list">
                <p>代表作品</p>
                <div>{songs.map((song) => (
                  <span className="song-row" key={song.title}>
                    {song.title}
                    <SpecularButton
                      className="song-preview-button"
                      size="sm"
                      radius={999}
                      tint="#dce6f4"
                      tintOpacity={0.01}
                      textColor="rgba(220, 230, 244, .72)"
                      lineColor="#f2f7ff"
                      baseColor="#435064"
                      intensity={0.82}
                      shineSize={9}
                      shineFade={40}
                      thickness={0.85}
                      speed={0.35}
                      followMouse={false}
                      autoAnimate
                      aria-label={`${playingPreview === `work-${song.title}` ? "暂停" : "试听"}${song.title}`}
                      title={playingPreview === `work-${song.title}` ? "暂停试听" : "试听"}
                      onClick={() => playSongPreview(song)}
                    >
                      {playingPreview === `work-${song.title}` ? <>暂停 <Pause size={12} /></> : <>试听 <Play size={12} /></>}
                    </SpecularButton>
                  </span>
                ))}</div>
                <p className={`song-preview-status${songPreviewStatus ? " is-visible" : ""}`} role="status" aria-live="polite">{songPreviewStatus}</p>
              </div>
            </div>
          </div>

          <div className="stats" data-reveal>
            {stats.map(({ value, suffix, label }) => (
              <div className="stat" key={label}>
                <strong><span className="stat-value">{value}</span><span className="stat-suffix">{suffix}</span></strong>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="works editorial-section" id="works">
        <EditorialBackground />
        <div className="section-shell shell">
          <div className="section-ref" data-reveal><span>02 / SELECTED WORK</span><span>精选项目</span></div>
          <AnimatedSectionTitle title="SELECTED WORK" />
          <div className="works-intro" data-reveal><h3>让作品<br />自己说话</h3><p>一些旋律，一些片段。<br />关于我，也关于你。</p></div>

          <div className="project-grid">
            {featuredWorks.map((project, index) => (
              <article className={`project-card project-${index + 1}`} key={project.title} data-reveal>
                <BorderGlow className="project-glow" edgeSensitivity={22} glowRadius={30} glowIntensity={0.74} fillOpacity={0.16}>
                {project.detail ? (
                <button
                  className="project-image-wrap"
                  type="button"
                  onClick={() => {
                    if (project.detail === "video") stopAudioPreview();
                    setActiveProject(project.detail);
                  }}
                  aria-label={`查看${project.title}详情`}
                >
                  <img src={project.image} alt={`${project.title}项目画面`} loading="lazy" decoding="async" />
                  <span className="project-arrow">{project.action === "play" ? <Play /> : <ArrowUpRight />}</span>
                  <small>JONG / MUSIC ARCHIVE</small>
                </button>
                ) : (
                <a className="project-image-wrap" href="#contact" aria-label={`了解${project.title}`}>
                  <img src={project.image} alt={`${project.title}项目画面`} loading="lazy" decoding="async" />
                  <span className="project-arrow"><ArrowUpRight /></span>
                  <small>JONG / MUSIC ARCHIVE</small>
                </a>
                )}
                </BorderGlow>
                <div className="project-caption">
                  <div><p>{project.category}</p><h3>{project.title}</h3>{project.note && <span>{project.note}</span>}</div>
                  <i>/{project.index}</i>
                </div>
              </article>
            ))}
          </div>
          <ProjectDetailDialog project={activeProject} onClose={() => setActiveProject(null)} onVideoPlay={stopAudioPreview} />
        </div>
      </section>

      <section className="capabilities editorial-section" id="capabilities">
        <EditorialBackground />
        <div className="section-shell shell">
          <div className="section-ref" data-reveal><span>03 / CREATIVE PRACTICE</span><span>个人优势</span></div>
          <AnimatedSectionTitle title="CREATIVE PRACTICE" />
          <div className="capability-intro" data-reveal><h3>不同的媒介<br />同一种表达欲</h3><p>从一段旋律到一个完整世界，<br />让每一个创作环节彼此呼应。</p></div>

          <div className="strength-grid">
            {strengths.map((item) => (
              <BorderGlow className="strength-glow" key={item.index} data-reveal edgeSensitivity={24} glowRadius={26} glowIntensity={0.68} fillOpacity={0.07} backgroundColor="rgba(6, 13, 22, .34)">
                <a className="strength-card" href={item.href} target="_blank" rel="noreferrer" aria-label={`打开${item.title}相关作品`}>
                  <div className="strength-top"><span>{item.index}</span><i aria-hidden="true"><item.icon /></i></div>
                  <div><h3>{item.title}</h3><p className="strength-en">{item.en}</p><p className="strength-copy">{item.copy}</p></div>
                  <p className="strength-tags">{item.tags}</p>
                </a>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      <footer className="contact editorial-section" id="contact">
        <EditorialBackground />
        <div className="contact-content shell">
          <div className="section-ref" data-reveal><span>04 / GET IN TOUCH</span><span>下一次创作，从这里开始</span></div>
          <AnimatedSectionTitle title="GET IN TOUCH" />
          <p className="contact-kicker" data-reveal>HAVE SOMETHING IN MIND?</p>
          <div className="contact-statement" data-reveal>
            <h3>一起把灵感<br />变成作品</h3>
          </div>
          <div className="contact-bottom" data-reveal>
            <p>音乐制作 / 原创歌曲 / 演出邀约 / AIMV 创作 / 虚拟偶像制作</p>
            <div><span>商务邮箱</span><span className="contact-email"><Mail size={16} />489431528@qq.com</span></div>
          </div>
          <div className="footer-line"><BrandMark /><span>© {new Date().getFullYear()} JONG. ALL RIGHTS RESERVED.</span><a href="#top">回到顶部 <ArrowUp size={13} aria-hidden="true" /></a></div>
        </div>
      </footer>
    </main>
  );
}
