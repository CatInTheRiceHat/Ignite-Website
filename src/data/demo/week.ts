import type { DemoQuestion } from './questions';

export const parts = [
  { id: 'learn', title: 'What are boundaries?', kind: 'Lesson & examples', detail: 'Learn the five types, explore clear limits, and try four worked examples.' },
  { id: 'warmup', title: 'Try it out', kind: 'Opening practice · 10 questions', detail: 'Work through everyday situations at your own pace, using hints and feedback whenever you need them.' },
  { id: 'friends', title: 'Meet the friend group', kind: 'Character cards', detail: 'Meet Priya, Marcus, Ella and Dev, and consider their perspectives.' },
  { id: 'case', title: 'The Borrowed Hoodie', kind: 'Applied activity', detail: 'Use details from the story to explain what happened, then review your written responses against the criteria.' },
  { id: 'types', title: 'Which boundary is it?', kind: 'Practice · 5 questions', detail: 'Practice recognizing physical, emotional, time, belongings and digital boundaries.' },
  { id: 'choices', title: 'Limits that protect your needs', kind: 'Practice · 5 questions', detail: 'Think about context, privacy, clear limits and other people’s choices.' },
  { id: 'final', title: 'Week 1 assessment', kind: 'Assessment · 10 questions', detail: 'Use what you have learned to answer questions about new situations, then review the explanations for any answers you want to change.' },
  { id: 'finish', title: 'My Boundaries Map', kind: 'Your finished work', detail: 'Create a practical response card and download your week’s work.' },
] as const;
export type PartId = typeof parts[number]['id'];
export const objectives = [
  'Recognize five types of boundaries and give an example of each.',
  'Explain how a clear limit can protect someone’s needs, privacy and choices.',
  'Tell the difference between setting a boundary and controlling another person.',
  'Use evidence from a situation to choose or write a respectful response.',
];
export const boundaryTypes = [
  { name: 'Physical', protects: 'Your body and personal space', example: '“No hug, thanks.” You can offer another greeting if you want to, without being expected to agree to touch.', symbol: '1' },
  { name: 'Emotional', protects: 'Your feelings and private thoughts', example: '“I’m not ready to talk about that yet.”', symbol: '2' },
  { name: 'Time', protects: 'Your time and energy', example: '“I can’t hang out tonight. I need to finish my project.”', symbol: '3' },
  { name: 'Belongings', protects: 'Your possessions', example: '“Please ask before borrowing my charger. I may need to keep it with me.”', symbol: '4' },
  { name: 'Digital', protects: 'Your accounts, messages, photos and online life', example: '“Please don’t post that photo of me.”', symbol: '5' },
];

export const lessonChecks: DemoQuestion[] = [
  { id: 'lesson-phone', prompt: 'Your cousin grabs your phone and starts scrolling through your messages. Which boundaries are involved?', hint: 'Consider both the private messages and the phone itself, since more than one category can fit.', explanation: 'Reading private messages involves a digital boundary, while taking the phone without permission also involves belongings, so both categories help explain this situation.', options: [
    { text: 'Only time, because reading takes time.', correct: false, feedback: 'The main issue is access to private messages and a possession, rather than how long reading takes.' },
    { text: 'Digital and belongings.', correct: true, feedback: 'The messages are private digital information, while the phone is a possession that your cousin took without asking.' },
    { text: 'None, because cousins can share.', correct: false, feedback: 'Being family does not automatically give permission to read messages or take a phone.' },
  ] },
  { id: 'lesson-time', prompt: 'A friend wants to video chat until midnight every night, even when you’re exhausted. What limit could protect your needs?', hint: 'Look for a limit about when you are available, rather than a rule about your friend’s whole evening.', explanation: 'Saying you will log off at 9 protects your time for rest while leaving your friend free to decide what they do afterward.', options: [
    { text: '“I’m logging off at 9, so I’ll reply tomorrow.”', correct: true, feedback: 'This communicates a clear limit about your own time and availability.' },
    { text: '“You’re not allowed to talk to anyone after 9.”', correct: false, feedback: 'This tries to control your friend’s evening rather than explain when you are available to talk.' },
    { text: 'Keep chatting so they never feel disappointed.', correct: false, feedback: 'A friendship does not require ignoring your need for rest.' },
  ] },
  { id: 'lesson-homework', prompt: 'Jayden lets friends copy his homework every day, even though it makes him uncomfortable. What could he say?', hint: 'Choose a response that lets Jayden decide how his work is used, with any offer of help left up to him.', explanation: 'Jayden can decline to share answers for copying and, if he wants to, offer to explain a problem instead. He is not responsible for doing someone else’s homework.', options: [
    { text: '“I’ll send all my work so you won’t be upset.”', correct: false, feedback: 'This leaves Jayden’s concern unchanged and does not protect his work.' },
    { text: '“You can never ask anyone for help.”', correct: false, feedback: 'That controls others rather than naming Jayden’s own limit.' },
    { text: '“I’m not sharing answers for copying. I can explain one problem at lunch.”', correct: true, feedback: 'This clearly declines copying and offers help Jayden has chosen to give.' },
  ] },
  { id: 'lesson-privacy', prompt: 'Nia says, “I don’t want to talk about my grades. Can we talk about something else?” What is the best interpretation?', hint: 'Consider what Nia has actually said about this topic instead of making assumptions about the friendship.', explanation: 'Nia has explained that she wants to keep her grades private and offered another topic, though she does not need a reason or an alternative for that limit to be respected.', options: [
    { text: 'She must explain her grades to prove she trusts her friend.', correct: false, feedback: 'Trust does not require sharing every private detail.' },
    { text: 'She is protecting a topic she wants to keep private.', correct: true, feedback: 'Nia is choosing not to discuss one subject, which her friend can respect without treating it as a problem with the friendship.' },
    { text: 'She has ended the friendship.', correct: false, feedback: 'A limit on one topic is not the same as rejecting a person.' },
  ] },
];

export const friends = [
  { name: 'Priya', role: 'The outgoing planner', strength: 'Priya is confident and welcoming, often organizing hangouts and making sure everyone is invited.', growing: 'She sometimes moves quickly and assumes others are comfortable with her borrowing things or sharing their news without asking.', quote: '“Oh, you don’t mind, right? We’re friends!”', boundary: 'Priya values being included and feels hurt when plans are made without her.', thinking: '“It was freezing in the art room, and Marcus’s hoodie was right there. We share stuff all the time. He said it was fine, so it’s fine. Besides, I looked really good in that photo!”' },
  { name: 'Marcus', role: 'The loyal helper', strength: 'Marcus is kind and loyal, often being the first to offer help when someone is having a difficult day.', growing: 'He sometimes agrees to things he does not want to do because he worries that saying no will upset his friends.', quote: '“It’s fine. Really. Don’t worry about it.”', boundary: 'His belongings matter to him, especially things that remind him of his family.', thinking: '“That hoodie was my older brother’s before he left for college. It’s special to me. I hate that she just took it, and now it’s on her page like it’s hers. But if I say something, she’ll think I’m being dramatic.”' },
  { name: 'Ella', role: 'The thoughtful artist', strength: 'Ella is a careful listener who notices small details and carries her sketchbook wherever she goes.', growing: 'Since she is new to Cedar Creek this year, she often stays quiet in big groups while worrying about fitting in.', quote: '“Um, I don’t mind. Whatever you all want to do.”', boundary: 'Her sketchbook is personal, and she wants to choose who gets to see it.', thinking: '“I saw Marcus’s face when Priya said she borrowed it. He didn’t look fine. I’d be upset too if someone took my sketchbook without asking. But I’m new, so I don’t want to get in the middle of it.”' },
  { name: 'Dev', role: 'The friend who keeps the chat going', strength: 'Dev is funny and energetic, often helping people laugh when they have had a difficult day.', growing: 'His jokes and screenshots sometimes go too far, and he does not always notice when someone stops laughing.', quote: '“Relax, it’s just a joke!”', boundary: 'Dev values his time and dislikes being expected to answer messages immediately.', thinking: '“I commented ‘STOLEN GOODS lol’ on Priya’s photo. It was a joke! Everybody knows Priya borrows everything. I don’t really get why Marcus is being so quiet about it.”' },
];

export const caseStory = [
  'It’s Monday at Cedar Creek Middle School. Marcus keeps his favorite hoodie in his locker. It’s a gray Cedar Creek Robotics hoodie that used to belong to his older brother, who just left for college. Marcus never locks his locker because he is always running late to first period.',
  'During art class, Priya gets cold. She remembers seeing the hoodie in Marcus’s locker, so on her way back from the bathroom she grabs it and puts it on. She wears it for the rest of Monday, and again on Tuesday and Wednesday.',
  'On Wednesday night, Priya posts a photo of herself in the hoodie with the caption, “new fave hoodie.” Dev comments, “STOLEN GOODS lol.” Twelve people like the photo.',
  'At lunch on Thursday, Priya sits down next to Marcus. “Oh hey, I borrowed your hoodie this week. Hope you don’t mind!” Marcus looks down at his tray. “Oh… it’s fine,” he says. Ella, sitting across the table, notices that Marcus barely eats the rest of his lunch.',
  'That afternoon, you and Marcus walk home together. About halfway there, he says what he has been thinking. “It’s not fine, honestly. That was my brother’s. And now it’s all over her page like it’s hers. But I didn’t want to make a big deal out of it. What was I supposed to say?”',
];

export const casePrompts = [
  { id: 'evidence', title: '1. Which boundaries were crossed?', prompt: 'Identify at least two boundary types involved in the story and explain what happened to each, including any overlap you notice.', support: '“A ___ boundary was crossed when ___. Another boundary involved was ___ because ___.” You can start by explaining one type before adding a second.', required: true },
  { id: 'marcus', title: '2. What does Marcus need?', prompt: 'Explain what Marcus’s comment leaves unclear and describe a limit that could protect what matters to him, remembering that Priya needed permission before taking the hoodie.', support: '“Marcus said ___, but we know ___ from the story. A clear limit could be ___.”', required: true },
  { id: 'priya', title: '3. Consider Priya’s perspective', prompt: 'Use Priya’s Friend Card to explain why she may not realize the impact of what she did, then suggest how she could take responsibility and repair the situation.', support: '“Priya probably thinks ___ because ___. She could take responsibility by ___.”', required: true },
  { id: 'fiction', title: '4. A boundary that matters to a character (optional)', prompt: 'Choose a fictional character from this story, a book, a show or a film and explain a boundary that matters to them, without drawing on real personal experiences.', support: '“A ___ boundary matters to ___ because ___.”', required: false },
  { id: 'context', title: 'Challenge: the same boundary, different contexts (optional)', prompt: 'Explain how a person might choose different limits with different people or in different situations. Also give an example of a limit they may choose to keep firm.', support: 'For example: sharing clothes with one person does not mean someone must share clothes with everyone.', required: false },
  { id: 'speaking', title: 'Challenge: why might speaking up be hard? (optional)', prompt: 'Use Marcus’s Friend Card to explain what makes it hard for him to speak up. What could a friend do to support him without taking over?', support: 'Think about his fear of upsetting friends. Support should leave Marcus in control of what he shares and does next.', required: false },
];
export const caseRubric = [
  'I identified boundary types and supported my thinking with details from the story.',
  'I explained Marcus’s needs without blaming him for Priya’s choice to take the hoodie.',
  'I used Priya’s perspective and named a repair that respects Marcus’s choices.',
];
export const responseCheck: DemoQuestion = {
  id: 'case-response', prompt: 'You are Ella. Marcus tells you he is upset. Which response leaves him in control?',
  hint: 'Support Marcus without dismissing him, pressuring him or acting on his behalf without asking.',
  explanation: 'Ella can acknowledge why the hoodie matters and ask what support Marcus wants, without promising that one conversation will fix everything. If the situation feels unsafe or too difficult to handle alone, a trusted adult could help.',
  options: [
    { text: '“It’s just a hoodie. Forget about it.”', correct: false, feedback: 'Calling it “just a hoodie” dismisses the meaning it has for Marcus instead of taking his concern seriously.' },
    { text: '“I’ll post about Priya right now so everyone knows.”', correct: false, feedback: 'Publicly escalating without asking takes control away from Marcus and can spread private information.' },
    { text: '“That hoodie matters to you. Would you like help asking for it back, or would you rather I just listen?”', correct: true, feedback: 'This acknowledges why Marcus is upset and offers support while leaving him free to choose what he wants.' },
  ],
};
