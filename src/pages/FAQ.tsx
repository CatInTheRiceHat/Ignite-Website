import React from 'react';

const FAQ = () => {
  const faqs = [
    { question: 'Is it free?', answer: 'Yes! Ignite is 100% free. No tuition, no materials fees, no hidden costs. We believe every student deserves access to mentorship regardless of budget.', icon: '💸' },
    { question: 'How long is the program?', answer: '6 weeks during the summer. We design activities to fit around family vacations and other summer commitments.', icon: '📅' },
    { question: 'What\'s the time commitment?', answer: 'About 2-3 hours per week, including live sessions and independent projects. We keep it manageable so students can enjoy their summer.', icon: '⏱️' },
    { question: 'Is experience required?', answer: 'Not at all! We welcome all students regardless of prior skills or grades. Just bring curiosity and willingness to learn.', icon: '📚' },
    { question: 'Who are the mentors?', answer: 'High school students from local schools who have been trained to mentor. They\'re relatable, approachable, and genuinely care about helping you succeed.', icon: '👥' },
    { question: 'Who can apply?', answer: 'Any student currently in grades 6-8. We especially encourage underrepresented students to apply, but all curious minds are welcome.', icon: '🎓' },
    { question: 'Where is it held?', answer: 'The program is entirely online and on Zoom. You can join from anywhere!', icon: '📍' },
    { question: 'How do I get accepted?', answer: 'Our application is completely open! Since the program is online, we don\'t select people—everyone who applies is welcome.', icon: '📋' },
    { question: 'What do students get at the end?', answer: 'Students receive a certificate of completion, a portfolio of work they can showcase, mentor connections, and most importantly — new skills and confidence.', icon: '🏆' },
    { question: 'How do I contact you?', answer: 'Email us at ignite.saratoga@gmail.com with any questions not answered here. We typically respond within 24-48 hours.', icon: '📧' },
  ];

  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center rounded-b-[4rem] shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">FAQ 🔥</h1>
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
                   <span className="text-2xl group-hover:scale-125 transition-transform">{faq.icon}</span>
                   <h3 className="text-2xl font-rammetto text-[var(--text-charcoal)]">{faq.question}</h3>
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
              We're here to help! Reach out and we'll get back to you as soon as possible.
            </p>
            <a 
              href="mailto:ignite.saratoga@gmail.com" 
              className="inline-block bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg hover:shadow-orange-200"
            >
              Email Us 🔥
            </a>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
