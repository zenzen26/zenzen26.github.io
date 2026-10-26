import { Fragment } from 'react';
import MacWindow from '@/components/ui/MacWindow';

const DETAILS: [label: string, items: string[]][] = [
  ['Languages', ['English (Native)', 'Mandarin (Native)']],
  ['Certificates', ['iCAT Foundations', 'Working with Children Check', 'LCCI Level 2 in Bookkeeping & Accounting']],
  ['Education', ['Bachelor of Computing Science (First Class Honours)']],
  ['Contact', ['+61 450 190 503', 'thamzien@gmail.com']],
];

/** "README.md": a classic About-This-Mac style dialog with the personal details. */
export default function ReadmeWindow() {
  return (
    <MacWindow title="README.md" reveal className="mx-auto max-w-3xl" bodyClassName="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        <div className="flex shrink-0 flex-col items-center gap-2 sm:w-36">
          <div className="bevel-in bg-forest size-28 flex items-center justify-center">
            <img src="/favicon.png" alt="" width={80} height={80} className="size-20 object-contain" />
          </div>
          <p className="font-pixel text-xl text-center">Zi En Tham</p>
          <p className="b3 text-ink/60">ZEN OS 1.0</p>
        </div>
        <dl className="flex-1 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 b2">
          {DETAILS.map(([label, items]) => (
            <Fragment key={label}>
              <dt className="font-pixel text-moss">{label}</dt>
              <dd>
                {items.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </MacWindow>
  );
}
