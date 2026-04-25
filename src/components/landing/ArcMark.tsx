type ArcMarkProps = {
  className?: string;
};

export function ArcMark({ className }: ArcMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="arc-mark-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#00E0B0" />
        </linearGradient>
      </defs>
      <path
        d="M5 24 A11 11 0 0 1 27 24"
        stroke="url(#arc-mark-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="24" r="2.25" fill="#00E0B0" />
    </svg>
  );
}
