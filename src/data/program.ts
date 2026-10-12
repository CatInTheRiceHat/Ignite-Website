export type CourseFormat = 'live' | 'independent';

// The October development catalog supersedes the August framework's course list.
// The frameworks describe plans, not published courses or an enrollment schedule.
// Catalog: https://docs.google.com/document/d/1kxusd_hLaY7hyZFQ_EY-ysFiA3ApgHAe-qMjN4RBSeo/edit
// Independent framework: https://docs.google.com/document/d/1bhB1G1e-h1Pg0p4m_yYZu-hMPYt0CWK46k0vTt4ot3s/edit
// Live outline: https://docs.google.com/document/d/1FN4tvQ8E10CcOBMnHoBSq8m4eThc2DBHcaIWq7nguJ4/edit
export const courseFormats = {
  live: {
    label: 'Live',
    technicalLabel: 'Synchronous',
    duration: 'One week',
    commitment: 'Five 60-minute sessions, Monday through Friday, plus course-specific work outside class.',
    description: 'Learn together through live lessons, guided practice, discussion, and applied tasks that build toward a final project.',
    icon: '/mascots/Zoom.png',
  },
  independent: {
    label: 'Independent',
    technicalLabel: 'Asynchronous',
    duration: 'Six weeks',
    commitment: 'The draft framework estimates roughly 4–5 hours per week. Actual time will vary by course.',
    description: 'Work through weekly lessons, practice, quizzes, and applied work. Use feedback to revise your work and build toward a final project.',
    icon: '/mascots/Laptop.png',
  },
} as const;

export interface DevelopmentCourse {
  title: string;
  format: CourseFormat;
  icon: string;
  headerImage?: string;
  headerPosition?: string;
}

export const developmentCourses: DevelopmentCourse[] = [
  { title: 'Content Creation & Digital Storytelling', format: 'live', icon: '/mascots/Artist.png', headerImage: '/courses/Content%20Creation%20&%20Digital%20Storytelling.jpg' },
  { title: 'Professional Communication & Public Speaking', format: 'live', icon: '/mascots/Microphone.png', headerImage: '/courses/Communication.jpeg', headerPosition: 'center top' },
  { title: 'Game Development (Scratch)', format: 'live', icon: '/mascots/Laptop.png', headerImage: '/courses/Game%20Development%20(Scratch).jpg' },
  { title: 'Productivity, Time Management & Organization', format: 'independent', icon: '/mascots/Productivity.png', headerImage: '/courses/Productivity.jpeg', headerPosition: 'center 25%' },
  { title: 'Marketing, Branding & Digital Design', format: 'independent', icon: '/mascots/Artist.png', headerImage: '/courses/Digital%20Design.jpeg?v=fce78e31' },
  { title: 'Scientific Research & Data Analysis', format: 'independent', icon: '/mascots/Research.png', headerImage: '/courses/Science%20Research.jpeg' },
  { title: 'Social Impact & Project Development', format: 'independent', icon: '/mascots/Project.png', headerImage: '/courses/Project%20and%20Nonprofit%20Building.jpeg' },
  { title: 'Resilience & Stress Management', format: 'independent', icon: '/mascots/Curious.png', headerImage: '/courses/Resilience%20&%20Stress%20Management.jpg?v=2738cda3' },
  { title: 'AI Literacy and Responsible Use', format: 'independent', icon: '/mascots/AI.png', headerImage: '/courses/AI%20Literacy.jpeg' },
  { title: '3D Design & CAD Fundamentals', format: 'independent', icon: '/mascots/Artist.png', headerImage: '/courses/3D%20Design%20&%20CAD%20Fundamentals.jpg' },
  { title: 'Cybersecurity, Online Safety & Media Literacy', format: 'independent', icon: '/mascots/Laptop.png', headerImage: '/courses/Cybersecurity,%20Online%20Safety%20&%20Media%20Literacy.jpg?v=b666addf' },
  { title: 'Career Exploration & Pathway Planning', format: 'independent', icon: '/mascots/Graduation.png', headerImage: '/courses/Career%20Exploration%20&%20Pathway%20Planning.jpg' },
  { title: 'Financial Literacy & Economics', format: 'independent', icon: '/mascots/Finance.png', headerImage: '/courses/Financial%20Literacy%20&%20Economics.jpg?v=045e492c' },
  { title: 'Entrepreneurship & Business Building', format: 'independent', icon: '/mascots/Project.png', headerImage: '/courses/Entrepreneurship%20&%20Business%20Building.jpg' },
  { title: 'Leadership, Teamwork & Conflict Resolution', format: 'independent', icon: '/mascots/Mentors.png', headerImage: '/courses/Leadership,%20Teamwork%20&%20Conflict%20Resolution.jpg' },
  { title: 'Civic Literacy & Community Action', format: 'independent', icon: '/mascots/Project.png', headerImage: '/courses/Civic%20Literacy%20&%20Community%20Action.jpg' },
  { title: 'Relationships, Boundaries & Social Skills', format: 'independent', icon: '/mascots/Mentors.png', headerImage: '/courses/Relationships,%20Boundaries%20&%20Social%20Skills.jpg' },
  { title: 'Emergency Preparedness & Safety', format: 'independent', icon: '/mascots/Lightbulb.png', headerImage: '/courses/Emergency%20Preparedness%20&%20Safety.jpg' },
  { title: 'Introductory Physics and Astronomy', format: 'independent', icon: '/mascots/Research.png', headerImage: '/courses/Introductory%20Physics%20and%20Astronomy.jpg' },
  { title: 'Intro to Computer Science (Python)', format: 'independent', icon: '/mascots/Laptop.png', headerImage: '/courses/Intro%20to%20Computer%20Science%20(Python).jpg' },
];

export const courseCounts = {
  all: developmentCourses.length,
  live: developmentCourses.filter((course) => course.format === 'live').length,
  independent: developmentCourses.filter((course) => course.format === 'independent').length,
};

export const programCopy = {
  direction: 'Practical skills for everyday life: managing your time, communicating clearly, staying safe online, understanding money, and turning ideas into projects.',
  availability: 'These courses are in development. Launch dates, class schedules, and student enrollment details have not been confirmed.',
  eligibility: 'Existing Ignite materials describe grades 4–8. Eligibility and any prior knowledge needed for each developing course still need confirmation; the same ages may not apply to every course.',
  expansion: 'After Summer 2026, Ignite is working toward free online learning that combines live classes with independent courses. The goal is to help more students build useful skills, wherever they learn.',
  proposals: 'AI learning support, professional curriculum review, new partnerships, and broader reach are proposals. Their launch, approval, and growth targets have not been confirmed.',
};

export const programFaqs = [
  { question: 'Is it free?', answer: 'Ignite’s mission is to keep practical life skills learning free. The Summer 2026 program was free, and the developing courses are planned as free learning opportunities.' },
  { question: 'How long is the program?', answer: `The planned live (${courseFormats.live.technicalLabel.toLowerCase()}) format is ${courseFormats.live.duration.toLowerCase()}; the independent (${courseFormats.independent.technicalLabel.toLowerCase()}) format is ${courseFormats.independent.duration.toLowerCase()}. These are course plans, not an announced schedule. The three-week Summer 2026 cycle is a past program.` },
  { question: 'What’s the time commitment?', answer: `Live: ${courseFormats.live.commitment} Independent: ${courseFormats.independent.commitment}` },
  { question: 'Which courses are available?', answer: `The catalog contains ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. ${programCopy.availability}` },
  { question: 'Who are the courses for?', answer: programCopy.eligibility },
  { question: 'Is experience required?', answer: 'Ignite welcomes curiosity and a willingness to learn. Any course-specific prerequisites will need to be confirmed before enrollment details are shared.' },
  { question: 'Who are the mentors?', answer: 'Ignite is student-led. High school mentors helped students practice skills during Summer 2026. Teaching and feedback arrangements for developing courses are still being planned.' },
  { question: 'Where will learning happen?', answer: 'Both formats are planned for online learning. Independent course plans include weekly lessons, practice, quizzes, applied work, feedback, revision, and a final project. The learning hub currently opens a Moodle sign-in page.' },
  { question: 'Can I apply now?', answer: 'A current student application link and enrollment availability have not been confirmed. The learning hub is a Moodle sign-in page. Intern applications are separate and linked on the Hiring page.' },
  { question: 'What will I work toward?', answer: 'Both draft formats build toward a final project. Course-specific completion requirements and any certificates will need to be confirmed before launch.' },
  { question: 'How is Ignite expanding?', answer: `${programCopy.expansion} ${programCopy.proposals}` },
  { question: 'How do I contact you?', answer: 'Email ignitefindyourfire@gmail.com with questions about the program or eligibility.' },
];
