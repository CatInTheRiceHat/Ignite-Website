import React from 'react';
import { CircularTestimonials } from './components/ui/circular-testimonials';

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

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-cream)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex flex-col items-center justify-center">
          <a href="/" className="flex items-center gap-2 text-2xl font-rammetto text-[var(--primary-orange)]">
            <img src="/assets/Logo.png" alt="Ignite" className="w-8 h-8" />
            Ignite
          </a>
          <ul className="flex gap-6 mt-2 text-sm font-semibold">
            <li><a href="/" className="text-[var(--primary-orange)] border-b-2 border-[var(--primary-orange)]">Home</a></li>
            <li><a href="#" className="hover:text-[var(--primary-orange)] transition-colors">About</a></li>
            <li><a href="#" className="hover:text-[var(--primary-orange)] transition-colors">Mentors</a></li>
            <li><a href="#" className="hover:text-[var(--primary-orange)] transition-colors">Program</a></li>
            <li><a href="#" className="hover:text-[var(--primary-orange)] transition-colors text-[var(--primary-orange)] bg-[var(--bg-cream)] px-4 py-1 rounded-full border border-[var(--primary-orange)]">Apply</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden min-h-[90vh] flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-[var(--primary-orange)] leading-tight mb-6">
            Free Mentorship Program for Middle School Students
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-light)] mb-10 max-w-2xl mx-auto">
            A 6-week summer program for grades 6-8 to learn real-world skills and explore careers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-[var(--primary-orange)] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg">
              Apply Now 🔥
            </button>
            <button className="bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--bg-cream)] transition-colors">
              Learn More
            </button>
          </div>
        </div>
        <img 
          src="/assets/Hero.png" 
          alt="Hero" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl opacity-40 pointer-events-none"
        />
      </section>

      {/* What You'll Get */}
      <section className="py-24 bg-[url('/assets/What%20You%20ll%20Get.png')] bg-cover bg-center text-white relative">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto mb-4">What You'll Get</h2>
            <p className="text-xl opacity-90">Real skills. Real mentors. Zero cost.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '💼', title: 'Career Skills', desc: "Professional email, presentations, visual design — skills you'll use for life." },
              { icon: '💡', title: 'Career Exposure', desc: "Meet professionals from STEM, business, law, and entrepreneurship." },
              { icon: '🤝', title: '1-on-1 Mentorship', desc: "High school mentors who've been in your shoes and want to help." },
              { icon: '💸', title: '100% Free', desc: "No tuition, no fees, no hidden costs. Just bring your curiosity." },
              { icon: '📜', title: 'No Experience Needed', desc: "We welcome all students — no prior skills or grades required." },
              { icon: '🏆', title: 'Shark Tank Finale', desc: "End the summer pitching your ideas at our showcase event." }
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-colors">
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="opacity-90">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is Ignite For? */}
      <section className="py-24 bg-[url('/assets/The%20Who%20is%20Ignite%20For.png')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-white/80"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16 underline decoration-wavy">Who Is Ignite For?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: '🎓', title: 'Grades 6-8', desc: "Currently in middle school and ready to explore what's beyond the classroom." },
              { icon: '🌐', title: 'Online & Zoom', desc: "Fully remote and accessible on Zoom. Open to motivated students from anywhere!" },
              { icon: '✨', title: 'Curious Minds', desc: "You don't need to know your future — just bring curiosity and willingness to learn." }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl group-hover:rotate-12 transition-transform border-4 border-[var(--primary-orange)]">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                <p className="text-[var(--text-light)] text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Overview Carousel */}
      <section className="py-24 bg-[#f7f7fa] flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-4">Program Overview</h2>
          <p className="text-xl text-[var(--text-light)]">6 weeks. Life-changing skills.</p>
        </div>
        <div className="w-full max-w-[1456px] flex justify-center">
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

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xl font-rammetto text-[var(--primary-orange)]">
            <img src="/assets/Logo.png" alt="Ignite" className="w-6 h-6" />
            Ignite
          </div>
          <p className="text-gray-500 text-sm">Find your fire. © 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
