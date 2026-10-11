import { Link } from 'react-router-dom';
import BlurFade from '../ui/blur-fade';
import { courseCounts, programCopy } from '../../data/program';

const Expansion = () => (
  <section className="py-20 md:py-24" aria-labelledby="expansion-heading">
    <div className="max-w-5xl mx-auto px-4">
      <BlurFade>
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border-2 border-orange-100">
          <img src="/mascots/Lightbulb.png" alt="" className="h-16 w-16 object-contain mb-6" loading="lazy" />
          <h2 id="expansion-heading" className="text-3xl md:text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Growing With You</h2>
          <p className="text-lg text-[var(--text-light)] leading-relaxed mb-4">{programCopy.expansion}</p>
          <p className="text-lg text-[var(--text-charcoal)] font-bold mb-4">{courseCounts.all} courses in development: {courseCounts.live} live and {courseCounts.independent} independent.</p>
          <p className="text-[var(--text-light)] leading-relaxed mb-6">{programCopy.proposals}</p>
          <Link to="/program#course-catalog" className="inline-flex rounded-full bg-orange-50 px-6 py-3 font-bold text-[var(--text-charcoal)] hover:bg-orange-100 transition-colors">Explore the Course Plans</Link>
        </div>
      </BlurFade>
    </div>
  </section>
);

export default Expansion;
