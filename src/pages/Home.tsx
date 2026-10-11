import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  BookOpenCheck,
  CalendarDays,
  Compass,
  Globe2,
  GraduationCap,
  Lightbulb,
  Presentation,
  School,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';
import FadingCarousel from '../components/ui/fading-carousel';
import RecognitionSection from '../components/home/RecognitionSection';

import StudentApplicationButton from '../components/ui/student-application-button';

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
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || shouldReduceMotion || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    let animationFrame = 0;
    let observer: IntersectionObserver | undefined;
    try {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / 1000, 1);
          setDisplay(Math.round((1 - Math.pow(1 - progress, 3)) * value));
          if (progress < 1) animationFrame = requestAnimationFrame(tick);
        };
        animationFrame = requestAnimationFrame(tick);
      });
      observer.observe(element);
    } catch { setDisplay(value); }
    return () => { observer?.disconnect(); cancelAnimationFrame(animationFrame); };
  }, [shouldReduceMotion, value]);

  return (
    <div
      ref={ref}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border-2 p-6 shadow-sm transition-all duration-300 hover:shadow-xl md:p-8 ${
        featured
          ? 'min-h-60 justify-between border-[var(--primary-orange)] bg-[var(--primary-orange)] text-[var(--text-charcoal)] shadow-orange-100 md:min-h-72'
          : 'min-h-44 items-center justify-center border-orange-100 bg-[var(--bg-cream)] text-center text-[var(--text-charcoal)] hover:border-orange-200 md:min-h-52'
      }`}
    >
      {mascot && (
        <img
          src={mascot}
          alt=""
          className="pointer-events-none absolute right-[-4.5rem] top-1/2 h-72 w-72 -translate-y-1/2 object-contain object-center opacity-20 transition-transform duration-500 md:h-80 md:w-80"
          loading="lazy"
        />
      )}
      <div
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl ${
          featured ? 'bg-white/30 text-[var(--text-charcoal)]' : 'bg-orange-100 text-[var(--primary-orange)]'
        }`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="relative z-10 mt-8">
        <span className="sr-only">{value}{suffix} </span>
        <p
          aria-hidden="true"
          className={`whitespace-nowrap font-rammetto text-5xl leading-none md:text-6xl ${
            featured ? 'text-[var(--text-charcoal)]' : 'text-[var(--text-charcoal)]'
          }`}
        >
          {display}{suffix}
        </p>
        <p className={`mt-3 text-base font-extrabold leading-snug md:text-lg ${featured ? 'text-[var(--text-charcoal)]' : 'text-[var(--text-charcoal)]'}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

const featuredStatistics = [
  { value: 110, label: 'Applications', icon: UsersRound, mascot: '/mascots/Curious.png' },
  { value: 295, label: 'Course selections', icon: BookOpenCheck, mascot: '/mascots/Laptop.png' },
  { value: 77, label: 'Schools', icon: School, mascot: '/mascots/Graduation.png' },
];

const programStatistics = [
  { value: 5, label: 'Countries / regions', icon: Globe2 },
  { value: 10, label: 'Live cohorts', icon: Presentation },
  { value: 3, label: 'Weeks', icon: CalendarDays },
  { value: 10, label: 'Mentors', icon: GraduationCap },
];

const expansionDirections = [
  { icon: CalendarDays, title: 'Beyond Summer', description: 'We aim to expand learning beyond our original June/July summer cycle.' },
  { icon: Lightbulb, title: 'Life Skills for the Future', description: 'We are working toward a broader platform for practical life skills.' },
  { icon: Compass, title: 'Explore Your Direction', description: 'We want to help students explore careers and make intentional choices about their next steps.' },
  { icon: BookOpenCheck, title: 'More Ways to Learn', description: 'We plan to expand our curriculum and help more students access learning.' },
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
            src="/backgrounds/Hero.png"
            alt=""
            className="h-full w-full object-cover object-[center_52%] md:object-[center_50%] lg:object-center"
            loading="eager"
          />
        </div>
        <div className="relative z-20 mx-auto w-full min-w-0 max-w-5xl">
          <BlurFade delay={0}>
            <h1 className="break-words text-[2.1rem] sm:text-5xl md:text-6xl lg:text-7xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
              <span className="block">Practical<span className="hidden sm:inline"> Skills</span></span>
              <span className="block mt-[14px] sm:hidden">Skills</span>
              <span className="block mt-[20px] md:mt-[28px]">for Everyday</span>
              <span className="block mt-[20px] md:mt-[28px]">Life</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p className="text-lg sm:text-xl md:text-2xl text-white bg-[var(--text-charcoal)] rounded-2xl px-4 py-3 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Ignite is growing a free online learning platform for practical life skills and career exploration.
            </p>
          </BlurFade>
          <BlurFade delay={0.25}>
            <div className="flex flex-wrap gap-4 justify-center">
              <StudentApplicationButton className="inline-flex w-full max-w-xs items-center justify-center gap-2 bg-[var(--primary-orange)] text-[var(--text-charcoal)] px-8 py-5 rounded-full font-bold text-xl transition-all shadow-lg sm:w-auto sm:px-10" />
              <Link to="/program" className="ignite-button w-full max-w-xs bg-white text-[var(--text-charcoal)] border-2 border-[var(--primary-orange)] px-8 py-5 rounded-full font-bold text-xl hover:bg-orange-50 transition-all sm:w-auto sm:px-10">
                Learn More
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* 2026 Summer Statistics */}
      <section className="bg-white py-16 shadow-sm md:py-20" aria-labelledby="home-statistics-heading">
        <div className="mx-auto max-w-7xl px-4">
          <BlurFade>
            <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
              <h2
                id="home-statistics-heading"
                className="font-rammetto text-4xl text-[var(--text-charcoal)] md:text-5xl"
              >
                2026 Summer Statistics
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--text-light)]">A look back at our first summer cycle.</p>
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
          src="/backgrounds/What%20You%27ll%20Get.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <BlurFade>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-rammetto text-[var(--text-charcoal)] mb-6">Skills for Real Life</h2>
              <p className="text-xl md:text-2xl text-[var(--text-charcoal)] font-semibold leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">Practical skills. Student-led learning. A mission to keep access free.</p>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[
              { img: '/assets/Career%20Skills.png',   title: 'Useful Skills',       desc: "We’re developing activities in communication, design, planning, and more." },
              { img: '/assets/Mentorship.png',        title: 'Student-led Learning', desc: "Our team is developing guided activities and practical projects." },
              { img: '/assets/Free.png',              title: 'Free Learning',           desc: "Our mission is to keep practical skills learning free." },
              { img: '/assets/No%20Experience.png',   title: 'Room to Explore',desc: "Explore your interests. Check each course’s participation details before joining." }
            ].map((feature, i) => (
              <BlurFade key={i} delay={i * 0.08}>
                <div className="bg-white/90 backdrop-blur-md p-10 md:p-12 rounded-3xl border border-orange-50 hover:bg-white hover:shadow-xl transition-all duration-300 group h-full">
                  <img src={feature.img} alt={feature.title} className="h-14 w-14 object-contain mb-5 transition-transform" />
                  <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-4">{feature.title}</h3>
                  <p className="text-lg text-[var(--text-light)] leading-relaxed">{feature.desc}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>


      {/* Who Is Ignite For? */}
      <section className="py-24 md:py-32 min-h-[54vw] relative overflow-hidden">
        <img
          src="/backgrounds/Who%20is%20Ignite%20For.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-[var(--text-charcoal)] opacity-70 backdrop-blur-[1px]"></div>
        <div className="relative z-10">
          <BlurFade>
            <h2 className="text-4xl md:text-6xl font-rammetto text-center text-white mb-14 md:mb-16 px-4">Who Is Ignite For?</h2>
          </BlurFade>
          <FadingCarousel
            variant="light"
            imageStyle="open"
            autoPlay={false}
            mascotMotion
            items={[
              { image: '/mascots/Lightbulb.png', title: 'Students Ready to Learn', desc: "For students who want to build useful skills and explore their interests." },
              { image: '/mascots/Zoom.png',    title: 'Online Learning', desc: "Online courses are in development. Check the Program page for availability and participation details." },
              { image: '/mascots/Curious.png', title: 'Curious Students', desc: "You do not need to know what you want to do yet." },
            ]}
          />
        </div>
      </section>

      {/* Future direction, separate from current program offerings. */}
      <section className="py-16 md:py-24" aria-labelledby="home-expansion-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--text-light)]">Our Future Direction</p>
            <h2 id="home-expansion-heading" className="font-rammetto text-3xl text-[var(--text-charcoal)] sm:text-4xl md:text-5xl">Where Ignite Is Going</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-light)]">Our next chapter builds on our first summer cycle. These are the goals we are working toward as Ignite grows.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {expansionDirections.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[var(--text-charcoal)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-charcoal)]">{title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-[var(--text-light)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-24 md:py-32 min-h-[57vw] relative overflow-hidden">
        <img
          src="/backgrounds/Meet%20Your%20Mentors.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/48"></div>
        <BlurFade className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-rammetto text-[var(--text-charcoal)] mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">Meet Our Team</h2>
          <p className="text-xl md:text-2xl text-[var(--text-charcoal)] mb-14 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            High school students who remember what it is like to be in your spot.
          </p>
          <div className="flex justify-center">
            <Link to="/team" className="ignite-button bg-[var(--primary-orange)] text-[var(--text-charcoal)] px-12 py-5 rounded-full font-bold text-2xl transition-all shadow-xl">
              Meet the Team
            </Link>
          </div>
        </BlurFade>
      </section>

      <RecognitionSection />

      {/* Apply */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--text-charcoal)] mb-6">Find Your Fire</h2>
          <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed mb-10">
            Ready to practice useful skills and explore your interests? Learn more about Ignite’s free online program.
          </p>
          <StudentApplicationButton className="inline-flex items-center justify-center gap-2 bg-[var(--primary-orange)] text-[var(--text-charcoal)] px-10 py-5 rounded-full font-bold text-xl transition-all shadow-lg" />
        </div>
      </section>

    </div>
  );
};

export default Home;
