import { RedirectArrow } from '../components/ui/redirect-arrow';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInView, useReducedMotion } from 'framer-motion';
import {
  BookOpenCheck,
  CalendarDays,
  Globe2,
  GraduationCap,
  Presentation,
  School,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';
import FadingCarousel from '../components/ui/fading-carousel';
import { programCopy } from '../data/program';
import { STUDENT_PREENROLLMENT_URL } from '../lib/links';
import FeaturedCourse from '../components/program/FeaturedCourse';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------


function CountStat({
  value,
  label,
  icon: Icon,
  mascot,
  suffix = '',
  featured = false,
}: {
  value: number;
  label: string;
  icon: LucideIcon;
  mascot?: string;
  suffix?: string;
  featured?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setDisplay(value);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let animationFrame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, shouldReduceMotion, value]);

  return (
    <div
      ref={ref}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border-2 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 ${
        featured
          ? 'min-h-60 justify-between border-[var(--primary-orange)] bg-[var(--primary-orange)] text-white shadow-orange-100 md:min-h-72'
          : 'min-h-44 items-center justify-center border-orange-100 bg-[var(--bg-cream)] text-center text-[var(--text-charcoal)] hover:border-orange-200 md:min-h-52'
      }`}
    >
      {mascot && (
        <img
          src={mascot}
          alt=""
          className="pointer-events-none absolute right-[-4.5rem] top-1/2 h-72 w-72 -translate-y-1/2 object-contain object-center opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 md:h-80 md:w-80"
          loading="lazy"
        />
      )}
      <div
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl ${
          featured ? 'bg-white/20 text-white' : 'bg-orange-100 text-[var(--primary-orange)]'
        }`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="relative z-10 mt-8">
        <span className="sr-only">{value}{suffix} </span>
        <p
          aria-hidden="true"
          className={`whitespace-nowrap font-rammetto text-5xl leading-none md:text-6xl ${
            featured ? 'text-white' : 'text-[var(--primary-orange)]'
          }`}
        >
          {display}{suffix}
        </p>
        <p className={`mt-3 text-base font-extrabold leading-snug md:text-lg ${featured ? 'text-white/95' : 'text-[var(--text-charcoal)]'}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

const featuredStatistics = [
  { value: 110, label: 'Students', icon: UsersRound, mascot: '/mascots/Curious.png' },
  { value: 295, label: 'Course selections', icon: BookOpenCheck, mascot: '/mascots/Laptop.png' },
  { value: 77, label: 'Schools', icon: School, mascot: '/mascots/Graduation.png' },
];

const programStatistics = [
  { value: 5, label: 'Countries / regions', icon: Globe2 },
  { value: 10, label: 'Live cohorts', icon: Presentation },
  { value: 3, label: 'Weeks', icon: CalendarDays },
  { value: 10, label: 'Mentors', icon: GraduationCap },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const Home = () => {
  return (
    <div className="bg-[var(--bg-cream)]">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pb-28 overflow-hidden flex items-center justify-center text-center px-4 min-h-[90vh]">
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src="/backgrounds/Hero.jpg?v=cada5551"
            alt=""
            className="h-full w-full object-cover object-[center_52%] md:object-[center_50%] lg:object-center"
            loading="eager"
          />
        </div>
        <div className="relative z-20 mx-auto w-full min-w-0 max-w-5xl">
          <BlurFade delay={0}>
            <h1 className="break-words text-[2.1rem] sm:text-5xl md:text-6xl lg:text-7xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
              <span className="block">Find Your Fire.</span>
              <span className="block mt-[20px] md:mt-[28px]">Build Skills</span>
              <span className="block mt-[20px] md:mt-[28px]">for Life.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              Ignite’s 50+ interns are building free live and independent courses in practical life skills. Student pre-enrollment is now open. Find what sparks your curiosity.
            </p>
          </BlurFade>
          <BlurFade delay={0.25}>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={STUDENT_PREENROLLMENT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex w-full max-w-xs items-center justify-center gap-2 bg-[var(--primary-orange)] text-white px-8 py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg sm:w-auto sm:px-10 font-sans font-bold text-button">
                Apply Now
                <RedirectArrow />
              </a>
              <Link to="/program" className="w-full max-w-xs bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] px-8 py-5 rounded-full hover:bg-orange-50 transition-all sm:w-auto sm:px-10 font-sans font-bold text-button">
                Explore Course Plans
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      <FeaturedCourse />

      {/* Summer 2026 Results */}
      <section className="relative grid overflow-hidden bg-[var(--text-charcoal)] shadow-sm" aria-labelledby="home-statistics-heading">
        <img
          src="/backgrounds/Summer.jpg?v=4f114139"
          alt=""
          className="col-start-1 row-start-2 -mt-8 block h-auto w-full self-end md:-mt-12 xl:row-start-1"
          width={2752}
          height={1536}
          loading="lazy"
        />
        <div className="relative z-10 col-start-1 row-start-1 mx-auto w-full max-w-7xl px-4 pt-12 pb-16 xl:self-center xl:py-6">
          <BlurFade>
            <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
              <h2
                id="home-statistics-heading"
                className="font-rammetto text-4xl text-white md:text-5xl drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]"
              >
                Summer 2026 Results
              </h2>
            </div>
          </BlurFade>

          <div className="grid gap-5 sm:grid-cols-3 md:gap-6">
            {featuredStatistics.map((stat) => (
              <CountStat key={stat.label} {...stat} featured />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 lg:grid-cols-4">
            {programStatistics.map((stat) => (
              <CountStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-24 md:py-32 min-h-[64vw] relative overflow-hidden">
        <img
          src="/backgrounds/Hero%202.jpg?v=ba7dbc62"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/52 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <BlurFade>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">Skills for Everyday Life</h2>
              <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">{programCopy.direction}</p>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { img: '/assets/Career%20Skills.png',   title: 'Useful Skills',       desc: "Build habits for managing time, communicating, staying safe online, and understanding money." },
              { img: '/assets/Mentorship.png',        title: 'Student-led Learning', desc: "Students help shape practical courses, building on our Summer 2026 mentorship program." },
              { img: '/assets/No%20Experience.png',   title: 'Stay Curious',       desc: "Start with what interests you. Check each course description for any prerequisites." }
            ].map((feature, i) => (
              <BlurFade key={i} delay={i * 0.08}>
                <div className="bg-white/90 backdrop-blur-md p-10 md:p-12 rounded-3xl border border-orange-50 hover:bg-white hover:shadow-xl transition-all duration-300 group h-full">
                  <img src={feature.img} alt={feature.title} className="h-14 w-14 object-contain mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-4">{feature.title}</h3>
                  <p className="text-lg text-[var(--text-light)] leading-relaxed">{feature.desc}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>


      {/* Who Is Ignite For? */}
      <section className="relative grid overflow-hidden bg-[var(--text-charcoal)] xl:min-h-[64vw]" aria-labelledby="home-audience-heading">
        <img
          src="/backgrounds/Hero%203.jpg?v=a3a5e919"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          width={2752}
          height={1536}
          loading="lazy"
        />
        <div className="relative z-10 col-start-1 row-start-1 flex min-h-svh w-full flex-col justify-center py-24 md:py-28 xl:self-center xl:py-16">
          <BlurFade>
            <h2 id="home-audience-heading" className="text-4xl md:text-6xl font-rammetto text-center text-white mb-10 px-4">Who Is Ignite For?</h2>
          </BlurFade>
          <FadingCarousel
            size="large"
            variant="light"
            imageStyle="open"
            autoPlay={false}
            items={[
              { image: '/mascots/Grades.png',  title: 'All Students', desc: programCopy.eligibility },
              { image: '/mascots/Zoom.png',    title: 'Online Learning Plans', desc: 'We are developing live and independent online courses. Student pre-enrollment is open; launch dates and class schedules are still being planned.' },
              { image: '/mascots/Curious.png', title: 'Curious Students', desc: "You do not need to know what you want to do yet." },
            ]}
          />
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="relative grid overflow-hidden">
        <img
          src="/backgrounds/Hero%204.jpg?v=f0898cf4"
          alt=""
          className="col-start-1 row-start-1 -mt-[6vw] block h-auto w-full self-end"
          width={2752}
          height={1536}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/48"></div>
        <BlurFade className="relative z-10 col-start-1 row-start-1 w-full max-w-7xl self-center mx-auto px-4 py-2 sm:-top-6 sm:py-8 lg:-top-12 xl:-top-28 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-rammetto text-white mb-2 sm:mb-4 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">Meet Our Team</h2>
          <p className="text-sm sm:text-xl md:text-2xl text-white mb-4 md:mb-8 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            Meet our 50+ interns helping students build skills and find their fire.
          </p>
          <div className="flex justify-center">
            <Link to="/team" className="bg-[var(--primary-orange)] text-white px-6 py-3 sm:px-12 sm:py-5 rounded-full hover:scale-105 transition-all shadow-xl font-sans font-bold text-button">
              Meet the Team
            </Link>
          </div>
        </BlurFade>
      </section>

    </div>
  );
};

export default Home;
