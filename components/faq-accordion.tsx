import type { FaqItem } from "@/content/site";

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="panel depth-hover group rounded-[1.18rem] p-3.5 open:bg-[rgba(255,255,255,0.82)] sm:p-4"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-[0.94rem] font-medium text-[var(--foreground)] marker:content-none sm:text-[1rem]">
            <span>{item.question}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-sm leading-none text-[var(--accent-deep)] group-open:bg-[var(--accent-deep)] group-open:text-white">
              +
            </span>
          </summary>
          <p className="pt-3 text-[0.9rem] leading-6 text-[var(--muted-strong)] sm:text-[0.94rem]">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
