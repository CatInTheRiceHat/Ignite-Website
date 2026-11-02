export type CourseFormat = 'live' | 'independent';

// The October development catalog supersedes the August framework's course list.
// The frameworks describe plans, not published courses or an enrollment schedule.
// Instructor assignments reviewed against Courses in Development List.pdf (November 1, 2026).
// CAD collaboration and Akshay Kolluru's name clarified by the user (November 1, 2026).
// Math and Onshape additions and their course teams verified against Moodle (October 24, 2026).
// Course descriptions updated from the supplied Moodle catalog (November 1, 2026).
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
  { title: 'Content Creation & Digital Storytelling', format: 'live', icon: '/mascots/Artist.png', headerImage: '/courses/Content%20Creation%20&%20Digital%20Storytelling.jpg' },
  { title: 'Professional Communication & Public Speaking', instructors: [{ name: 'Anisa Doshi Chandra' }], format: 'live', icon: '/mascots/Microphone.png', headerImage: '/courses/Communication.jpg?v=59976f05', headerPosition: 'center top' },
  { title: 'Game Development (Scratch)', instructors: [{ name: 'Jake Hu' }], format: 'live', icon: '/mascots/Laptop.png', headerImage: '/courses/Game%20Development%20(Scratch).jpg' },
  {
    title: 'Productivity, Time Management & Organization',
    instructors: [{ name: 'Shivmanas Kamarsu' }],
    format: 'independent',
    icon: '/mascots/Productivity.png',
    headerImage: '/courses/Productivity,%20Time%20Management%20&%20Organization.jpg?v=f3b4083f',
    description: 'Learn to prioritize, reduce distractions, and organize your time with goal setting, time blocking, the Pomodoro method, and other practical strategies. Build a personal productivity system that supports your academic and personal goals.',
  },
  { title: 'Marketing, Branding & Digital Design', instructors: [{ name: 'Dhruv Agarwal' }], format: 'independent', icon: '/mascots/Artist.png', headerImage: '/courses/Digital%20Design.jpeg?v=fce78e31' },
  { title: 'Scientific Research & Data Analysis', instructors: [{ name: 'Daniya Shivapur' }], format: 'independent', icon: '/mascots/Research.png', headerImage: '/courses/Science%20Research.jpeg' },
  { title: 'Social Impact & Project Development', instructors: [{ name: 'Anisa Doshi Chandra' }], format: 'independent', icon: '/mascots/Project.png', headerImage: '/courses/Project%20and%20Nonprofit%20Building.jpeg' },
  {
    title: 'Resilience & Stress-Management',
    instructors: [{ name: 'Emma Zhou' }],
    format: 'independent',
    duration: 'Five weeks',
    icon: '/mascots/Curious.png',
    headerImage: '/courses/Resilience%20&%20Stress%20Management.jpg?v=2738cda3',
    description: 'Explore how everyday stress works, practice ways to manage it, recover from setbacks, and set realistic expectations. Interactive lessons, personalized skill development, and fictional scenarios help you identify stressors and choose practical responses. Compile what you learn into a Resilience Playbook to reference in the future.',
    note: 'Students are never asked to share personal stories in submitted work. Mentors are not licensed counselors and cannot provide personal counseling.',
  },
  {
    title: 'AI Literacy and Responsible Use',
    instructors: [{ name: 'Kevin Liu' }],
    format: 'independent',
    duration: 'Six weeks',
    audience: 'Grades 4–8.',
    icon: '/mascots/AI.png',
    headerImage: '/courses/AI%20Literacy.jpeg',
    description: 'Understand how AI works and how to use it responsibly. Explore chatbots, bias, deepfakes, privacy, creativity, and more through relatable examples and hands-on activities.',
  },
  {
    title: '3D Design and CAD Basics',
    instructors: [{ name: 'Imoleayo Babatunde', displayName: 'Babatunde Imoleayo' }, { name: 'Achyut Karthikeyan' }],
    format: 'independent',
    duration: 'Six weeks',
    icon: '/mascots/Artist.png',
    headerImage: '/courses/3D%20Design%20&%20CAD%20Fundamentals.jpg',
    description: 'Learn the basics of 3D design and computer-aided design (CAD) using Onshape. Explore how digital models are built, practice hands-on design challenges, and create your own 3D projects.',
  },
  {
    title: 'Onshape 3D CAD Foundations',
    instructors: [{ name: 'Ridwanullah Ashiru' }],
    format: 'independent',
    duration: 'Six weeks',
    icon: '/mascots/Artist.png',
    headerImage: '/courses/Onshape.jpg?v=6e7221e9',
    description: 'Build real 3D models in Onshape, a free CAD tool that runs in your browser. Start with your first sketch and work toward a functioning mechanism, such as a sliding desk organizer, hinged case, or adjustable stand. Each week combines short videos, step-by-step text guides, fix-it challenges, and a build project, ending with a “plot twist” change request that tests your design.',
  },
  { title: 'Cybersecurity, Online Safety & Media Literacy', instructors: [{ name: 'Akshay Kolluru' }], format: 'independent', icon: '/mascots/Laptop.png', headerImage: '/courses/Cybersecurity,%20Online%20Safety%20&%20Media%20Literacy.jpg?v=b666addf' },
  { title: 'Career Exploration & Pathway Planning', instructors: [{ name: 'Akshay Kolluru' }], format: 'independent', icon: '/mascots/Graduation.png', headerImage: '/courses/Career%20Exploration%20&%20Pathway%20Planning.jpg' },
  {
    title: 'Intro to Economics & Financial Literacy',
    format: 'independent',
    audience: 'Grades 4–8.',
    commitment: '40 hours total.',
    icon: '/mascots/Finance.png',
    headerImage: '/courses/Financial%20Literacy%20&%20Economics.jpg?v=045e492c',
    description: 'Explore scarcity, money, trade, personal finance, and the government’s role in the economy. Videos, short readings, interactive activities, and hands-on projects help you think like an economist and apply these ideas to real-world decisions.',
  },
  {
    title: 'Entrepreneurship Essentials: Planning, Record-Keeping & Financial Tracking',
    instructors: [{ name: 'Benjamin Oluwadamilare Oluyemi' }],
    format: 'independent',
    audience: 'Early-stage entrepreneurs and small business owners.',
    icon: '/mascots/Project.png',
    headerImage: '/courses/Entrepreneurship%20&%20Business%20Building.jpg',
    description: 'Build practical skills for running a small business. Learn step by step to structure daily operations, track sales and expenses, manage inventory, and maintain financial records using accessible digital tools.',
  },
  {
    title: 'Leadership, Teamwork & Conflict Resolution',
    instructors: [{ name: 'Nikhil Tadepalli' }],
    format: 'independent',
    icon: '/mascots/Mentors.png',
    headerImage: '/courses/Leadership,%20Teamwork%20&%20Conflict%20Resolution.jpg',
    commitment: 'Work individually and at your own pace.',
    description: 'Learn what good leaders do, why some teams work well together, and how to settle disagreements calmly and fairly. Practice skills for group projects, sports, clubs, friendships, and home through interactive slideshows, quiz games, scenarios, and writing activities. Bring everything together in a Club Launch Leadership Plan for a fictional after-school club you lead.',
  },
  {
    title: 'Civic Literacy & Community Action',
    instructors: [{ name: 'Kireeti Kotha' }],
    format: 'independent',
    icon: '/mascots/Project.png',
    headerImage: '/courses/Civic%20Literacy%20&%20Community%20Action.jpg',
    description: 'Explore two connected areas. Civic Literacy covers the rights and responsibilities of U.S. citizens, how government and communities function, and how local, state, and federal taxes and laws affect people. Community Action focuses on identifying local problems, researching and developing possible solutions, and communicating ideas with community members and leaders.',
  },
  {
    title: 'Relationships, Boundaries & Social Skills',
    instructors: [{ name: 'Nikhil Tadepalli' }],
    format: 'independent',
    duration: 'Six weeks',
    audience: 'Grades 6–8, with support for grades 4–5.',
    commitment: 'About 4½ hours per week. All work is completed individually.',
    icon: '/mascots/Mentors.png',
    headerImage: '/courses/Relationships,%20Boundaries%20&%20Social%20Skills.jpg',
    description: 'Learn what personal boundaries are, why everyone’s boundaries differ, and how to speak up clearly and kindly. Follow a fictional friend group at Cedar Creek Middle School while practicing social cues, respecting other people’s “no,” making and keeping friends, handling peer pressure, and staying safe online. In Week 6, turn your work into a personal Boundaries & Friendship Playbook.',
  },
  {
    title: 'Emergency Preparedness and Safety Asynchronous Course',
    instructors: [{ name: 'Alliyah Battad (Lyra)', displayName: 'Alliyah (Lyra) Battad' }],
    format: 'independent',
    icon: '/mascots/Lightbulb.png',
    headerImage: '/courses/Emergency%20Preparedness%20&%20Safety.jpg',
    description: 'Learn essential skills in emergency preparedness, home hazard safety, survival logistics, basic first aid, and disaster response. Build the knowledge and confidence to respond to high-stress situations.',
  },
  {
    title: 'Introduction to Physics & Astronomy',
    instructors: [{ name: 'Michelle Thomatis' }],
    format: 'independent',
    duration: 'Eight weeks',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Introductory%20Physics%20and%20Astronomy.jpg',
    description: 'Explore the universe through motion, forces, gravity, light, stars, galaxies, and other astronomical objects. Interactive lessons, activities, and a final project help you think like a scientist: ask questions, identify patterns, interpret simple data, and use evidence to explain how the universe works.',
    prerequisites: 'No previous physics or astronomy experience or advanced math required.',
  },
  {
    title: 'Introduction to Computer Science (Python-Based)',
    instructors: [{ name: 'Yuenching Shao' }, { name: 'Daniel Yeh' }],
    format: 'independent',
    icon: '/mascots/Laptop.png',
    headerImage: '/courses/Intro%20to%20Computer%20Science%20(Python).jpg',
    description: 'An introductory tutorial to computer science using the Python programming language.',
  },
  {
    title: 'Introduction to Algebra',
    instructors: [{ name: 'Terrence Shu' }],
    format: 'independent',
    duration: 'To be confirmed',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Algebra.jpg?v=c7cb74ff',
    description: 'Bridge arithmetic and Algebra 1 by using variables, expressions, and equations to solve multi-step real-world problems. Explore rational numbers, factors, multiples, exponents, expressions and variables, equations and inequalities, ratios, functions, and an introduction to geometry.',
    note: 'Designed to supplement school learning, not replace a course at school.',
  },
  {
    title: 'Introduction to Differential Calculus',
    instructors: [{ name: 'Terrence Shu' }],
    format: 'independent',
    duration: 'To be confirmed',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Differential%20Calculus.jpg?v=360efd24',
    audience: 'Advanced math students ready for introductory college calculus concepts.',
    description: 'Explore limits and continuity, derivative rules, and applications of derivatives. The course covers material comparable to the first semester of AP Calculus AB or the first three months of AP Calculus BC.',
    prerequisites: 'Successfully completed at least Algebra 2, with extremely strong algebra skills and proficiency in functions and trigonometry.',
    note: 'Designed to supplement a school calculus course. It does not replace that course and is not intended to prepare students for either AP Calculus exam.',
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
  { question: 'Is experience required?', answer: 'Requirements vary by course. Introduction to Physics & Astronomy needs no previous experience or advanced math. Introduction to Differential Calculus requires at least Algebra 2, extremely strong algebra skills, and proficiency in functions and trigonometry. Check the individual course descriptions for prerequisites.' },
  { question: 'Who are the mentors?', answer: 'Ignite is student-led. High school mentors helped students practice skills during Summer 2026. Teaching and feedback arrangements for developing courses are still being planned.' },
  { question: 'Where will learning happen?', answer: 'Both formats are planned for online learning. Independent course plans include weekly lessons, practice, quizzes, applied work, feedback, revision, and a final project. The learning hub currently opens a Moodle sign-in page.' },
  { question: 'Can I apply now?', answer: 'A current student application link and enrollment availability have not been confirmed. The learning hub is a Moodle sign-in page. Intern applications are separate and linked on the Hiring page.' },
  { question: 'What will I work toward?', answer: 'Both draft formats build toward a final project. Course-specific completion requirements and any certificates will need to be confirmed before launch.' },
  { question: 'How is Ignite expanding?', answer: `${programCopy.expansion} ${programCopy.proposals}` },
  { question: 'How do I contact you?', answer: 'Email ignitefindyourfire@gmail.com with questions about the program or eligibility.' },
];
