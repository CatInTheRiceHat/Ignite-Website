export interface Mentor {
  initial: string;
  name: string;
  role: string;
  details: string;
  bio: string;
  image?: string;
  email?: string;
  linkedin?: string;
}

export const mentors: Mentor[] = [
  {
    initial: "E",
    name: "Elaine Che",
    role: "Co-Founder",
    details: "Saratoga High School · 11th Grade",
    bio: "Passionate about education equity and making mentorship accessible to all students.",
    image: "/staff/Che_Elaine.png",
    email: "", // e.g. "elaine@example.com"
    linkedin: "", // e.g. "https://linkedin.com/in/elaine-che"
  },
  {
    initial: "A",
    name: "Austin Zhao",
    role: "Co-Founder",
    details: "Saratoga High School · 11th Grade",
    bio: "Combines tech skills with a drive to create meaningful programs for younger students.",
    image: "/staff/Zhao_Austin.png",
    email: "",
    linkedin: "",
  },
  {
    initial: "M",
    name: "Michael Zhao",
    role: "Co-Founder",
    details: "Saratoga High School · 11th Grade",
    bio: "Focused on program design and building partnerships to expand Ignite's reach.",
    image: "/staff/Zhao_Michael.png",
    email: "",
    linkedin: "",
  },
  {
    initial: "I",
    name: "Ivan Satsuta",
    role: "Director of Operations",
    details: "Saratoga High School · 11th Grade",
    bio: "Keeps the program running smoothly — from scheduling to logistics to team coordination.",
    image: "/staff/Satsuta_Ivan.png",
    email: "",
    linkedin: "",
  },
  {
    initial: "J",
    name: "Julie Ye",
    role: "Director of Programs",
    details: "Saratoga High School · 11th Grade",
    bio: "Designs engaging curriculum and activities that make each session impactful and fun.",
    image: "/staff/Ye_Julie.png",
    email: "",
    linkedin: "",
  },
  {
    initial: "E",
    name: "Edwin Wu",
    role: "Mentor",
    details: "Saratoga High School",
    bio: "Supports students as they build confidence, explore new skills, and ask better questions.",
    image: "/staff/Wu_Edwin.png",
    email: "",
    linkedin: "",
  },
  {
    initial: "Ac",
    name: "Achyut Karthikeyan",
    role: "Instructor — AI Literacy",
    details: "Saratoga High School",
    bio: "Breaks down AI in a way that's actually useful — not just hype.",
    email: "",
    linkedin: "",
  },
];
