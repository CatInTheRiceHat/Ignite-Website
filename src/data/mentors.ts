export interface Mentor {
  initial: string;
  name: string;
  role: string;
  details: string;
  bio: string;
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
    email: "", // e.g. "elaine@example.com"
    linkedin: "", // e.g. "https://linkedin.com/in/elaine-che"
  },
  {
    initial: "A",
    name: "Austin Zhao",
    role: "Co-Founder",
    details: "Saratoga High School · 11th Grade",
    bio: "Combines tech skills with a drive to create meaningful programs for younger students.",
    email: "",
    linkedin: "",
  },
  {
    initial: "M",
    name: "Michael Zhao",
    role: "Co-Founder",
    details: "Saratoga High School · 11th Grade",
    bio: "Focused on program design and building partnerships to expand Ignite's reach.",
    email: "",
    linkedin: "",
  },
  {
    initial: "I",
    name: "Ivan Satsuta",
    role: "Director of Operations",
    details: "Saratoga High School · 11th Grade",
    bio: "Keeps the program running smoothly — from scheduling to logistics to team coordination.",
    email: "",
    linkedin: "",
  },
  {
    initial: "J",
    name: "Julie Ye",
    role: "Director of Programs",
    details: "Saratoga High School · 11th Grade",
    bio: "Designs engaging curriculum and activities that make each session impactful and fun.",
    email: "",
    linkedin: "",
  },
];
