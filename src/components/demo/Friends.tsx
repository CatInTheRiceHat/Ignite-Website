import { friends } from '../../data/demo/week';
import { NoteField } from './Writing';
import type { LearningProps } from './Question';

export function Friends(props: LearningProps) {
  return <div className="demo-reader">
    <p className="demo-lead">Meet the friends in this week’s story and consider what each person understands about the hoodie.</p>
    <p>The fictional group attends Cedar Creek Middle School, where their different habits and concerns affect how they respond to one another. Understanding those differences can help explain what happened without excusing a boundary being crossed.</p>
    <div className="demo-friend-grid">{friends.map((friend, i) => <article className="demo-friend" key={friend.name}>
      <div className="demo-friend-top"><span className={`demo-avatar demo-avatar-${i}`} aria-hidden="true">{friend.name[0]}</span><div><h3>{friend.name}</h3><p>{friend.role}</p></div></div>
      <h4>Strengths</h4><p>{friend.strength}</p>
      <h4>Still working on</h4><p>{friend.growing}</p>
      <blockquote>{friend.quote}</blockquote>
      <h4>A boundary that matters</h4><p>{friend.boundary}</p>
      <details><summary>Inside the hoodie story: {friend.name}’s perspective</summary><p>{friend.thinking}</p></details>
    </article>)}</div>
    <div className="demo-callout"><h3>Meet Mr. Okafor</h3><p>Mr. Okafor is the fictional school counselor, whose door is open before school and at lunch. The friends can approach him when they need an adult’s help with something that feels unsafe, confusing or difficult to handle alone.</p></div>
    <NoteField id="perspective" label="Compare two perspectives (optional)" description="Choose two friends who see the hoodie situation differently and explain which details from their cards help you understand each view." {...props} />
  </div>;
}
