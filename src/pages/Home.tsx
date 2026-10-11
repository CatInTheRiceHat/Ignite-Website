import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
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
import { LEARNING_HUB_URL } from '../lib/links';
import { coursesInDevelopment, learningFormats } from '../data/program';

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
              <span className="block">Practical Skills.</span>
              <span className="block mt-[20px] md:mt-[28px]">Real Possibilities.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              Free online learning to help students manage everyday life, explore their interests, and build something of their own.
            </p>
          </BlurFade>
          <BlurFade delay={0.25}>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={LEARNING_HUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex w-full max-w-xs items-center justify-center gap-2 bg-[var(--primary-orange)] text-white px-8 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg sm:w-auto sm:px-10">
                Visit the Learning Hub
                <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
              </a>
              <Link to="/program" className="w-full max-w-xs bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] px-8 py-5 rounded-full font-bold text-xl hover:bg-orange-50 transition-all sm:w-auto sm:px-10">
                Explore the Program
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Current program structure */}
      <section className="bg-[var(--bg-cream)] py-20 md:py-24" aria-labelledby="home-formats-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 id="home-formats-heading" className="font-rammetto text-3xl text-[var(--primary-orange)] md:text-5xl">More ways to find your fire</h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-light)]">
              We’re expanding beyond our first summer cycle. Our team is developing {coursesInDevelopment.length} courses
              that combine practical skills, hands-on projects, and opportunities to learn independently or live.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {learningFormats.map((format) => (
              <article key={format.id} className="rounded-3xl border-2 border-orange-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-5">
                  <img src={format.image} alt="" className="h-16 w-16 flex-none object-contain" loading="lazy" />
                  <h3 className="text-2xl font-bold text-[var(--text-charcoal)]">{format.title}</h3>
                </div>
                <p className="mt-5 font-bold text-[var(--text-charcoal)]">{format.duration} · {format.commitment}</p>
                <p className="mt-4 leading-relaxed text-[var(--text-light)]">{format.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center leading-relaxed text-[var(--text-light)]">
            New courses are in development. <Link to="/program" className="font-bold text-[var(--text-charcoal)] underline underline-offset-4">Explore the catalog and our next steps</Link>.
          </p>
        </div>
      </section>

      {/* 2026 Summer Statistics */}
      <section className="bg-white py-16 shadow-sm md:py-20" aria-labelledby="home-statistics-heading">
        <div className="mx-auto max-w-7xl px-4">
          <BlurFade>
            <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
              <h2
                id="home-statistics-heading"
                className="font-rammetto text-4xl text-[var(--primary-orange)] md:text-5xl"
              >
                Our First Chapter: Summer 2026
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
          src="/backgrounds/What%20You%27ll%20Get.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/52 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <BlurFade>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">What You'll Get</h2>
              <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">Practical skills. Student-led learning. No cost.</p>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[
              { img: '/assets/Career%20Skills.png',   title: 'Useful Skills',       desc: "Practice email, presentations, design, planning, and more." },
              { img: '/assets/Mentorship.png',        title: 'Student-led Learning', desc: "Learn from students who create courses, share ideas, and help others practice." },
              { img: '/assets/Free.png',              title: '100% Free',           desc: "No tuition or fees." },
              { img: '/assets/No%20Experience.png',   title: 'Hands-on Practice',desc: "Try activities, create projects, and build skills you can keep using." }
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
      <section className="py-24 md:py-32 min-h-[54vw] relative overflow-hidden">
        <img
          src="/backgrounds/Who%20is%20Ignite%20For.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"></div>
        <div className="relative z-10">
          <BlurFade>
            <h2 className="text-4xl md:text-6xl font-rammetto text-center text-white mb-14 md:mb-16 px-4 drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]">Who Is Ignite For?</h2>
          </BlurFade>
          <FadingCarousel
            variant="light"
            imageStyle="open"
            autoPlay={false}
            items={[
              { image: '/mascots/Grades.png',  title: 'Students Exploring What’s Next', desc: "Course-specific levels and prerequisites will help you find the right starting point." },
              { image: '/mascots/Zoom.png',    title: 'More Ways to Learn', desc: "We’re developing independent online courses alongside live classes." },
              { image: '/mascots/Curious.png', title: 'Curious Students', desc: "You do not need to know what you want to do yet." },
            ]}
          />
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
          <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">Meet Our Team</h2>
          <p className="text-xl md:text-2xl text-white mb-14 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            Student creators, mentors, and organizers working together to make practical learning more accessible.
          </p>
          <div className="flex justify-center">
            <Link to="/team" className="bg-[var(--primary-orange)] text-white px-12 py-5 rounded-full font-bold text-2xl hover:scale-105 transition-all shadow-xl">
              Meet the Team
            </Link>
          </div>
        </BlurFade>
      </section>

      {/* Apply */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Find your next step</h2>
          <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed mb-10">
            Explore the courses we’re building and the skills you could practice. Visit our learning hub for course availability, or contact the team with questions about enrollment.
          </p>
          <a
            href={LEARNING_HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-orange-200"
          >
            Visit the Learning Hub
            <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
          </a>
        </div>
      </section>

    </div>
  );
};

export default Home;
