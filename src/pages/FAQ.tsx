import { programFaqs } from '../data/program';

const FAQ = () => {


  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/mascots/Puzzled.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">FAQ</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">Got questions? We've got answers.</p>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programFaqs.map((faq, index) => (
              <div key={index} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-l-[12px] border-[var(--primary-orange)] group">
                <div className="mb-4">
                   <h2 className="text-2xl font-display font-extrabold text-[var(--text-charcoal)]">{faq.question}</h2>
                </div>
                <p className="text-[var(--text-light)] text-lg leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-6">Still Have Questions?</h2>
            <p className="text-xl text-[var(--text-light)] mb-10 max-w-2xl mx-auto">
              Send us an email and we will get back to you as soon as we can.
            </p>
            <a 
              href="mailto:ignitefindyourfire@gmail.com" 
              className="inline-block bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg hover:shadow-orange-200"
            >
              Email Us
            </a>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
