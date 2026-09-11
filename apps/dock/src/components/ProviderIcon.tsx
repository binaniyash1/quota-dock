import type { ProviderId } from "@/lib/types";

const icons: Record<ProviderId, string> = {
  cursor: "⌘",
  claude: "◐",
  chatgpt: "◎",
  grok: "✦",
};

export function ProviderIcon({ id }: { id: ProviderId }) {
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold"
      aria-hidden
    >
      {icons[id]}
    </span>
  );
}
