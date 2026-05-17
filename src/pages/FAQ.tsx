const FAQ = () => {
  const faqs = [
    { question: 'Is it free?', answer: 'Yes! Ignite is 100% free. No tuition, no materials fees, no hidden costs. We believe every student deserves access to mentorship regardless of budget.' },
    { question: 'How long is the program?', answer: '3 weeks during the summer, offered as one session. We keep it short so it actually fits in your summer.' },
    { question: 'What\'s the time commitment?', answer: 'Classes meet Monday through Thursday, 12–1 pm and 3–4 pm. Fridays are 12–1 pm for presentations. It\'s consistent and easy to plan around.' },
    { question: 'Is experience required?', answer: 'Not at all! We welcome all students regardless of prior skills or grades. Just bring curiosity and willingness to learn.' },
    { question: 'Who are the mentors?', answer: 'High school students from local schools who have been trained to mentor. They\'re relatable, approachable, and genuinely care about helping you succeed.' },
    { question: 'Who can apply?', answer: 'Any student from elementary through middle school. We especially encourage underrepresented students to apply, but all curious minds are welcome.' },
    { question: 'Where is it held?', answer: 'The program is entirely online and on Zoom. You can join from anywhere!' },
    { question: 'How do I get accepted?', answer: 'Our application is completely open! Since the program is online, we don\'t select people—everyone who applies is welcome.' },
    { question: 'What do students get at the end?', answer: 'Students receive a certificate of completion, mentor connections, and new skills and confidence they can use right away.' },
    { question: 'How do I contact you?', answer: 'Email us at ignite.saratoga@gmail.com with any questions not answered here. We typically respond within 24-48 hours.' },
  ];

  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">FAQ</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">Got questions? We've got answers.</p>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-l-[12px] border-[var(--primary-orange)] group">
                <div className="flex items-center gap-4 mb-4">
                   <span className="h-3 w-3 rounded-full bg-[var(--primary-orange)] group-hover:scale-125 transition-transform" aria-hidden="true"></span>
                   <h3 className="text-2xl font-display font-extrabold text-[var(--text-charcoal)]">{faq.question}</h3>
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
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-[var(--primary-orange)] mb-6">Still Have Questions?</h2>
            <p className="text-xl text-[var(--text-light)] mb-10 max-w-2xl mx-auto">
              We're here to help! Reach out and we'll get back to you as soon as possible.
            </p>
            <a 
              href="mailto:ignite.saratoga@gmail.com" 
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
