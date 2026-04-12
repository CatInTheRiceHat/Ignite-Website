import React, { useState } from 'react';

const Apply = () => {
  const [formType, setFormType] = useState<'student' | 'mentor'>('student');

  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const subject = encodeURIComponent(`Ignite Application: ${data.studentName}`);
    const body = encodeURIComponent(
      `Student Application\n` +
      `-------------------\n` +
      `Name: ${data.studentName}\n` +
      `Grade: ${data.grade}\n` +
      `School: ${data.school}\n` +
      `Email: ${data.email}\n` +
      `Availability: ${data.availability}\n` +
      `\nParent/Guardian:\n` +
      `Name: ${data.parentName || 'N/A'}\n` +
      `Email: ${data.parentEmail || 'N/A'}\n`
    );

    window.location.href = `mailto:ignite.saratoga@gmail.com?subject=${subject}&body=${body}`;
    alert('Thanks for applying! Your email client should open to send the application.');
    (e.target as HTMLFormElement).reset();
  };

  const handleMentorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const subject = encodeURIComponent(`Ignite Mentor Application: ${data.mentorName}`);
    const body = encodeURIComponent(
      `Mentor Application\n` +
      `-------------------\n` +
      `Name: ${data.mentorName}\n` +
      `Grade: ${data.mentorGrade}\n` +
      `School: ${data.mentorSchool}\n` +
      `Email: ${data.mentorEmail}\n`
    );

    window.location.href = `mailto:ignite.saratoga@gmail.com?subject=${subject}&body=${body}`;
    alert('Thanks for applying to be a mentor! Your email client should open to send the application.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-24 md:py-28 text-white text-center rounded-b-[4rem] shadow-lg relative overflow-hidden min-h-[20rem] flex items-center">
        <div className="absolute inset-y-0 right-0 w-full md:w-1/2 opacity-18 sm:opacity-24 pointer-events-none">
          <img
            src="/assets/Graduation.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Apply to Ignite</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">Ready to find your fire? Let's get started.</p>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-4">I am applying as a...</h2>
            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={() => setFormType('student')}
                className={`px-10 py-4 rounded-full font-bold text-lg transition-all shadow-md ${formType === 'student' ? 'bg-[var(--primary-orange)] text-white scale-105' : 'bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] hover:bg-orange-50'}`}
              >
                Student
              </button>
              <button 
                onClick={() => setFormType('mentor')}
                className={`px-10 py-4 rounded-full font-bold text-lg transition-all shadow-md ${formType === 'mentor' ? 'bg-[var(--primary-orange)] text-white scale-105' : 'bg-white text-[var(--primary-orange)] border-2 border-[var(--primary-orange)] hover:bg-orange-50'}`}
              >
                Mentor
              </button>
            </div>
            <p className="text-[var(--text-light)] mt-8 max-w-lg mx-auto italic">
              "This form takes about 5 minutes. Everyone who applies is welcome!"
            </p>
          </div>

          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border-t-8 border-[var(--primary-orange)]">
            {formType === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-lg font-bold text-[var(--text-charcoal)]">Student Name *</label>
                  <input name="studentName" type="text" placeholder="First and last name" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-[var(--text-charcoal)]">Current Grade *</label>
                    <select name="grade" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Select grade</option>
                      <option value="6">6th Grade</option>
                      <option value="7">7th Grade</option>
                      <option value="8">8th Grade</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-[var(--text-charcoal)]">School *</label>
                    <input name="school" type="text" placeholder="Your middle school" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-lg font-bold text-[var(--text-charcoal)]">Email Address *</label>
                  <input name="email" type="email" placeholder="Student or parent email" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-lg font-bold text-[var(--text-charcoal)]">Dates of Availability *</label>
                  <input name="availability" type="text" placeholder="e.g. Mid-June to August, any time" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-[var(--text-charcoal)]">Parent Name</label>
                    <input name="parentName" type="text" placeholder="Optional" className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-[var(--text-charcoal)]">Parent Email</label>
                    <input name="parentEmail" type="email" placeholder="Optional" className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[var(--primary-orange)] text-white py-5 rounded-3xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-orange-200 mt-8">
                  Submit Application
                </button>
              </form>
            ) : (
              <form onSubmit={handleMentorSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-lg font-bold text-[var(--text-charcoal)]">Mentor Name *</label>
                  <input name="mentorName" type="text" placeholder="First and last name" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-[var(--text-charcoal)]">Current Grade *</label>
                    <select name="mentorGrade" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Select grade</option>
                      <option value="9">9th Grade</option>
                      <option value="10">10th Grade</option>
                      <option value="11">11th Grade</option>
                      <option value="12">12th Grade</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-[var(--text-charcoal)]">School *</label>
                    <input name="mentorSchool" type="text" placeholder="High school or college" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-lg font-bold text-[var(--text-charcoal)]">Email Address *</label>
                  <input name="mentorEmail" type="email" placeholder="Preferred contact email" required className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--primary-orange)] outline-none transition-all" />
                </div>
                <button type="submit" className="w-full bg-[var(--primary-orange)] text-white py-5 rounded-3xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-orange-200 mt-8">
                  Submit Mentor Application
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-16 underline decoration-double">What Happens Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: '📧', title: '1. Confirmation', desc: 'You\'ll receive a confirmation email within 48 hours.' },
              { icon: '💻', title: '2. Zoom Details', desc: 'We\'ll send you the Zoom links and program schedule.' },
              { icon: '✅', title: '3. Get Ready!', desc: 'All applicants are welcome. Get ready to start learning!' }
            ].map((step, i) => (
              <div key={i} className="group">
                <div className="bg-[var(--bg-cream)] w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg border-2 border-transparent group-hover:border-[var(--primary-orange)] group-hover:rotate-12 transition-all">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{step.title}</h3>
                <p className="text-[var(--text-light)] text-lg leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Helper Links */}
      <section className="py-24 bg-[var(--bg-cream)] border-t border-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl text-[var(--text-light)]">
            Have questions before applying?{' '}
            <a href="/faq" className="font-bold text-[var(--primary-orange)] hover:underline">Check our FAQ</a> or{' '}
            <a href="mailto:ignite.saratoga@gmail.com" className="font-bold text-[var(--primary-orange)] hover:underline">email us</a>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Apply;
