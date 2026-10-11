import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { CONTACT_URL, STUDENT_APPLICATION_URL } from '../../lib/links';

export default function StudentApplicationButton({ className, compact = false }: { className: string; compact?: boolean }) {
  const noteId = useId();
  const content = <>Apply Now<ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" /></>;
  if (STUDENT_APPLICATION_URL) {
    return <a href={STUDENT_APPLICATION_URL} target="_blank" rel="noopener noreferrer" className={`ignite-button ${className}`} data-student-application>{content}<span className="sr-only"> (student application; opens in a new tab)</span></a>;
  }
  return (
    <div className={`flex flex-col ${compact ? 'items-center gap-1' : 'items-center gap-3'}`}>
      <button type="button" disabled aria-describedby={noteId} className={`ignite-button ${className} cursor-not-allowed`} data-student-application>{content}</button>
      <p id={noteId} className={`${compact ? 'text-xs max-w-[10rem]' : 'text-sm max-w-xs'} rounded-lg bg-[var(--bg-cream)] px-2 py-1 text-[var(--text-charcoal)] font-semibold leading-relaxed text-center`}>
        <a href={CONTACT_URL} className="rounded underline underline-offset-4">Contact Ignite</a> for student application details.
      </p>
    </div>
  );
}
