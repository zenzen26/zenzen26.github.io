interface MacWindowProps {
  title: string;
  children: React.ReactNode;
  /** Shows a close box in the title bar. */
  onClose?: () => void;
  /** Animate in/out on scroll (see useWindowReveal). */
  reveal?: boolean;
  className?: string;
  bodyClassName?: string;
}

/** Base classic-Mac window: pinstripe title bar, close box, beveled frame. */
export default function MacWindow({
  title,
  children,
  onClose,
  reveal = false,
  className = '',
  bodyClassName = '',
}: MacWindowProps) {
  return (
    <div
      data-win={reveal ? '' : undefined}
      className={`bevel-out bg-beige-light flex flex-col min-w-0 ${className}`}
    >
      <div className="flex items-center gap-2 border-b-2 border-ink bg-beige px-2 py-1">
        {onClose ? (
          <button
            type="button"
            aria-label="Close window"
            onClick={onClose}
            className="size-5 shrink-0 border-2 border-ink bg-beige-light hover:bg-ink cursor-pointer"
          />
        ) : (
          <span className="size-5 shrink-0" />
        )}
        <span className="titlebar-stripes h-4 flex-1" />
        <span className="font-pixel b2 px-2 bg-beige truncate max-w-[70%]">{title}</span>
        <span className="titlebar-stripes h-4 flex-1" />
        <span className="size-5 shrink-0" />
      </div>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
