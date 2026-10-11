import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { programCopy } from '../../data/program';
import { LEARNING_HUB_URL } from '../../lib/links';

const ProgramNextSteps = () => (
  <section className="py-24 bg-white rounded-t-[4rem]" aria-labelledby="program-next-steps-heading">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 id="program-next-steps-heading" className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">What’s Next?</h2>
      <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed mb-4">{programCopy.availability}</p>
      <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed mb-8">
        A current student application link has not been confirmed. The learning hub opens a Moodle sign-in page.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a href={LEARNING_HUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[var(--primary-orange)] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg">
          Learning Hub (Moodle Sign-in)
          <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
        </a>
        <Link to="/faq" className="inline-flex items-center justify-center bg-orange-50 text-[var(--text-charcoal)] px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-100 transition-colors">Program FAQ</Link>
      </div>
    </div>
  </section>
);

export default ProgramNextSteps;
