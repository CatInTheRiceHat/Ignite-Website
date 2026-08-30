export interface Mentor {
  initial: string;
  name: string;
  role: string;
  school: string;
  subjects?: string;
  image?: string;
  email?: string;
  country?: string;
  educationLevel?: "University" | "High School";
  graduatingClass?: string;
}

export interface Intern extends Mentor {
  country: string;
  educationLevel: "University" | "High School";
  graduatingClass: string;
  email: string;
}

export const mentors: Mentor[] = [
  {
    initial: "E",
    name: "Elaine Che",
    role: "Co-founder, Chief Technology Officer",
    school: "Saratoga High School",
    subjects: "Project / Nonprofit Building",
    image: "/staff/Che_Elaine.png",
    email: "elaineyouyuanche@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "A",
    name: "Austin Zhao",
    role: "Co-founder, Chief Executive Officer",
    school: "Saratoga High School",
    subjects: "Marketing & Digital Design; Productivity, Goal Setting & Decision Making",
    image: "/staff/Zhao_Austin.png",
    email: "AustinZhao986@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "M",
    name: "Michael Zhao",
    role: "Co-founder, Chief Outreach Officer",
    school: "Saratoga High School",
    subjects: "Science Research",
    image: "/staff/Zhao_Michael.png",
    email: "mmzhao819@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "I",
    name: "Ivan Satsuta",
    role: "Synchronous Mentor",
    school: "Saratoga High School",
    subjects: "Professional Communication",
    image: "/staff/Satsuta_Ivan.png",
    email: "sa23chippy@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2027",
  },
  {
    initial: "J",
    name: "Julie Ye",
    role: "Synchronous Mentor",
    school: "Saratoga High School",
    subjects: "AI Literacy",
    image: "/staff/Ye_Julie.png",
    email: "julieyixuanye@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2029",
  },
  {
    initial: "V",
    name: "Vivaan Gupta",
    role: "Synchronous Mentor",
    school: "Saratoga High School",
    subjects: "AI Literacy",
    image: "/staff/Gupta_Vivaan.png",
    email: "gupta.vg2010@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "E",
    name: "Edwin Wu",
    role: "Synchronous Mentor",
    school: "Saratoga High School",
    image: "/staff/Wu_Edwin.png",
    email: "wue0085@lgsstudent.org",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "Ac",
    name: "Achyut Karthikeyan",
    role: "Synchronous Mentor",
    school: "Saratoga High School",
    image: "/staff/Karthikeyan_Achyut.png",
    email: "sabrus444@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "E",
    name: "Emma Zhou",
    role: "Synchronous Mentor",
    school: "The Harker School",
    subjects: "Productivity, Goal Setting & Decision Making",
    image: "/staff/Zhou_Emma.png",
    email: "emmazhou585@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2028",
  },
  {
    initial: "D",
    name: "David He",
    role: "Synchronous Mentor",
    school: "The Harker School",
    subjects: "AI Literacy; Marketing & Digital Design; Professional Communication",
    image: "/staff/He_David.png",
    email: "David.yifan.he@gmail.com",
    country: "USA",
    educationLevel: "High School",
    graduatingClass: "Class of 2029",
  },
];

export const interns: Intern[] = [
  {
    initial: "R",
    name: "Ridwanullah Ashiru",
    role: "Course Developer",
    school: "Obafemi Awolowo University",
    country: "Nigeria",
    educationLevel: "University",
    graduatingClass: "Class of 2027",
    email: "damilolaolanrewaju111@gmail.com",
    image: "/staff/Default.png",
  },
  {
    initial: "D",
    name: "Dang Quang Tung",
    role: "Course Developer",
    school: "Chu Van An High School for the Gifted",
    country: "Vietnam",
    educationLevel: "High School",
    graduatingClass: "Class of 2027",
    email: "tungkhue1999@gmail.com",
    image: "/staff/Default.png",
  },
];
