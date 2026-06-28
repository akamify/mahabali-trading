"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  PlayCircle,
  ShieldCheck, 
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const COURSE_PRICE = 999; 
const STRUCK_PRICE = 24999;
const MENTOR_VIDEO_URL = (
  process.env.NEXT_PUBLIC_MENTOR_VIDEO_URL || "/course.mp4"
).trim();

export default function CourseHero() {
  const router = useRouter(); 
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current && current > 120) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (!hasStarted) {
        video.muted = false;
        setIsMuted(false);
      }
      try {
        await video.play();
        setIsPlaying(true);
        setHasStarted(true);
        setShowPoster(false);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  const toggleMute = (event) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.pause();
    setIsPlaying(false);
    setShowPoster(false);
  };

  const scrollToMobileForm = () => {
    router.push("/courses/form");
  };

  return (
    <>
      {/* --- Header Desktop--- */}
      <header
        className={`fixed inset-x-0 hidden top-0 z-[100] transition-all duration-500 transform lg:block ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="backdrop-blur-md bg-black/20 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Image
                  src="/finalLogo.png"
                  alt="Mahhabali"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-white text-base sm:text-xl font-bold leading-tight tracking-tight">
                  Mahhabali Education
                </h2>
                <p className="text-emerald-400 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase"></p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm sm:text-xl font-black italic">
                INDIA&apos;S <span className="text-[#75c13f]">№1</span>
              </div>
              <p className="text-white/50 text-[9px] sm:text-[11px] font-bold tracking-widest uppercase">
                Price Behavior
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Header Mobile */}
      <header
        className={`fixed left-0 w-full z-[9999] bg-[hsl(220_20%_15%_/_0.6)] backdrop-blur-xl border-b border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 py-3">
          {/* LOGO - LEFT */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center p-1.5">
            <Image
              src="/finalLogo.png"
              alt="MahaBali Logo"
              width={64}
              height={64}
              className="w-full h-full rounded-full object-contain drop-shadow-md"
            />
          </div>

          {/* TEXT - RIGHT */}
          <div className="leading-tight text-right">
            <h1 className="text-white text-base sm:text-2xl font-extrabold tracking-wide uppercase drop-shadow-lg">
              India&apos;s
              <span className="ml-1 text-xl sm:text-2xl font-black">1</span>
              <sup className="text-xs sm:text-sm font-bold ml-0.5">st</sup>
            </h1>
            <p className="text-[#75c13f] text-xs sm:text-base font-bold uppercase tracking-wide mt-0.5 drop-shadow-md">
              Price Behavior Program
            </p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(217,255,63,0.16),_transparent_30%),linear-gradient(180deg,#0b0f14_0%,#111824_100%)] px-4 py-5 pt-25 text-white md:py-6 md:pt-20">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-[url('/chart1.png')] bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(142_76%_45%_/_0.22)] via-transparent to-[hsl(142_76%_45%_/_0.08)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-0 lg:gap-10 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="lg:hidden">
              <h1 className="max-w-3xl text-3xl font-black text-center">
                PRICE BEHAVIOUR{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#75c13f] to-[#5da432]">
                  MASTERY
                </span>
              </h1>

              {/* <div className="flex justify-center mt-3">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl blur-xl bg-red-500 opacity-40 group-hover:opacity-60 transition-all duration-300" />

                  <div className="relative rounded-2xl px-2.5 py-1.5 bg-gradient-to-br from-red-600 to-red-700 shadow-2xl border border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center justify-center gap-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                      </div>
                      <span className="text-white text-base sm:text-lg font-extrabold tracking-widest drop-shadow-lg">
                        LIVE
                      </span>
                    </div>
                  </div>

                  <p className="text-white text-[10px] font-bold text-center mt-1.5 tracking-[0.2em]">
                    TRAINING
                  </p>
                </div>
              </div> */}
            </div>

            <div className="hidden space-y-3 lg:block">
              <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                PRICE BEHAVIOUR{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#75c13f] to-[#5da432]">
                  MASTERY
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200 md:text-2xl">
                A 10-day system that teaches you how to understand the market.
              </p>
            </div>

            <div className="hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur lg:block">
              <div className="flex flex-wrap items-end gap-4">
                <span className="text-2xl font-semibold text-slate-400 line-through">
                  ₹{STRUCK_PRICE}
                </span>
                <h2 className="text-white text-4xl sm:text-5xl font-black tracking-tighter italic drop-shadow-2xl">
                  <span className="text-[#75c13f]">₹999</span>
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                One-time payment. Limited seats. Real market learning.
              </p>
            </div>

            <div className="hidden rounded-[2rem] border border-white/10 bg-black/20 p-6 lg:block">
              <button
                type="button"
                onClick={scrollToMobileForm}
                className="w-full sm:flex-1 py-4 px-8 bg-gradient-to-r from-[#75c13f] to-[#5da432] hover:from-[#75c13f] hover:to-[#5da432] text-gray-900 font-black uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(117,193,63,0.3)] hover:shadow-[0_0_30px_rgba(117,193,63,0.5)] transition-all duration-300 transform hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Enroll Now - ₹{COURSE_PRICE}
              </button>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                By continuing , you agree to recieve couse updates on WhatsApp
                and email.
              </p>
            </div>

            {/* <div className="hidden grid gap-3  sm:grid-cols-3 lg:block">
              {trustPoints.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#75c13f]" />
                  <span className="text-sm font-medium text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div> */}
          </div>

          <div className="mx-auto w-full max-w-3xl lg:max-w-[40rem]">
            <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border border-[#75c13f]/25 bg-black/40 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111923]">
                {MENTOR_VIDEO_URL.includes("youtube") ||
                MENTOR_VIDEO_URL.includes("youtu.be") ? (
                  <iframe
                    title="Mentor intro video"
                    src={MENTOR_VIDEO_URL}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : MENTOR_VIDEO_URL ? (
                  <div
                    className="group relative h-full w-full cursor-pointer"
                    onClick={togglePlay}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        togglePlay();
                      }
                    }}
                  >
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      playsInline
                      src={MENTOR_VIDEO_URL}
                      muted={isMuted}
                      poster={
                        showPoster
                          ? process.env.NEXT_PUBLIC_MENTOR_VIDEO_POSTER || "/thumbnail.jpeg"
                          : ""
                      }
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={handleEnded}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

                    {!isPlaying ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex h-8 w-8 md:h-16 md:w-16 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                          <Play className="h-4 w-4 md:h-8 md:w-8" />
                        </div>
                      </div>
                    ) : null}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePlay();
                        }}
                        className="inline-flex items-center justify-center rounded-full bg-black/55 p-2 text-white ring-1 ring-white/20 backdrop-blur-sm"
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                      >
                        {isPlaying ? (
                          <Pause className="h-2 w-2 md:h-4 md:w-4" />
                        ) : (
                          <Play className="h-2 w-2 md:h-4 md:w-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        className="inline-flex items-center justify-center rounded-full bg-black/55 p-2 text-white ring-1 ring-white/20 backdrop-blur-sm"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? (
                          <VolumeX className="h-2 w-2 md:h-4 md:w-4" />
                        ) : (
                          <Volume2 className="h-2 w-2 md:h-4 md:w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#75c13f]/10 text-[#75c13f]">
                      <PlayCircle className="h-10 w-10" />
                    </div>
                    <div>
                      <p className="text-lg font-black">Mentor Intro Video</p>
                    </div>
                  </div>
                )}
              </div>
              {/* 
              <div className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 bg-[hsl(220_26%_8%_/_0.95)] backdrop-blur-sm p-2 rounded-lg shadow-xl border border-[hsl(142_76%_45%_/_0.2)] lg:hidden">
                <p className="text-white text-xl font-black leading-none uppercase">
                  2700+
                </p>
                <p className="text-white text-[10px] font-black leading-tight mt-0.5 uppercase">
                  Success
                  <br />
                  Stories
                </p>
              </div> */}

              {/* <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 bg-[hsl(220_26%_8%_/_0.95)] backdrop-blur-sm p-2 rounded-lg shadow-xl border border-[hsl(142_76%_45%_/_0.2)] lg:hidden">
                <div className="flex items-baseline gap-0.5">
                  <p className="text-white text-xl font-black leading-none uppercase">14</p>
                  <span className="text-white text-[10px] font-black uppercase">Year</span>
                </div>
                <p className="text-white text-[10px] font-black leading-tight mt-0.5 uppercase">
                  Experience
                </p>
              </div> */}
            </div>
            <div className="hidden mt-4 w-full rounded-[1.75rem] border border-white/10 bg-[hsl(220_20%_15%_/_0.6)] p-5 text-center backdrop-blur-xl lg:block">
              <p className="mt-2 text-lg font-bold text-slate-100">
                2700+ Students | 14 Year Experience | Real Market Learning
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                <ShieldCheck className="h-4 w-4 text-[#75c13f]" /> Secure
                Razorpay Payment
              </div>
            </div>

            <div className="mt-4 w-full rounded-3xl border border-white/10 bg-[hsl(220_20%_15%_/_0.6)] p-5 text-center backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={scrollToMobileForm}
                className="group relative mt-2 mb-4 w-full overflow-hidden rounded-full bg-[#75c13f] py-4 text-lg font-black uppercase tracking-wider text-gray-900 transition-all duration-150 ease-in-out hover:-translate-y-[4px] hover:shadow-[0_20px_40px_-10px_rgba(117,193,63,0.5)] active:translate-y-[2px] active:shadow-none lg:hidden"
              >
                <span className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]"></span>
                <span className="relative z-10">
                  Enroll Now - ₹{COURSE_PRICE}
                </span>
              </button>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="h-[1px] w-8 bg-[#75c13f]/50"></span>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em]">
                  Live Program
                </p>
                <span className="h-[1px] w-8 bg-[#75c13f]/50"></span>
              </div>

              <div className="relative inline-block mt-2">
                <p className="text-white/40 text-lg font-bold line-through decoration-[#75c13f]/50 mb-[-8px]">
                  ₹24,999 VALUE
                </p>
                <h2 className="text-white text-4xl sm:text-5xl font-black tracking-tighter italic drop-shadow-2xl">
                  <span className="text-[#75c13f]">₹999</span>
                </h2>
              </div>

              <p className="mt-3 text-sm font-medium text-white/80 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#75c13f] animate-pulse"></span>
                Exclusive Access for Early Birds
              </p>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[#75c13f] text-[10px] font-black tracking-[0.25em] uppercase mb-1">
                  Masterclass Lead By
                </p>
                <p className="text-white text-xl font-extrabold tracking-tight">
                  Mr. Suresh Latiyal
                </p>
                <p className="text-white/40 text-[10px] uppercase font-medium mt-1">
                  Industry Expert & Mentor
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-white/10 text-sm font-bold text-slate-100">
                2700+ Students | 14 Year Experience | Real Market Learning
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                <ShieldCheck className="h-4 w-4 text-[#75c13f]" /> Secure
                Razorpay Payment
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
