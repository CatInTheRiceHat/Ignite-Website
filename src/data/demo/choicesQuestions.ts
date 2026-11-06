import type { DemoQuestion } from './questions';

export const choicesQuestions: DemoQuestion[] = [
  {
    "id": "q510",
    "prompt": "Sofia lends friends her lunch money even when she needs it to eat. Which response would protect her needs?",
    "explanation": "Sofia needs that money for lunch, so declining to lend it protects her own needs without making her responsible for a friend’s disappointment.",
    "hint": "Consider what Sofia would have to give up if she lent the money.",
    "options": [
      {
        "text": "Say everyone is forbidden to spend their own money.",
        "correct": false,
        "feedback": "That tries to control others rather than explaining what Sofia will do."
      },
      {
        "text": "Skip lunch and hope someone notices.",
        "correct": false,
        "feedback": "This does not communicate the limit or protect Sofia’s need to eat."
      },
      {
        "text": "“I need this money for lunch, so I can’t lend it today.”",
        "correct": true,
        "feedback": "This protects a basic need without needing an apology or another offer."
      },
      {
        "text": "Keep lending it so nobody feels disappointed.",
        "correct": false,
        "feedback": "Other people’s disappointment does not make Sofia responsible for giving up lunch."
      }
    ]
  },
  {
    "id": "q511",
    "prompt": "Theo does not want to discuss something private. His friend offers to listen. Which response respects Theo’s choice?",
    "explanation": "Theo can keep information private while his friend offers support without demanding details or treating that choice as a problem.",
    "hint": "Look for an offer of support that leaves Theo free to decide what he shares.",
    "options": [
      {
        "text": "Keep asking until Theo gives in.",
        "correct": false,
        "feedback": "Repeated pressure does not respect the choice Theo has already made."
      },
      {
        "text": "“You don’t have to tell me. If you want support later, I’m here.”",
        "correct": true,
        "feedback": "This respects privacy while keeping support available."
      },
      {
        "text": "“If you trusted me, you would tell me everything.”",
        "correct": false,
        "feedback": "Trust does not create an obligation to disclose private information."
      },
      {
        "text": "Tell everyone Theo is too rigid.",
        "correct": false,
        "feedback": "A label does not tell us what Theo needs or whether it feels safe to talk."
      }
    ]
  },
  {
    "id": "q512",
    "prompt": "A friend asks Kayla to help him study for a test. Kayla says, \"Sure! I can help until 8, then I need to get ready for bed.\" What kind of boundary is this?",
    "explanation": "Kayla has chosen to help until a particular time so that she can still get ready for bed, though she could also decline if she is not available.",
    "hint": "Notice both what Kayla has offered and when she needs to stop.",
    "options": [
      {
        "text": "Healthy",
        "correct": true,
        "feedback": "Kayla helps her friend and is clear about her limit."
      },
      {
        "text": "Too loose",
        "correct": false,
        "feedback": "Kayla has chosen to help until a stated time. She can also decline if she needs to. A limit does not require unlimited availability."
      },
      {
        "text": "Too rigid",
        "correct": false,
        "feedback": "Kayla has chosen to help until a stated time. She can also decline if she needs to. A limit does not require unlimited availability."
      },
      {
        "text": "Rude",
        "correct": false,
        "feedback": "Kayla has chosen to help until a stated time. She can also decline if she needs to. A limit does not require unlimited availability."
      }
    ]
  },
  {
    "id": "q513",
    "prompt": "Which description best fits a healthy boundary?",
    "explanation": "A healthy boundary protects someone’s needs, consent and privacy, which may mean keeping a firm limit on access to their body, belongings or personal information.",
    "hint": "Consider whether the limit protects someone’s needs or gives them control over another person.",
    "options": [
      {
        "text": "Saying yes to everyone so nobody gets upset.",
        "correct": false,
        "feedback": "Agreeing under pressure can leave your own needs unmet."
      },
      {
        "text": "A rule that gives you control over someone else’s friendships.",
        "correct": false,
        "feedback": "A boundary explains your choices; it does not give you ownership of someone else’s choices."
      },
      {
        "text": "Something you must change whenever a friend asks.",
        "correct": false,
        "feedback": "Flexibility is a choice, not an obligation. A firm no can remain a healthy limit."
      },
      {
        "text": "A clear limit that protects your needs and respects other people’s choices.",
        "correct": true,
        "feedback": "A limit may be firm or change with context. The person gets to decide."
      }
    ]
  },
  {
    "id": "q514",
    "prompt": "True or false: A boundary can change with the situation, but you do not have to change it to satisfy someone else.",
    "explanation": "You can change a boundary when your comfort or circumstances change, or keep it in place when it still suits your needs. Pressure from another person does not decide that choice.",
    "hint": "Consider who gets to decide whether a boundary changes.",
    "options": [
      {
        "text": "True",
        "correct": true,
        "feedback": "You decide whether your comfort or circumstances have changed."
      },
      {
        "text": "False",
        "correct": false,
        "feedback": "A person may choose different limits in different situations, or keep the same firm limit."
      }
    ]
  }
];
