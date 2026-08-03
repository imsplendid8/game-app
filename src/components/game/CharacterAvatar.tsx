interface CharacterAvatarProps {
  emoji?: string;
  /** 크기 */
  size?: "md" | "lg";
  /** 아래 받침(스테이지) 표시 */
  stage?: boolean;
}

/** 아이돌 키우기 감성의 캐릭터 아바타. 반짝이는 프레임 + 둥둥 애니메이션. */
export function CharacterAvatar({
  emoji = "🧑‍💼",
  size = "lg",
  stage = true,
}: CharacterAvatarProps) {
  const box = size === "lg" ? "h-32 w-32 text-6xl" : "h-24 w-24 text-5xl";

  return (
    <div className="relative flex flex-col items-center">
      {/* 반짝이 */}
      <span
        aria-hidden
        className="absolute -left-1 top-2 animate-twinkle text-xl"
      >
        ✨
      </span>
      <span
        aria-hidden
        className="absolute -right-1 top-6 animate-twinkle text-sm [animation-delay:0.6s]"
      >
        ⭐
      </span>
      <span
        aria-hidden
        className="absolute -right-2 bottom-10 animate-twinkle text-lg [animation-delay:1.2s]"
      >
        💗
      </span>

      <div
        className={`relative flex ${box} animate-float items-center justify-center rounded-[42%] bg-white/70 ring-4 ring-white shadow-glossy`}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-[42%] bg-brand-gradient opacity-20"
        />
        <span aria-hidden className="relative">
          {emoji}
        </span>
      </div>

      {stage && (
        <span
          aria-hidden
          className="mt-2 h-3 w-24 rounded-[50%] bg-grape/25 blur-[2px]"
        />
      )}
    </div>
  );
}
