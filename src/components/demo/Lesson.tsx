import { RedirectArrow } from '../ui/redirect-arrow';
import { CheckCircle2 } from 'lucide-react';
import { boundaryTypes, lessonChecks, objectives } from '../../data/demo/week';
import { Question, type LearningProps } from './Question';
import { NoteField } from './Writing';

export function Lesson(props: LearningProps) {
  return <div className="demo-reader">
    <p className="demo-lead">Boundaries help you explain what you’re comfortable with, whether that involves your time, your belongings or something you want to keep private.</p>
    <h3>What you will learn</h3>
    <ul className="demo-objectives">{objectives.map(objective => <li key={objective}><CheckCircle2 size={20} aria-hidden="true" /><span>{objective}</span></li>)}</ul>
    <p>You probably already set boundaries without using that word, such as asking someone to stop reading your messages or saying you need to leave a call to get some sleep. Recognizing those limits can make it easier to explain your needs, although other people are still responsible for respecting them.</p>
    <div className="demo-callout">Imagine a character who feels uncomfortable with something a friend has done. Consider what might bother them and what they would like to change, using a fictional situation rather than an experience from your own life.</div>

    <h3>A fence with a gate</h3>
    <p>A fence with a gate can be a useful way to picture a boundary: the fence marks your limits, while the gate represents your choice about what to share and when to say no. You decide whether to open it, change your mind or keep a limit in place.</p>
    <p>This does not mean you have to let someone in eventually, since being close to someone does not entitle them to your body, possessions, passwords or private thoughts.</p>

    <h3>Five types of boundaries</h3>
    <p>The five categories below describe what a boundary protects, though a situation may involve more than one category.</p>
    <div className="demo-type-list">{boundaryTypes.map(type => <article key={type.name}>
      <span className="demo-type-number" aria-hidden="true">{type.symbol}</span>
      <div><h4>{type.name}</h4><p>{type.protects}</p><p className="demo-example">{type.example}</p></div>
    </article>)}</div>
    <h3>Your turn: name the boundary</h3>
    <Question question={lessonChecks[0]} {...props} />
    <Question question={lessonChecks[1]} {...props} />

    <h3>Clear limits, with context</h3>
    <p>People sometimes describe boundaries as “too loose,” “healthy” or “too rigid,” but those descriptions are only useful when you understand the situation. Agreeing to something that leaves your needs unmet is worth reconsidering, while a firm refusal can be completely reasonable.</p>
    <div className="demo-comparison">
      <article><h4>Agreeing when you don’t want to</h4><p>If you lend someone your headphones even though you need them tomorrow, you may end up without something you need. You could explain, “I need to keep them with me,” rather than agreeing because you feel pressured.</p></article>
      <article><h4>Choosing a limit that works for you</h4><p>You might say, “You can borrow them today, but I need them back tomorrow,” or simply explain that you don’t lend those headphones. Either choice can be reasonable, and you don’t have to offer an alternative.</p></article>
      <article><h4>Deciding whether to ask for support</h4><p>When you want help but feel worried about talking, you can choose someone you trust and decide how much to share. Keeping some details private is still your choice, even when another person wants to help.</p></article>
    </div>
    <p>For example, after a difficult day you might prefer to talk with one trusted person instead of posting everything in a class chat. You could also keep it private for now; what matters is whether the choice fits your needs and what you feel comfortable sharing.</p>
    <Question question={lessonChecks[2]} {...props} />
    <Question question={lessonChecks[3]} {...props} />

    <h3>Write an example of each type</h3>
    <p>Using the situations above as a starting point, write a fictional example of each boundary type that names what matters to the character and the limit they could choose.</p>
    {boundaryTypes.map(type => <NoteField key={type.name} id={`example-${type.name.toLowerCase()}`} label={`My ${type.name.toLowerCase()} boundary example`} description={`Describe a fictional situation involving ${type.protects.toLowerCase()} and a limit the character could set.`} required rows={2} {...props} />)}
    <p className="demo-callout">Before finishing the lesson, check that each example fits its category and describes a limit about the character’s own needs, rather than controlling someone else’s unrelated choices. Revise any example that needs a clearer explanation.</p>

    <h3>A boundary is about your choices</h3>
    <p>Setting a boundary can involve asking someone to stop doing something that affects you and deciding what you will do if it continues. It does not give you the right to control unrelated choices in their life, such as who else they spend time with.</p>
    <div className="demo-table-wrap"><table className="demo-table"><caption>Control compared with a personal limit</caption><thead><tr><th>Trying to control someone</th><th>A limit or request about your own needs</th></tr></thead><tbody>
      <tr><td>“You’re not allowed to sit with anyone else.”</td><td>“I’d like to sit together on Fridays. Want to?” This is a request; the other person may decline.</td></tr>
      <tr><td>“You must stop using your phone at 9.”</td><td>“I turn my phone off at 9, so I’ll answer in the morning.”</td></tr>
      <tr><td>“Give me your password so I can check your messages.”</td><td>“I keep my passwords private.”</td></tr>
    </tbody></table></div>

    <h3>Different people, different boundaries</h3>
    <p>One friend may enjoy hugs while another prefers not to be touched, just as someone might share clothes with a sibling but not a classmate. Families and cultures have different habits around sharing and privacy, so it helps to ask what a person is comfortable with rather than assume.</p>
    <p>Permission also depends on the moment: agreeing to a hug yesterday does not mean agreeing today, including with a relative. You can decline without giving a reason or offering another kind of touch.</p>

    <h3>Notice, name, choose</h3>
    <p>When something bothers you, you might notice tension, a knot in your stomach, feeling annoyed or wanting to leave. These reactions can help you recognize discomfort, although they don’t prove what happened and aren’t required for a boundary to matter.</p>
    <ol><li><strong>Notice:</strong> “Something feels uncomfortable.”</li><li><strong>Name:</strong> “I’m not okay with my messages being read.”</li><li><strong>Choose:</strong> “I’ll ask them to stop and keep my phone with me.” If speaking up feels difficult or unsafe, seek support from a trusted adult.</li></ol>
    <p>Explaining a limit can make it easier for another person to understand, but it cannot guarantee they will cooperate. If someone ignores it, consider whether you can step away or ask for support, remembering that their decision to cross the boundary is not your fault.</p>

    <aside className="demo-callout"><h3>Optional video</h3><p>Therapist Aid’s “What are Healthy Boundaries?” offers another explanation of the topic, though everything you need to complete this week is covered in the text lesson.</p>
      <a className="demo-text-link" href="https://www.youtube.com/watch?v=XAap_uMPbGY" target="_blank" rel="noopener noreferrer">Watch on YouTube (opens a new tab)<RedirectArrow size={16} /></a>
      <p>If you watch, consider which boundary types appear, what needs they protect and how the people involved communicate their limits, using the ideas about context and consent from this lesson.</p></aside>

    <h3>Key terms</h3>
    <dl className="demo-glossary"><dt>Boundary</dt><dd>A limit about what you are comfortable with and the choices you will make.</dd><dt>Consent</dt><dd>Permission for a specific interaction. It can be withheld or changed.</dd><dt>Clear limit</dt><dd>A statement of what you are or are not okay with. It can be firm.</dd><dt>Context</dt><dd>The people, needs and circumstances that help explain a situation.</dd></dl>
    <p className="demo-support-note">If the lesson reminds you of something upsetting or unsafe, you can pause and speak with a trusted adult, such as a parent, guardian, teacher or school counselor. There is no live mentoring or counseling available through this demo.</p>
  </div>;
}
