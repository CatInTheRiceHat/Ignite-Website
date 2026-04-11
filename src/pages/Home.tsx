import React from 'react';
import { CircularTestimonials } from '../components/ui/circular-testimonials';

const testimonials = [
  {
    quote: "I was impressed by the food! And I could really tell that they use high-quality ingredients. The staff was friendly and attentive. I'll definitely be back for more!",
    name: "Tamar Mendelson",
    designation: "Restaurant Critic",
    src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "This place exceeded all expectations! The atmosphere is inviting, and the staff truly goes above and beyond. I'll keep returning for more exceptional dining experience.",
    name: "Joe Charlescraft",
    designation: "Frequent Visitor",
    src: "https://images.unsplash.com/photo-1628749528992-f5702133b686?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
  },
  {
    quote: "Shining Yam is a hidden gem! The impeccable service and overall attention to detail created a memorable experience. I highly recommend it!",
    name: "Martina Edelweist",
    designation: "Satisfied Customer",
    src: "https://images.unsplash.com/photo-1524267213992-b76e8577d046?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
  },
];

const Home = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden min-h-[85vh] flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto relative z-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-rammetto text-[var(--primary-orange)] leading-[1.2] mb-6 drop-shadow-sm">
            Free Mentorship Program for Middle School Students
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-light)] mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            A 6-week summer program for grades 6-8 to learn real-world skills and explore careers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-[var(--primary-orange)] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-100">
              Apply Now 🔥
            </button>
            <button className="bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Placed as a background element to prevent bleeding/overlap while maintaining visual interest */}
        <div className="absolute top-1/2 right-[-5%] md:right-[0%] w-[60%] h-[80%] -translate-y-1/2 z-10 opacity-20 pointer-events-none hidden sm:flex items-center justify-end">
            <img 
              src="/assets/Hero.png" 
              alt="" 
              className="max-w-full max-h-full object-contain object-right"
            />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-cream)] via-transparent to-[var(--bg-cream)] z-15 pointer-events-none opacity-40"></div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-24 relative overflow-hidden bg-[url('/assets/What%20You%20ll%20Get.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-4">What You'll Get</h2>
            <p className="text-lg md:text-xl text-[var(--text-charcoal)] font-semibold">Real skills. Real mentors. Zero cost.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '💼', title: 'Career Skills', desc: "Professional email, presentations, visual design — skills you'll use for life." },
              { icon: '💡', title: 'Career Exposure', desc: "Meet professionals from STEM, business, law, and entrepreneurship." },
              { icon: '🤝', title: '1-on-1 Mentorship', desc: "High school mentors who've been in your shoes and want to help." },
              { icon: '💸', title: '100% Free', desc: "No tuition, no fees, no hidden costs. Just bring your curiosity." },
              { icon: '📚', title: 'No Experience Needed', desc: "We welcome all students — no prior skills or grades required." },
              { icon: '🏆', title: 'Shark Tank Finale', desc: "End the summer pitching your ideas at our showcase event." }
            ].map((feature, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-orange-50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{feature.icon}</span>
                <h3 className="text-xl font-bold text-[var(--text-charcoal)] mb-3">{feature.title}</h3>
                <p className="text-[var(--text-light)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is Ignite For? */}
      <section className="py-24 relative bg-[url('/assets/Who%20is%20Ignite%20For.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16 underline decoration-wavy decoration-orange-200">Who Is Ignite For?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: '🎓', title: 'Grades 6-8', desc: "Currently in middle school and ready to explore what's beyond the classroom." },
              { icon: '🌐', title: 'Online & Zoom', desc: "Fully remote and accessible on Zoom. Open to motivated students from anywhere!" },
              { icon: '✨', title: 'Curious Minds', desc: "You don't need to know your future — just bring curiosity and willingness to learn." }
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="bg-white w-24 h-24 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg group-hover:rotate-6 transition-all border-4 border-[var(--primary-orange)] font-bold">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-4">{item.title}</h3>
                <p className="text-[var(--text-light)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Overview Carousel */}
      <section className="py-24 relative flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12 relative z-10">
          <h2 className="text-3xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-4">Program Overview</h2>
          <p className="text-xl text-[var(--text-light)]">6 weeks. Life-changing skills.</p>
        </div>
        <div className="w-full max-w-[1456px] flex justify-center relative z-10">
          <CircularTestimonials
            testimonials={testimonials}
            autoplay={true}
            colors={{
              name: "#F07B2A",
              designation: "#454545",
              testimony: "#171717",
              arrowBackground: "#141414",
              arrowForeground: "#f1f1f7",
              arrowHoverBackground: "#F07B2A",
            }}
            fontSizes={{
              name: "28px",
              designation: "20px",
              quote: "20px",
            }}
          />
        </div>
      </section>

      {/* Meet Your Mentors Section */}
      <section className="py-24 relative overflow-hidden bg-[url('/assets/Meet%20Your%20Mentors.png')] bg-cover bg-center">
         <div className="absolute inset-0 bg-white/70"></div>
         <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-8">Meet Your Mentors</h2>
            <p className="text-xl md:text-2xl text-[var(--text-light)] mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
               High school students who have been in your shoes and want to help you find your professional fire.
            </p>
            <div className="flex justify-center">
               <button className="bg-[var(--primary-orange)] text-white px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl">
                  Meet the Team 🔥
               </button>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[var(--bg-cream)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[var(--primary-orange)] rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-rammetto mb-6 text-white leading-tight">Ready to Find Your Fire?</h2>
              <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto text-white">
                Applications are open for our completely online summer program. Everyone is accepted!
              </p>
              <button className="bg-white text-[var(--primary-orange)] px-10 py-5 rounded-full font-bold text-xl hover:scale-110 active:scale-95 transition-all shadow-xl">
                Apply Now! 🔥
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
