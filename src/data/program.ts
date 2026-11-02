export type CourseFormat = 'live' | 'independent';

export const courseFields = [
  { id: 'technology', label: 'Technology & Creation' },
  { id: 'career', label: 'Career & Business' },
  { id: 'personal', label: 'Personal Skills & Wellbeing' },
  { id: 'leadership', label: 'Leadership & Discovery' },
] as const;

export type CourseField = (typeof courseFields)[number]['id'];

// The October development catalog supersedes the August framework's course list.
// The frameworks describe plans, not published courses or an enrollment schedule.
// Instructor assignments reviewed against Courses in Development List.pdf (November 1, 2026).
// CAD collaboration and Akshay Kolluru's name clarified by the user (November 1, 2026).
// Math and Onshape additions and their course teams verified against Moodle (October 24, 2026).
// Website summaries rewritten at the user's request from the course topics and available plans (November 1, 2026).
// Catalog: https://docs.google.com/document/d/1kxusd_hLaY7hyZFQ_EY-ysFiA3ApgHAe-qMjN4RBSeo/edit
// Independent framework: https://docs.google.com/document/d/1bhB1G1e-h1Pg0p4m_yYZu-hMPYt0CWK46k0vTt4ot3s/edit
// Live outline: https://docs.google.com/document/d/1FN4tvQ8E10CcOBMnHoBSq8m4eThc2DBHcaIWq7nguJ4/edit
export const courseFormats = {
  live: {
    label: 'Live',
    technicalLabel: 'Synchronous',
    duration: 'Two weeks',
    commitment: 'Five 60-minute sessions per week, Monday through Friday, plus course-specific work outside class.',
    description: 'Learn together through live lessons, guided practice, discussion, and applied tasks that build toward a final project.',
    icon: '/mascots/Zoom.png',
  },
  independent: {
    label: 'Independent',
    technicalLabel: 'Asynchronous',
    duration: 'Varies by course',
    commitment: 'Course lengths and workloads vary. Published course plans include five-, six-, and eight-week courses, plus a 40-hour economics course. See individual descriptions for details.',
    description: 'Work through weekly lessons, practice, quizzes, and applied work. Use feedback to revise your work and build toward a final project.',
    icon: '/mascots/Laptop.png',
  },
} as const;

export interface DevelopmentCourse {
  title: string;
  format: CourseFormat;
  field: CourseField;
  instructors?: { name: string; displayName?: string; grades?: string }[];
  icon: string;
  headerImage?: string;
  headerPosition?: string;
  duration?: string;
  audience?: string;
  commitment?: string;
  description?: string;
  prerequisites?: string;
  note?: string;
}

export const developmentCourses: DevelopmentCourse[] = [
  {
    title: 'Content Creation & Digital Storytelling',
    field: 'technology',
    format: 'live',
    icon: '/mascots/Artist.png',
    headerImage: '/courses/Content%20Creation%20&%20Digital%20Storytelling.jpg',
    description: 'Make stories people can follow, from the first idea to the final edit. Try telling them with words, pictures, and sound.',
  },
  {
    title: 'Professional Communication & Public Speaking',
    field: 'career',
    instructors: [{ name: 'Anisa Doshi Chandra' }],
    format: 'live',
    icon: '/mascots/Microphone.png',
    headerImage: '/courses/Communication.jpg?v=59976f05',
    headerPosition: 'center top',
    description: 'Get more comfortable speaking in front of others. Work on getting your point across, listening well, and handling questions.',
  },
  {
    title: 'Game Development (Scratch)',
    field: 'technology',
    instructors: [{ name: 'Jake Hu' }],
    format: 'live',
    icon: '/mascots/Laptop.png',
    headerImage: '/courses/Game%20Development%20(Scratch).jpg',
    description: 'Make a game of your own in Scratch. Bring characters to life, add rules, and figure out what to fix when things go wrong.',
  },
  {
    title: 'Productivity, Time Management & Organization',
    field: 'personal',
    instructors: [{ name: 'Shivmanas Kamarsu' }],
    format: 'independent',
    icon: '/mascots/Productivity.png',
    headerImage: '/courses/Productivity,%20Time%20Management%20&%20Organization.jpg?v=f3b4083f',
    description: 'Make time for schoolwork and the things you enjoy. Try ways to plan your week, stay focused, and stop leaving everything until later.',
  },
  {
    title: 'Marketing, Branding & Digital Design',
    field: 'career',
    instructors: [{ name: 'Dhruv Agarwal' }],
    format: 'independent',
    icon: '/mascots/Artist.png',
    headerImage: '/courses/Digital%20Design.jpeg?v=fce78e31',
    description: 'Give an idea a look and a voice. Put words, colors, and layouts together to make designs people can understand and remember.',
  },
  {
    title: 'Scientific Research & Data Analysis',
    field: 'leadership',
    instructors: [{ name: 'Daniya Shivapur' }],
    format: 'independent',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Science%20Research.jpeg',
    description: 'Follow a question and see where the evidence leads. Plan an investigation, make sense of the data, and explain what you found.',
  },
  {
    title: 'Social Impact & Project Development',
    field: 'leadership',
    instructors: [{ name: 'Anisa Doshi Chandra' }],
    format: 'independent',
    icon: '/mascots/Project.png',
    headerImage: '/courses/Project%20and%20Nonprofit%20Building.jpeg',
    description: 'Take an idea for helping your community and work out how to make it happen. Choose a goal, plan the steps, and figure out what you need.',
  },
  {
    title: 'Resilience & Stress-Management',
    field: 'personal',
    instructors: [{ name: 'Emma Zhou' }],
    format: 'independent',
    duration: 'Five weeks',
    icon: '/mascots/Curious.png',
    headerImage: '/courses/Resilience%20&%20Stress%20Management.jpg?v=2738cda3',
    description: 'Find ways to handle everyday stress and recover when things go wrong. Practice with fictional situations, without sharing personal stories.',
    note: 'Students are never asked to share personal stories in submitted work. Mentors are not licensed counselors and cannot provide personal counseling.',
  },
  {
    title: 'AI Literacy and Responsible Use',
    field: 'technology',
    instructors: [{ name: 'Kevin Liu' }],
    format: 'independent',
    duration: 'Six weeks',
    audience: 'Grades 4–8.',
    icon: '/mascots/AI.png',
    headerImage: '/courses/AI%20Literacy.jpeg',
    description: 'See what AI can do, where it makes mistakes, and how to use it thoughtfully. Learn about privacy, bias, and content that looks real but isn’t.',
  },
  {
    title: '3D Design and CAD Basics',
    field: 'technology',
    instructors: [{ name: 'Imoleayo Babatunde', displayName: 'Babatunde Imoleayo' }, { name: 'Achyut Karthikeyan' }],
    format: 'independent',
    duration: 'Six weeks',
    icon: '/mascots/Artist.png',
    headerImage: '/courses/3D%20Design%20&%20CAD%20Fundamentals.jpg',
    description: 'Turn simple sketches into 3D designs in Onshape. Get comfortable with the tools and see how a flat drawing becomes an object.',
  },
  {
    title: 'Onshape 3D CAD Foundations',
    field: 'technology',
    instructors: [{ name: 'Ridwanullah Ashiru' }],
    format: 'independent',
    duration: 'Six weeks',
    icon: '/mascots/Artist.png',
    headerImage: '/courses/Onshape.jpg?v=6e7221e9',
    description: 'Design something with parts that work together. Build in Onshape, test your ideas, and adjust your model when the requirements change.',
  },
  {
    title: 'Cybersecurity, Online Safety & Media Literacy',
    field: 'personal',
    instructors: [{ name: 'Akshay Kolluru' }],
    format: 'independent',
    icon: '/mascots/Laptop.png',
    headerImage: '/courses/Cybersecurity,%20Online%20Safety%20&%20Media%20Literacy.jpg?v=b666addf',
    description: 'Know what to watch out for online, from suspicious messages to misleading posts. Build habits for protecting your accounts and checking what you read.',
  },
  {
    title: 'Career Exploration & Pathway Planning',
    field: 'career',
    instructors: [{ name: 'Akshay Kolluru' }],
    format: 'independent',
    icon: '/mascots/Graduation.png',
    headerImage: '/courses/Career%20Exploration%20&%20Pathway%20Planning.jpg',
    description: 'You don’t need your whole future planned out. Get to know different careers and find ways to follow your interests.',
  },
  {
    title: 'Intro to Economics & Financial Literacy',
    field: 'career',
    format: 'independent',
    audience: 'Grades 4–8.',
    commitment: '40 hours total.',
    icon: '/mascots/Finance.png',
    headerImage: '/courses/Financial%20Literacy%20&%20Economics.jpg?v=045e492c',
    description: 'Money decisions show up every day. Learn how spending, saving, and trade work, and how they connect to the wider economy.',
  },
  {
    title: 'Entrepreneurship Essentials: Planning, Record-Keeping & Financial Tracking',
    field: 'career',
    instructors: [{ name: 'Benjamin Oluwadamilare Oluyemi' }],
    format: 'independent',
    audience: 'Early-stage entrepreneurs and small business owners.',
    icon: '/mascots/Project.png',
    headerImage: '/courses/Entrepreneurship%20&%20Business%20Building.jpg',
    description: 'Work through the everyday side of running a small business: planning tasks, keeping records, and knowing what’s coming in and going out.',
  },
  {
    title: 'Leadership, Teamwork & Conflict Resolution',
    field: 'leadership',
    instructors: [{ name: 'Nikhil Tadepalli' }],
    format: 'independent',
    icon: '/mascots/Mentors.png',
    headerImage: '/courses/Leadership,%20Teamwork%20&%20Conflict%20Resolution.jpg',
    commitment: 'Work individually and at your own pace.',
    description: 'Help a group work well together, even when people disagree. Practice sharing responsibilities, listening to others, and finding a fair way forward.',
  },
  {
    title: 'Civic Literacy & Community Action',
    field: 'leadership',
    instructors: [{ name: 'Kireeti Kotha' }],
    format: 'independent',
    icon: '/mascots/Project.png',
    headerImage: '/courses/Civic%20Literacy%20&%20Community%20Action.jpg',
    description: 'Get to know how your community and government work. Look at local problems, think through possible solutions, and find ways to speak up.',
  },
  {
    title: 'Relationships, Boundaries & Social Skills',
    field: 'personal',
    instructors: [{ name: 'Nikhil Tadepalli' }],
    format: 'independent',
    duration: 'Six weeks',
    audience: 'Grades 6–8, with support for grades 4–5.',
    commitment: 'About 4½ hours per week. All work is completed individually.',
    icon: '/mascots/Mentors.png',
    headerImage: '/courses/Relationships,%20Boundaries%20&%20Social%20Skills.jpg',
    description: 'Learn to say what you’re comfortable with and respect other people’s limits. Practice making friends, reading social cues, and handling peer pressure.',
  },
  {
    title: 'Emergency Preparedness and Safety Asynchronous Course',
    field: 'personal',
    instructors: [{ name: 'Alliyah Battad (Lyra)', displayName: 'Alliyah (Lyra) Battad' }],
    format: 'independent',
    icon: '/mascots/Lightbulb.png',
    headerImage: '/courses/Emergency%20Preparedness%20&%20Safety.jpg',
    description: 'Know what to plan for before an emergency happens. Get familiar with home safety, basic first aid, and ways to prepare for a disaster.',
  },
  {
    title: 'Introduction to Physics & Astronomy',
    field: 'leadership',
    instructors: [{ name: 'Michelle Thomatis' }],
    format: 'independent',
    duration: 'Eight weeks',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Introductory%20Physics%20and%20Astronomy.jpg',
    description: 'Find out how things move, why gravity matters, and what light tells us about space. Connect everyday physics to stars and galaxies.',
    prerequisites: 'No previous physics or astronomy experience or advanced math required.',
  },
  {
    title: 'Introduction to Computer Science (Python-Based)',
    field: 'technology',
    instructors: [{ name: 'Yuenching Shao' }, { name: 'Daniel Yeh' }],
    format: 'independent',
    icon: '/mascots/Laptop.png',
    headerImage: '/courses/Intro%20to%20Computer%20Science%20(Python).jpg',
    description: 'Write your first programs in Python and get a feel for how code works. Break a problem into steps a computer can follow.',
  },
  {
    title: 'Introduction to Algebra',
    field: 'leadership',
    instructors: [{ name: 'Terrence Shu' }],
    format: 'independent',
    duration: 'To be confirmed',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Algebra.jpg?v=c7cb74ff',
    description: 'Get comfortable with letters showing up in math. Work with expressions, equations, and patterns, then use them to figure out everyday problems.',
    note: 'Designed to supplement school learning, not replace a course at school.',
  },
];

export const courseCounts = {
  all: developmentCourses.length,
  live: developmentCourses.filter((course) => course.format === 'live').length,
  independent: developmentCourses.filter((course) => course.format === 'independent').length,
};

export const programCopy = {
  direction: 'Practical skills for everyday life: managing your time, communicating clearly, staying safe online, understanding money, and turning ideas into projects.',
  availability: 'These courses are in development. Launch dates, class schedules, and student enrollment details have not been confirmed.',
  eligibility: 'Ignite welcomes all students. Bring your curiosity and a willingness to learn.',
  expansion: 'After Summer 2026, Ignite is working toward free online learning that combines live classes with independent courses. The goal is to help more students build useful skills, wherever they learn.',
  proposals: 'AI learning support, professional curriculum review, new partnerships, and broader reach are proposals. Their launch, approval, and growth targets have not been confirmed.',
};

export const programFaqs = [
  { question: 'Is it free?', answer: 'Ignite’s mission is to keep practical life skills learning free. The Summer 2026 program was free, and the developing courses are planned as free learning opportunities.' },
  { question: 'How long is the program?', answer: `The planned live (${courseFormats.live.technicalLabel.toLowerCase()}) format is ${courseFormats.live.duration.toLowerCase()}. Independent (${courseFormats.independent.technicalLabel.toLowerCase()}) course lengths vary: Resilience & Stress-Management is five weeks, several courses are six weeks, and Physics & Astronomy is eight weeks. Economics & Financial Literacy has 40 hours of work. Check each course description for its planned length. These are course plans, not an announced schedule. The three-week Summer 2026 cycle is a past program.` },
  { question: 'What’s the time commitment?', answer: `Live: ${courseFormats.live.commitment} Independent: ${courseFormats.independent.commitment}` },
  { question: 'Which courses are available?', answer: `The catalog contains ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. ${programCopy.availability}` },
  { question: 'Who are the courses for?', answer: programCopy.eligibility },
  { question: 'Is experience required?', answer: 'Requirements vary by course. Introduction to Physics & Astronomy needs no previous experience or advanced math. Check the individual course descriptions for prerequisites.' },
  { question: 'Who are the mentors?', answer: 'Ignite is student-led. High school mentors helped students practice skills during Summer 2026. Teaching and feedback arrangements for developing courses are still being planned.' },
  { question: 'Where will learning happen?', answer: 'Both formats are planned for online learning. Independent course plans include weekly lessons, practice, quizzes, applied work, feedback, revision, and a final project. The learning hub currently opens a Moodle sign-in page.' },
  { question: 'Can I apply now?', answer: 'A current student application link and enrollment availability have not been confirmed. The learning hub is a Moodle sign-in page. Intern applications are separate and linked on the Hiring page.' },
  { question: 'What will I work toward?', answer: 'Both draft formats build toward a final project. Course-specific completion requirements and any certificates will need to be confirmed before launch.' },
  { question: 'How is Ignite expanding?', answer: `${programCopy.expansion} ${programCopy.proposals}` },
  { question: 'How do I contact you?', answer: 'Email ignitefindyourfire@gmail.com with questions about the program or eligibility.' },
];
