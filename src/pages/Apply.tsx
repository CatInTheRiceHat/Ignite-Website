import ProgramNextSteps from '../components/program/ProgramNextSteps';

// Keep a useful destination for older student application links.
const Apply = () => (
  <div className="bg-[var(--bg-cream)]">
    <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 md:opacity-30">
        <img src="/mascots/Curious.png" alt="" className="h-full w-full object-contain object-right-bottom" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-6xl font-rammetto text-white">Student Enrollment</h1>
        <p className="text-xl mt-4">Details are still to be confirmed.</p>
      </div>
    </section>
    <ProgramNextSteps />
  </div>
);

export default Apply;
