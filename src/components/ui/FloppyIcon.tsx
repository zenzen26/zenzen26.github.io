interface FloppyIconProps {
  label: string;
  caption?: string;
  /** Tiny extra line under the caption (e.g. a last-updated date). */
  note?: string;
  /** Optional picture printed on the disk label. */
  imageUrl?: string;
  /** Plastic case colour. */
  tone?: 'ink' | 'moss' | 'forest';
  onClick: () => void;
  className?: string;
}

const CASE: Record<NonNullable<FloppyIconProps['tone']>, string> = {
  ink: 'bg-ink',
  moss: 'bg-moss',
  forest: 'bg-forest',
};

/** Floppy disk desktop icon with a Mac-style label underneath. */
export default function FloppyIcon({ label, caption, note, imageUrl, tone = 'ink', onClick, className = '' }: FloppyIconProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`group w-full flex flex-col items-center gap-2 text-center cursor-pointer outline-none ${className}`}
    >
      {/* drop-shadow lives on this wrapper: clip-path on the case would cut it off */}
      <div className="w-full max-w-[160px] transition-all duration-150 group-hover:-translate-y-1 group-hover:drop-shadow-[4px_4px_0_black] group-focus-visible:-translate-y-1 group-focus-visible:drop-shadow-[4px_4px_0_black] group-active:translate-y-0 group-active:drop-shadow-[1px_1px_0_black]">
        <div
          className={`${CASE[tone]} relative aspect-square w-full [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]`}
        >
          {/* metal shutter */}
          <div className="absolute left-[26%] top-0 h-[28%] w-[48%] bg-grey">
            <div className="absolute right-[16%] top-[18%] h-[60%] w-[18%] bg-ink" />
          </div>
          {/* label */}
          <div className="absolute inset-x-[10%] bottom-0 h-[52%] bg-beige-light overflow-hidden group-hover:bg-white">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center font-pixel font-bold text-sm sm:text-xl lg:text-2xl whitespace-nowrap text-ink group-hover:scale-110 transition-transform">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
      {caption && <span className="b3 text-ink/60">{caption}</span>}
      {note && <span className="text-xs text-ink/50 -mt-1">{note}</span>}
    </button>
  );
}
