import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import BlurFade from '../components/ui/blur-fade';
import FadingCarousel from '../components/ui/fading-carousel';
import { APPLY_FORM_URL } from '../lib/links';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------


function CountStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center px-6 md:px-8 py-4">
      <p className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">
        {display}{suffix}
      </p>
      <p className="text-sm md:text-base text-[var(--text-light)] font-semibold mt-1">{label}</p>
    </div>
  );
}

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
            src="/assets/Hero.png"
            alt=""
            className="h-full w-full object-cover object-[center_52%] md:object-[center_50%] lg:object-center"
            loading="eager"
          />
        </div>
        <div className="max-w-5xl mx-auto relative z-20">
          <BlurFade delay={0}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
              <span className="block">Free Mentorship</span>
              <span className="block mt-[20px] md:mt-[28px]">Program for</span>
              <span className="block mt-[20px] md:mt-[28px]">Students</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.15}>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              A free online program where students learn useful skills with high school mentors.
            </p>
          </BlurFade>
          <BlurFade delay={0.25}>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={APPLY_FORM_URL} target="_blank" rel="noopener noreferrer" className="bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                Apply Now
              </a>
              <Link to="/program" className="bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] px-10 py-5 rounded-full font-bold text-xl hover:bg-orange-50 transition-all">
                Learn More
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Impact Stats Row */}
      <section className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:divide-x divide-y sm:divide-y-0 divide-orange-100">
            <CountStat value={3} label="Weeks" />
            <CountStat value={100} label="Free" suffix="%" />
            <CountStat value={7} label="Mentors" />
            <div className="text-center px-6 md:px-8 py-4">
              <p className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">K-8</p>
              <p className="text-sm md:text-base text-[var(--text-light)] font-semibold mt-1">Grade Levels Welcome</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-24 md:py-32 min-h-[64vw] relative overflow-hidden">
        <img
          src="/assets/What%20You%27ll%20Get.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/52 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <BlurFade>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">What You'll Get</h2>
              <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">Useful classes. High school mentors. No cost.</p>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[
              { img: '/assets/Career%20Skills.png',   title: 'Useful Skills',       desc: "Practice email, presentations, design, planning, and more." },
              { img: '/assets/Mentorship.png',        title: 'High School Mentorship', desc: "Learn from high school mentors who've been in your shoes and want to help." },
              { img: '/assets/Free.png',              title: '100% Free',           desc: "No tuition or fees." },
              { img: '/assets/No%20Experience.png',   title: 'No Experience Needed',desc: "You do not need prior experience or perfect grades." }
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
          src="/assets/Who%20is%20Ignite%20For.png"
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
              { image: '/assets/Grades.png',  title: 'Elementary to Middle School',    desc: "Best for upper elementary and middle school students." },
              { image: '/assets/Zoom.png',    title: 'Online & Zoom', desc: "Classes are on Zoom, so students can join from home." },
              { image: '/assets/Curious.png', title: 'Curious Students', desc: "You do not need to know what you want to do yet." },
            ]}
          />
        </div>
      </section>

      {/* Meet Your Mentors Section */}
      <section className="py-24 md:py-32 min-h-[57vw] relative overflow-hidden">
        <img
          src="/assets/Meet%20Your%20Mentors.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/48"></div>
        <BlurFade className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">Meet Your Mentors</h2>
          <p className="text-xl md:text-2xl text-white mb-14 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            High school students who remember what it is like to be in your spot.
          </p>
          <div className="flex justify-center">
            <Link to="/mentors" className="bg-[var(--primary-orange)] text-white px-12 py-5 rounded-full font-bold text-2xl hover:scale-105 transition-all shadow-xl">
              Meet the Team
            </Link>
          </div>
        </BlurFade>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[var(--bg-cream)]">
        <div className="max-w-4xl mx-auto px-4">
          <BlurFade>
            <div className="bg-[var(--primary-orange)] rounded-[3rem] p-12 md:p-14 text-center text-white shadow-2xl relative overflow-hidden min-h-[24rem] flex items-center justify-center">
              <div className="absolute inset-y-0 right-0 w-full md:w-1/2 pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
                <img
                  src="/assets/Celebrate.png"
                  alt=""
                  className="h-full w-full object-contain object-right-bottom"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-orange)] via-[var(--primary-orange)] to-[rgba(240,123,42,0.88)]"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-rammetto mb-6 text-white">
                  <span className="block">Ready to</span>
                  <span className="block mt-[16px] md:mt-[24px]">Sign Up?</span>
                </h2>
                <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto text-white">
                  Applications are open for our completely online summer program. Everyone is accepted!
                </p>
                <a
                  href={APPLY_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-[var(--primary-orange)] px-12 py-6 rounded-full font-bold text-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </div>
  );
};

export default Home;
