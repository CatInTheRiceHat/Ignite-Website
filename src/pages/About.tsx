import { Check } from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';

const About = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/mascots/Curious.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">About Ignite</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">Why we started and what we do.</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 relative overflow-hidden">
        <img
          src="/backgrounds/Story.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <BlurFade className="max-w-4xl mx-auto">
            <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-10 md:p-14 space-y-6 shadow-xl">
            <h2 className="text-4xl font-rammetto text-[var(--primary-orange)]">Our Story</h2>
            <p className="text-2xl font-semibold text-[var(--text-charcoal)]">
              "What do you want to be when you grow up?"
            </p>
            <div className="space-y-5 text-[var(--text-charcoal)] text-xl leading-relaxed">
              <p>
                You've probably been asked that since you were five. Nobody really updates the answer though.
                By the time you graduate college, a lot of the careers you're being pointed toward today will
                look different. Some might not exist the same way at all. That is not meant to scare anyone. It is
                just where things are heading.
              </p>
              <p>
                So the question isn't what job to pick. It's whether you actually know how to communicate,
                how to carry yourself, how to figure out what you're good at. That's harder to teach than
                it sounds, and most school curriculums aren't built for it.
              </p>
              <p>
                Ignite is a free summer program where high schoolers mentor 4th to 8th grade students on
                exactly that. They're close enough in age to remember what middle school actually felt like.
                That proximity matters more than any lesson plan.
              </p>
              <p className="text-xl font-bold text-[var(--text-charcoal)]">
                Right now, knowing yourself is more useful than knowing what job to aim for.
              </p>
            </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Access',
                desc: "We keep Ignite free so more students can try these classes without worrying about cost."
              },
              {
                title: 'Connection',
                desc: "We connect younger students with high school mentors who can answer questions and help them practice."
              },
              {
                title: 'Practice',
                desc: "We teach skills students can use right away, from professional communication to public speaking."
              }
            ].map((item, i) => (
              <BlurFade key={i} delay={i * 0.1}>
                <div className="bg-[var(--bg-cream)] p-10 rounded-3xl border-2 border-orange-50 hover:border-[var(--primary-orange)] transition-colors shadow-sm group h-full">
                  <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                  <p className="text-[var(--text-light)] text-lg leading-relaxed">{item.desc}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="pt-24 pb-48 relative overflow-hidden">
        <img
          src="/backgrounds/Matters.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-10 md:p-14 shadow-xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-4">Why This Matters</h2>
              <p className="text-xl text-[var(--text-light)]">Middle school is when students start asking: "What am I good at? What could I become?"</p>
            </div>
            <div className="grid gap-6">
              {[
                { text: "Many students do not get early access to this kind of support" },
                { text: "Trying new skills early can make school feel less confusing" },
                { text: "High school mentors can explain things in a way younger students understand" },
                { text: "Small wins help students feel more ready for what comes next" }
              ].map((item, i) => (
                <BlurFade key={i} delay={i * 0.08}>
                  <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border-l-8 border-[var(--primary-orange)] hover:translate-x-2 transition-transform">
                    <div className="bg-orange-100 text-[var(--primary-orange)] p-2 rounded-lg">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-lg font-semibold text-[var(--text-charcoal)]">{item.text}</p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
