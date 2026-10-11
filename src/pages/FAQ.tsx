import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    { question: 'What is Ignite now?', answer: 'Ignite is growing into a student-led learning platform for practical life skills and intentional career exploration. Courses are being developed to help students try new subjects, apply useful skills, and explore possible paths.' },
    { question: 'Are the new courses available?', answer: 'The 20 courses listed on the Program page are in development and have not launched. Contact Ignite for current course availability and joining details.' },
    { question: 'How long is the program?', answer: 'Ignite is expanding beyond a single summer session into a platform of courses. Course lengths for the expanded model are still being finalized. Check the confirmed details for the course you are interested in before planning your schedule.' },
    { question: 'What is the weekly time commitment?', answer: 'Weekly workloads for the expanded course model are still being finalized. The planned learning experience includes lessons, guided practice, and project work, with time to reflect and revise. Contact Ignite for a confirmed estimate for the course you are interested in.' },
    { question: 'Where and how will learning happen?', answer: 'Ignite is developing online learning experiences that include live instruction and independent learning. Individual course formats and meeting requirements have not yet been confirmed. Check with Ignite about attendance, tools, and access before joining.' },
    { question: 'What will students work on?', answer: 'Courses are being designed around practical activities and projects. Students will learn a concept, try guided practice, build something useful, and improve their work through self-checks, reflection, and feedback. Specific projects will depend on the course.' },
    { question: 'Is it free?', answer: 'Ignite’s mission is to make practical skills learning available to students for free. Check the confirmed tools and materials for a course before joining.' },
    { question: 'Who is Ignite for?', answer: 'Ignite is for students curious about useful skills, new interests, and possible career paths. You do not need to have a career chosen to explore. Course-specific participation details are still being finalized; contact Ignite to discuss which course may fit your student.' },
    { question: 'Is prior experience required?', answer: 'The planned learning experience uses lessons, examples, and guided practice to help students build skills. Any prerequisites will depend on the course. Confirm them with Ignite before joining.' },
    { question: 'How do I join a course?', answer: 'Contact Ignite to ask which courses are available and how to join. Registration and access details for the courses in development are not yet confirmed.' },
    { question: 'What do students get at the end?', answer: 'The focus is practical work that demonstrates a skill and helps students decide what to explore next. Completion requirements and any certificates for the expanded courses still need to be confirmed.' },
    { question: 'How do I contact you?', answer: 'Email ignitefindyourfire@gmail.com with questions about courses, availability, or participation. Students and parents are welcome to reach out.' },
  ];

  return (
    <div className="bg-[var(--bg-cream)]">
      <section className="bg-[var(--primary-orange)] py-16 sm:py-20 text-[var(--text-charcoal)] text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img src="/mascots/Puzzled.png" alt="" className="h-full w-full object-contain object-right-bottom" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-[var(--text-charcoal)]">FAQ</h1>
          <p className="text-xl md:text-2xl mt-4 leading-relaxed">Practical answers for students and parents.</p>
        </div>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="faq-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-rammetto text-[var(--text-charcoal)]">Getting to know Ignite</h2>
            <p className="text-lg text-[var(--text-light)] leading-relaxed mt-4">
              We're developing an expanded course catalog. Here is what the learning experience
              is being designed to offer, and which participation details are still being finalized.
            </p>
            <Link to="/program" className="inline-flex items-center justify-center min-h-11 mt-4 font-bold text-[var(--text-charcoal)] underline underline-offset-4 hover:text-[var(--text-charcoal)] hover:decoration-[var(--primary-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
              Explore courses in development
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {faqs.map((faq) => (
              <div key={faq.question} className="min-w-0 bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border-l-8 sm:border-l-[12px] border-[var(--primary-orange)]">
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--text-charcoal)] mb-4">{faq.question}</h3>
                <p className="text-[var(--text-light)] text-lg leading-relaxed break-words">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white rounded-t-[2.5rem] md:rounded-t-[4rem]" aria-labelledby="contact-heading">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 id="contact-heading" className="text-3xl sm:text-4xl md:text-5xl font-rammetto text-[var(--text-charcoal)] mb-6">Still have questions?</h2>
          <p className="text-lg sm:text-xl text-[var(--text-light)] mb-8 max-w-2xl mx-auto leading-relaxed">
            Ask us about a course you're interested in, its availability, or what participation would involve.
          </p>
          <a href="mailto:ignitefindyourfire@gmail.com" className="ignite-button inline-flex items-center justify-center w-full sm:w-auto bg-[var(--primary-orange)] text-[var(--text-charcoal)] px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-200 transition-colors shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
            Email Ignite
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
