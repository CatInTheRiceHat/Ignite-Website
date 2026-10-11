export type CourseFormat = 'independent' | 'live';

export interface ProgramCourse {
  title: string;
  format: CourseFormat;
  creators: string[];
  description: string;
  image: string;
}

// Current development catalog. A completed draft is not an enrollment launch.
export const coursesInDevelopment: ProgramCourse[] = [
  {
    "title": "Content Creation & Digital Storytelling",
    "format": "live",
    "creators": [],
    "description": "Explore how to shape an idea into a clear, engaging story using digital media.",
    "image": "/mascots/Artist.png"
  },
  {
    "title": "Professional Communication & Public Speaking",
    "format": "live",
    "creators": [
      "Anisa Doshi Chandra"
    ],
    "description": "Practice clear messages, professional conversations, and confident presentations.",
    "image": "/mascots/Microphone.png"
  },
  {
    "title": "Game Development (Scratch)",
    "format": "live",
    "creators": [
      "Jake Hu"
    ],
    "description": "Explore coding and game design by building interactive projects in Scratch.",
    "image": "/mascots/Laptop.png"
  },
  {
    "title": "Productivity, Time Management & Organization",
    "format": "independent",
    "creators": [
      "Pragya Mahawar",
      "Soraya"
    ],
    "description": "Practice planning your time, organizing commitments, and turning goals into manageable steps.",
    "image": "/mascots/Productivity.png"
  },
  {
    "title": "Marketing, Branding & Digital Design",
    "format": "independent",
    "creators": [],
    "description": "Explore audiences, brand identity, and visual design to communicate an idea clearly.",
    "image": "/mascots/Artist.png"
  },
  {
    "title": "Scientific Research & Data Analysis",
    "format": "independent",
    "creators": [
      "Gary He"
    ],
    "description": "Practice asking research questions, working with evidence, and explaining findings.",
    "image": "/mascots/Research.png"
  },
  {
    "title": "Social Impact & Project Development",
    "format": "independent",
    "creators": [
      "Anisa Doshi Chandra"
    ],
    "description": "Explore how to turn a community need into a project with a clear plan and purpose.",
    "image": "/mascots/Project.png"
  },
  {
    "title": "Resilience & Stress Management",
    "format": "independent",
    "creators": [
      "Emma Zhou"
    ],
    "description": "Explore practical ways to respond to setbacks, manage everyday stress, and ask for support.",
    "image": "/mascots/Curious.png"
  },
  {
    "title": "AI Literacy and Responsible Use",
    "format": "independent",
    "creators": [
      "Kevin Liu"
    ],
    "description": "Learn how to question AI outputs, check information, and use AI tools thoughtfully.",
    "image": "/mascots/AI.png"
  },
  {
    "title": "3D Design & CAD Fundamentals",
    "format": "independent",
    "creators": [
      "Ridwanullah Ashiru",
      "Imoleayo Babatunde"
    ],
    "description": "Explore three-dimensional design, modeling tools, and how to improve a design through iteration.",
    "image": "/mascots/Lightbulb.png"
  },
  {
    "title": "Cybersecurity, Online Safety & Media Literacy",
    "format": "independent",
    "creators": [],
    "description": "Practice recognizing online risks, protecting privacy, and evaluating digital information.",
    "image": "/mascots/Laptop.png"
  },
  {
    "title": "Career Exploration & Pathway Planning",
    "format": "independent",
    "creators": [
      "Akshay Kornellu"
    ],
    "description": "Explore interests, compare possible paths, and plan small steps to learn more about careers.",
    "image": "/mascots/Graduation.png"
  },
  {
    "title": "Financial Literacy & Economics",
    "format": "independent",
    "creators": [
      "Neil Anand"
    ],
    "description": "Explore budgeting, saving, and everyday economic decisions through practical examples.",
    "image": "/mascots/Finance.png"
  },
  {
    "title": "Entrepreneurship & Business Building",
    "format": "independent",
    "creators": [
      "Benjamin"
    ],
    "description": "Explore how to develop an idea, understand a customer need, and build a business plan.",
    "image": "/mascots/Project.png"
  },
  {
    "title": "Leadership, Teamwork & Conflict Resolution",
    "format": "independent",
    "creators": [
      "Nikhil Tadepalli"
    ],
    "description": "Practice working with others, sharing responsibility, and handling disagreements constructively.",
    "image": "/mascots/Mentors.png"
  },
  {
    "title": "Civic Literacy & Community Action",
    "format": "independent",
    "creators": [
      "Kireeti Kotha"
    ],
    "description": "Explore how communities make decisions and how to participate with evidence and purpose.",
    "image": "/mascots/Grades.png"
  },
  {
    "title": "Relationships, Boundaries & Social Skills",
    "format": "independent",
    "creators": [],
    "description": "Practice respectful communication, setting boundaries, and navigating social situations.",
    "image": "/mascots/Mentors.png"
  },
  {
    "title": "Emergency Preparedness & Safety",
    "format": "independent",
    "creators": [
      "Lyra"
    ],
    "description": "Explore everyday safety and how to prepare a practical plan for emergencies.",
    "image": "/mascots/Lightbulb.png"
  },
  {
    "title": "Introductory Physics and Astronomy",
    "format": "independent",
    "creators": [
      "Michelle Thomatis"
    ],
    "description": "Explore introductory physics ideas and questions about the universe.",
    "image": "/mascots/Research.png"
  },
  {
    "title": "Intro to Computer Science (Python)",
    "format": "independent",
    "creators": [
      "Ching",
      "Daniel"
    ],
    "description": "Explore programming fundamentals and use Python to build simple projects.",
    "image": "/mascots/Laptop.png"
  }
];

export const learningFormats = [
  {
    "id": "independent",
    "title": "Learn independently",
    "label": "Asynchronous courses",
    "image": "/mascots/Laptop.png",
    "duration": "Six-week course plan",
    "commitment": "About 4–5 hours per week",
    "description": "Work through online lessons, practice activities, and projects at times that fit your day. Each module builds toward a final project, with feedback and revision along the way.",
    "detail": "Optional office hours are planned outside the core workload. Course-specific pacing and deadlines will be shared before enrollment."
  },
  {
    "id": "live",
    "title": "Learn live",
    "label": "Synchronous courses",
    "image": "/mascots/Zoom.png",
    "duration": "One-week course plan",
    "commitment": "Five 60-minute classes",
    "description": "Join a live online class Monday through Friday. Learn with a mentor, try activities together, ask questions, and develop a project through the week.",
    "detail": "Any work outside class will be listed with the course. Dates, time zones, and available places will be announced for each live offering."
  }
] as const;

export const programFAQs = [
  {
    "question": "Is Ignite free?",
    "answer": "Ignite’s courses are free. Any required tools, accounts, or materials will be listed with the course before enrollment."
  },
  {
    "question": "How long is a course?",
    "answer": "Our next independent courses are being designed around a six-week learning path. Live courses are being designed as one-week experiences with five classes, Monday through Friday. Each course listing will confirm its own length and schedule."
  },
  {
    "question": "What is the time commitment?",
    "answer": "Plan for about 4–5 hours per week for an independent course, excluding optional office hours. A live course is planned to include five 60-minute classes, plus any work specified outside class. These are development plans; final requirements will be shared before enrollment."
  },
  {
    "question": "What is the difference between independent and live learning?",
    "answer": "Independent, or asynchronous, learning lets you complete online lessons and activities without attending a daily live class. Live, or synchronous, learning brings students and a mentor together at scheduled times. Both formats are designed around practicing skills and making something of your own."
  },
  {
    "question": "Who are the courses for?",
    "answer": "Ignite helps students explore interests and develop practical skills. Intended levels, prerequisites, and any age requirements will be shared with each course before enrollment. Contact us if you are unsure which course would fit."
  },
  {
    "question": "Do I need prior experience?",
    "answer": "Many courses are intended as an introduction. Check each course’s prerequisites and required tools before enrolling; requirements can differ by subject."
  },
  {
    "question": "Where does learning happen?",
    "answer": "Independent courses are being developed for Ignite’s online learning hub. Live courses are planned on Zoom. The public website explains the program; the learning hub is where online coursework will be organized."
  },
  {
    "question": "Will I get feedback?",
    "answer": "The independent course model includes knowledge checks, applied assignments, and opportunities to revise work. Live courses include practice and feedback during class. Support details will be listed with each offering."
  },
  {
    "question": "Are all the listed courses open for enrollment?",
    "answer": "No. The course catalog on the Program page shows what our team is developing. “In development” means a course is not being advertised as open for enrollment. Check the learning hub and individual course announcements for availability."
  },
  {
    "question": "Is the program only offered in summer?",
    "answer": "Ignite began with a Summer 2026 live program. We are now building a broader practical-skills platform with independent and live courses. Future enrollment dates will be announced by course."
  },
  {
    "question": "How is course completion determined?",
    "answer": "Courses are being designed around knowledge checks, applied work, a final project, and any required revisions. Each course will state its own completion requirements before enrollment."
  },
  {
    "question": "How do I contact Ignite?",
    "answer": "Email ignitefindyourfire@gmail.com with questions about courses, enrollment, or working with us."
  }
] as const;

