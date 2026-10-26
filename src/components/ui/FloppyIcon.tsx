interface FloppyIconProps {
  label: string;
  caption?: string;
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
export default function FloppyIcon({ label, caption, imageUrl, tone = 'ink', onClick, className = '' }: FloppyIconProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex flex-col items-center gap-2 text-center cursor-pointer outline-none ${className}`}
    >
      <div
        className={`${CASE[tone]} relative aspect-square w-full max-w-[160px] transition-transform duration-150 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]`}
      >
        {/* metal shutter */}
        <div className="absolute left-[26%] top-0 h-[28%] w-[48%] bg-grey">
          <div className="absolute right-[16%] top-[18%] h-[60%] w-[18%] bg-ink" />
        </div>
        {/* label */}
        <div className="absolute inset-x-[10%] bottom-0 h-[52%] bg-beige-light overflow-hidden">
          {imageUrl ? (
            <div className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
          ) : (
            <div className="flex size-full items-center justify-center font-pixel text-ink/60">{label.slice(0, 6)}</div>
          )}
        </div>
      </div>
      <span className="b2 px-1 line-clamp-2 group-hover:bg-ink group-hover:text-beige-light group-focus-visible:bg-ink group-focus-visible:text-beige-light">
        {label}
      </span>
      {caption && <span className="b3 text-ink/60 -mt-1">{caption}</span>}
    </button>
  );
}
