import { Link } from 'react-router-dom';

const programStructurePreview = [
  { icon: '📅', title: '6 Weeks', desc: 'A focused summer experience with flexible scheduling for families.' },
  { icon: '🤝', title: 'Open Cohorts', desc: 'Online learning circles where every student can participate and belong.' },
  { icon: '⏱️', title: '2-3 Hours/Week', desc: 'Live sessions plus independent projects that stay manageable.' },
  { icon: '🎯', title: 'Project-Based', desc: 'Students build confidence by making and presenting real work.' },
];

const programExperiencePreview = [
  {
    icon: <img src="/assets/Laptop.png" alt="Laptop icon" className="h-14 w-14 object-contain" />,
    title: 'Professional Communication',
    desc: 'Learn how to write emails, introduce yourself, and communicate clearly with mentors.'
  },
  {
    icon: <img src="/assets/Microphone.png" alt="Microphone icon" className="h-14 w-14 object-contain" />,
    title: 'Public Speaking',
    desc: 'Practice presenting ideas with confidence, structure, and a strong speaking voice.'
  },
  {
    icon: <img src="/assets/Trophy.png" alt="Trophy icon" className="h-14 w-14 object-contain" />,
    title: 'Final Showcase',
    desc: 'Wrap up the program by presenting your work and celebrating everything you created.'
  }
];

const Home = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Hero Section */}
      {/* Height control: edit min-h for mobile, md:min-h for tablet, lg:min-h for desktop. */}
      <section className="relative pt-32 pb-24 md:pb-28 overflow-hidden flex items-center justify-center text-center px-4 min-h-[50rem] md:min-h-[62rem] lg:min-h-[75rem]">
        {/* Crop control: keep object-cover, then tweak object-[x_y] per breakpoint to move the image focus. */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <img
            src="/assets/Hero.png"
            alt=""
            className="h-full w-full object-cover object-[center_52%] md:object-[center_50%] lg:object-center"
            loading="eager"
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            <span className="block">Free Mentorship</span>
            <span className="block mt-[20px] md:mt-[28px]">Program for Middle</span>
            <span className="block mt-[20px] md:mt-[28px]">School Students</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            A 6-week summer program for grades 6-8 to learn real-world skills and explore careers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all">
              Apply Now
            </button>
            <button className="bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] px-10 py-5 rounded-full font-bold text-xl hover:bg-orange-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      {/* Height control: this image is tall, so the desktop min-h is much larger here. */}
      <section className="pt-20 pb-28 md:pt-24 md:pb-36 relative overflow-hidden flex items-start min-h-[72rem] md:min-h-[96rem] lg:min-h-[130rem]">
        <img
          src="/assets/What%20You%27ll%20Get.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top md:object-[center_18%] lg:object-[center_22%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/52 backdrop-blur-[1px]"></div>
        {/* Text position: change translate-y to move the words down, or use -translate-y to move them up. */}
        {/* Text position: use exact values like translate-y-[100px] or -translate-y-[40px]. */}
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full translate-y-[100px] md:translate-y-[100px]">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">What You'll Get</h2>
            <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">Real skills. Real mentors. Zero cost.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { icon: '💼', title: 'Career Skills', desc: "Professional email, presentations, visual design — skills you'll use for life." },
              { icon: '💡', title: 'Career Exposure', desc: "Meet professionals from STEM, business, law, and entrepreneurship." },
              { icon: '🤝', title: '1-on-1 Mentorship', desc: "High school mentors who've been in your shoes and want to help." },
              { icon: '💸', title: '100% Free', desc: "No tuition, no fees, no hidden costs. Just bring your curiosity." },
              { icon: '📚', title: 'No Experience Needed', desc: "We welcome all students — no prior skills or grades required." },
              { icon: '🏆', title: 'Shark Tank Finale', desc: "End the summer pitching your ideas at our showcase event." }
            ].map((feature, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-md p-10 md:p-12 rounded-3xl border border-orange-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                <span className="text-5xl mb-5 block group-hover:scale-110 transition-transform">{feature.icon}</span>
                <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-4">{feature.title}</h3>
                <p className="text-lg text-[var(--text-light)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is Ignite For? */}
      {/* Crop control: replace object-center with object-[center_30%] style values if one screen size crops badly. */}
      <section className="relative overflow-hidden min-h-[44rem] md:min-h-0 bg-[var(--bg-cream)]">
        <img
          src="/assets/Who%20is%20Ignite%20For.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] md:hidden"
          loading="lazy"
        />
        <img
          src="/assets/Who%20is%20Ignite%20For.png"
          alt=""
          className="hidden md:block w-full h-auto"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/58 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          {/* Centering control: negative translate-y moves this block upward; positive moves it downward. */}
          <div className="max-w-7xl mx-auto w-full -translate-y-[100px]">
            <h2 className="text-4xl md:text-6xl font-rammetto text-center text-white mb-14 md:mb-20 drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]">Who Is Ignite For?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-14 text-center">
              {[
                { icon: '🎓', title: 'Grades 6-8', desc: "Currently in middle school and ready to explore what's beyond the classroom." },
                { icon: '🌐', title: 'Online & Zoom', desc: "Fully remote and accessible on Zoom. Open to motivated students from anywhere!" },
                { icon: '✨', title: 'Curious Minds', desc: "You don't need to know your future — just bring curiosity and willingness to learn." }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="bg-white w-28 h-28 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-7 shadow-lg group-hover:rotate-6 transition-all border-4 border-[var(--primary-orange)] font-bold">
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">{item.title}</h3>
                  <p className="text-lg text-white leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="relative overflow-hidden min-h-[56rem] md:min-h-[76rem] lg:min-h-[90rem] bg-[var(--bg-cream)] pt-20 pb-32 md:pt-24 md:pb-40 lg:pb-48">
        <img
          src="/assets/Program%20Overview.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_28%] md:hidden"
          loading="lazy"
        />
        <img
          src="/assets/Program%20Overview.png"
          alt=""
          className="hidden md:block absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,240,0.56),rgba(255,255,255,0.34),rgba(255,248,240,0.58))]"></div>
        <div className="relative z-10">
          {/* Vertical position: use mt-[...] here to move the whole Program Overview block down without cutting off the bottom. */}
          <div className="max-w-7xl mx-auto px-4 mt-[0px] md:mt-[50px]">
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">Program Overview</h2>
              <p className="text-xl md:text-2xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">A real preview of what students build, practice, and present.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-10 md:mb-12">
              {programStructurePreview.map((item, i) => (
                <div key={i} className="rounded-[2rem] border border-white/30 bg-white/85 backdrop-blur-md p-8 text-center shadow-lg">
                  <div className="mb-5 flex h-16 items-center justify-center text-4xl">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-3">{item.title}</h3>
                  <p className="text-base text-[var(--text-light)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {programExperiencePreview.map((item, i) => (
                <div key={i} className="rounded-[2rem] border border-white/30 bg-[rgba(26,26,46,0.74)] backdrop-blur-md p-8 text-left shadow-lg">
                  <div className="mb-5 flex h-14 items-center">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-lg text-white leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 md:mt-12 flex justify-center">
              <Link
                to="/program"
                className="inline-flex items-center justify-center rounded-full bg-white px-12 py-5 text-xl font-bold text-[var(--primary-orange)] transition-all hover:scale-105"
              >
                See Full Program
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Mentors Section */}
      <section className="relative overflow-hidden min-h-[52rem] md:min-h-0 bg-[var(--bg-cream)]">
         <img
            src="/assets/Meet%20Your%20Mentors.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top md:hidden"
            loading="lazy"
         />
         <img
            src="/assets/Meet%20Your%20Mentors.png"
            alt=""
            className="hidden md:block w-full h-auto"
            loading="lazy"
         />
         <div className="absolute inset-0 bg-white/48"></div>
         <div className="absolute inset-0 z-10 pt-20 pb-28 md:pt-24 md:pb-32">
           {/* Text position: use exact values like translate-y-[48px] or -translate-y-[24px]. */}
           <div className="max-w-7xl mx-auto px-4 text-center w-full translate-y-[48px] md:translate-y-[200px]">
              <h2 className="text-4xl md:text-6xl font-rammetto text-white mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]">Meet Your Mentors</h2>
              <p className="text-xl md:text-2xl text-white mb-14 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                 High school students who have been in your shoes and want to help you find your professional fire.
              </p>
              <div className="flex justify-center">
                 <button className="bg-[var(--primary-orange)] text-white px-12 py-5 rounded-full font-bold text-2xl hover:scale-105 transition-all shadow-xl">
                    Meet the Team
                 </button>
              </div>
           </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[var(--bg-cream)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[var(--primary-orange)] rounded-[3rem] p-12 md:p-14 text-center text-white shadow-2xl relative overflow-hidden group min-h-[24rem] flex items-center justify-center">
            <div className="absolute inset-y-0 right-0 w-full md:w-1/2 pointer-events-none opacity-15 sm:opacity-20 md:opacity-30">
              <img
                src="/assets/Mascot.png"
                alt=""
                className="h-full w-full object-contain object-right-bottom"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-orange)] via-[var(--primary-orange)] to-[rgba(240,123,42,0.88)]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-rammetto mb-6 text-white">
                <span className="block">Ready to Find</span>
                <span className="block mt-[16px] md:mt-[24px]">Your Fire?</span>
              </h2>
              <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto text-white">
                Applications are open for our completely online summer program. Everyone is accepted!
              </p>
              <button className="bg-white text-[var(--primary-orange)] px-12 py-6 rounded-full font-bold text-2xl hover:scale-110 active:scale-95 transition-all shadow-xl">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
