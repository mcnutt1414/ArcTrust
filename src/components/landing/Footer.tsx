import { ArcMark } from "./ArcMark";

const GITHUB_URL = "https://github.com/mcnutt1414/ArcTrust";

export function Footer() {
  return (
    <footer className="border-t border-arc-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <ArcMark className="h-5 w-5" />
          <span className="text-sm font-medium text-arc-text">ArcTrust</span>
          <span className="text-xs text-arc-muted">
            · Hackathon submission · 2026
          </span>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-arc-muted transition-colors hover:text-arc-text"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              clipRule="evenodd"
            />
          </svg>
          mcnutt1414/ArcTrust
        </a>
      </div>
    </footer>
  );
}
