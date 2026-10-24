import { developmentCourses } from './program.js';
import { DEFAULT_STAFF_IMAGE, interns } from './interns.js';

export { DEFAULT_STAFF_IMAGE, interns } from './interns.js';
export type { Intern } from './interns.js';

export interface Mentor {
  initial: string;
  name: string;
  role: string;
  school?: string;
  courses?: string[];
  image?: string;
  email?: string;
  country?: string;
  educationLevel?: "University" | "High School";
  graduatingClass?: string;
}

export const mentors: Mentor[] = [
  {
    initial: "E",
    name: "Elaine Che",
    courses: ["Project / Nonprofit Building"],
    role: "Co-founder, Chief Technology Officer",
    school: "Saratoga High School",
    image: "/staff/elaine_che.png",
    email: "elaineyouyuanche@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "A",
    name: "Austin Zhao",
    courses: ["Marketing & Digital Design", "Productivity, Goal Setting & Decision Making"],
    role: "Co-founder, Chief Executive Officer",
    school: "Saratoga High School",
    image: "/staff/austin_zhao.png",
    email: "AustinZhao986@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "M",
    name: "Michael Zhao",
    courses: ["Science Research"],
    role: "Co-founder, Chief Outreach Officer",
    school: "Saratoga High School",
    image: "/staff/michael_zhao.png",
    email: "mmzhao819@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "N",
    name: "Nikhil Tadepalli",
    role: "Course Developer",
    courses: ["Leadership, Teamwork & Conflict Resolution"],
    school: "Panther Creek High School",
    graduatingClass: "Class of 2029",
    email: "ntadepalli2@gmail.com",
    image: "/staff/nikhil_tadepalli.png",
  },
  {
    initial: "A",
    name: "Akshay Kolluru",
    role: "Course Developer",
    courses: ["Career Exploration & Pathway Planning"],
    school: "Heritage High School",
    graduatingClass: "Class of 2028",
    email: "akshayk12354@gmail.com",
    image: DEFAULT_STAFF_IMAGE,
  },
  {
    initial: "I",
    name: "Ivan Satsuta",
    courses: ["Professional Communication"],
    role: "Former Staff",
    school: "Saratoga High School",
    image: "/staff/Satsuta_Ivan.png",
    email: "sa23chippy@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2027",
  },
  {
    initial: "J",
    name: "Julie Ye",
    courses: ["AI Literacy"],
    role: "Former Staff",
    school: "Saratoga High School",
    image: "/staff/Ye_Julie.png",
    email: "julieyixuanye@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2029",
  },
  {
    initial: "V",
    name: "Vivaan Gupta",
    courses: ["Entrepreneurship: From Idea to Launch"],
    role: "Course Developer",
    school: "Saratoga High School",
    image: "/staff/vivaan_gupta.png",
    email: "gupta.vg2010@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "E",
    name: "Edwin Wu",
    role: "Former Staff",
    school: "Saratoga High School",
    image: "/staff/Wu_Edwin.png",
    email: "wue0085@lgsstudent.org",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "Ac",
    name: "Achyut Karthikeyan",
    role: "Course Developer",
    school: "Saratoga High School",
    image: "/staff/achyut_karthikeyan.png",
    email: "sabrus444@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "E",
    name: "Emma Zhou",
    role: "Course Developer",
    courses: ["Productivity, Goal Setting & Decision Making", "Resilience & Stress Management"],
    school: "The Harker School",
    image: "/staff/Zhou_Emma.png",
    email: "emmazhou585@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "D",
    name: "David He",
    courses: ["AI Literacy", "Marketing & Digital Design", "Professional Communication"],
    role: "Former Staff",
    school: "The Harker School",
    image: "/staff/He_David.png",
    email: "David.yifan.he@gmail.com",
    country: "United States",
    educationLevel: "High School",
    graduatingClass: "Class of 2029",
  },
];

// Keep the historical roster fixed as new course developers join the team.
const summer2026MentorNames = new Set([
  "Elaine Che",
  "Austin Zhao",
  "Michael Zhao",
  "Ivan Satsuta",
  "Julie Ye",
  "Vivaan Gupta",
  "Edwin Wu",
  "Achyut Karthikeyan",
  "Emma Zhou",
  "David He",
]);

export const summer2026Mentors = mentors.filter((member) => summer2026MentorNames.has(member.name));



// Current course assignments come from the development catalog. Keep the original
// mentor course labels above for the historical Summer 2026 records page.
export const teamMembers: Mentor[] = [...mentors, ...interns].map((member) =>
  member.role === "Former Staff"
    ? member
    : {
        ...member,
        courses: developmentCourses.flatMap((course) =>
          (course.instructors ?? [])
            .filter((instructor) => instructor.name === member.name)
            .map((instructor) => `${course.title}${instructor.grades ? ` (Grades ${instructor.grades})` : ''}`),
        ),
      },
);
