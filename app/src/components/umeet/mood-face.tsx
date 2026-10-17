import { moodOf, type MoodId } from "../../lib/umeet-shared";

const MOUTHS: Record<MoodId, string> = {
  happy: "M14 27 Q24 36 34 27",
  excited: "M14 26 Q24 39 34 26 Z",
  calm: "M17 29 Q24 33 31 29",
  okay: "M17 30 L31 30",
  sad: "M16 33 Q24 26 32 33",
  missing: "M18 30 Q24 34 30 30",
};

function Eyes({ mood }: { mood: MoodId }) {
  if (mood === "happy" || mood === "excited") {
    return (
      <>
        <path d="M12 21 Q15.5 16.5 19 21" />
        <path d="M29 21 Q32.5 16.5 36 21" />
      </>
    );
  }
  if (mood === "calm" || mood === "missing") {
    return (
      <>
        <path d="M12 19 Q15.5 23 19 19" />
        <path d="M29 19 Q32.5 23 36 19" />
      </>
    );
  }
  return (
    <>
      <circle cx="16" cy="20" r="2.2" fill="#1F3A34" stroke="none" />
      <circle cx="32" cy="20" r="2.2" fill="#1F3A34" stroke="none" />
    </>
  );
}

/** Functional mood glyph used by pickers and the widget preview. */
export function MoodFace({ mood, size = 48 }: { mood: MoodId | null; size?: number }) {
  const m = moodOf(mood);
  const color = m?.color ?? "#E6EFEA";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill={color} />
      {mood ? (
        <g fill="none" stroke="#1F3A34" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <Eyes mood={mood} />
          <path d={MOUTHS[mood]} fill={mood === "excited" ? "#1F3A34" : "none"} />
          {mood === "happy" || mood === "excited" || mood === "missing" ? (
            <>
              <circle cx="11" cy="28" r="3" fill="#FF9F8A" stroke="none" opacity="0.55" />
              <circle cx="37" cy="28" r="3" fill="#FF9F8A" stroke="none" opacity="0.55" />
            </>
          ) : null}
        </g>
      ) : (
        <text x="24" y="30" textAnchor="middle" fontSize="16" fill="#4A5F59">
          ?
        </text>
      )}
    </svg>
  );
}
