import { useCallback, useEffect, useRef, useState, type FormEvent, type SyntheticEvent } from 'react';
import { ArrowUpRight, BookOpen, ChevronRight, Info, MessageCircle, RotateCcw, Send, Users, X } from 'lucide-react';
import { destinations, quickActions, resolveDestination, type DestinationId } from '../shared/destinations';
import { boundHistory, MAX_INPUT_LENGTH, parseReply, type ChatInput, type SolReply } from '../shared/protocol';

export type WidgetConfig = { backendUrl: string; websiteBaseUrl: string; mascotUrl: string; launcherMascotUrl?: string; headerMascotUrl?: string; loadFonts?: boolean };
export type WidgetControls = { open: () => void; close: () => void; destroy: () => void };
type Message = { role: 'user' | 'assistant'; content: string; destinationIds?: DestinationId[] };
type Failure = { message: string; request: ChatInput; retryAt: number };

function NavLink({ id, quick = false, websiteBaseUrl }: { id: DestinationId; quick?: boolean; websiteBaseUrl: string }) {
  const destination = resolveDestination(id, websiteBaseUrl);
  return <a className={quick ? 'sol-quick' : 'sol-nav-link'} href={destination.url} target="_blank" rel="noopener noreferrer">
    {quick && (id === 'program' ? <BookOpen size={16} /> : id === 'hiring' ? <Users size={16} /> : id === 'about' ? <Info size={16} /> : <MessageCircle size={16} />)}
    <span>{quick && id === 'faq' ? 'FAQs' : destination.label}</span>
    {quick ? <ChevronRight size={15} /> : <ArrowUpRight size={15} />}
    <span className="sol-sr"> (opens in a new tab or email app)</span>
  </a>;
}

export function SolWidget({ config, host }: { config: WidgetConfig; host: HTMLElement }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [ready, setReady] = useState<'checking' | 'ready' | 'offline'>('checking');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [now, setNow] = useState(Date.now());
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const input = useRef<HTMLTextAreaElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const statusRequest = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const statusGeneration = useRef(0);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  function imageFallback(event: SyntheticEvent<HTMLImageElement>) {
    if (event.currentTarget.src !== config.mascotUrl) event.currentTarget.src = config.mascotUrl;
  }

  const show = useCallback(() => {
    const active = (host.shadowRoot?.activeElement || document.activeElement) as HTMLElement | null;
    opener.current = active && active !== document.body && active !== document.documentElement ? active : launcher.current;
    setOpen(true);
  }, [host]);
  const hide = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => (opener.current?.isConnected ? opener.current : launcher.current)?.focus());
  }, []);

  const checkReady = useCallback(async () => {
    statusRequest.current?.abort();
    const controller = new AbortController();
    statusRequest.current = controller;
    const version = ++statusGeneration.current;
    const timer = window.setTimeout(() => controller.abort(), 8000);
    setReady('checking');
    try {
      const response = await fetch(`${config.backendUrl}/api/status`, { signal: controller.signal, credentials: 'omit', cache: 'no-store' });
      const data = await response.json() as { available?: boolean };
      if (!response.ok || data.available !== true) throw new Error('Unavailable');
      if (version === statusGeneration.current) setReady('ready');
    } catch { if (version === statusGeneration.current) setReady('offline'); }
    finally { clearTimeout(timer); }
  }, [config.backendUrl]);

  const cancelRequests = useCallback(() => {
    request.current?.abort(); statusRequest.current?.abort();
    generation.current++; statusGeneration.current++;
  }, []);

  useEffect(() => {
    const showListener = () => show();
    const hideListener = () => hide();
    host.addEventListener('sol:open', showListener);
    host.addEventListener('sol:close', hideListener);
    return () => {
      host.removeEventListener('sol:open', showListener);
      host.removeEventListener('sol:close', hideListener);
      cancelRequests();
    };
  }, [host, show, hide, cancelRequests]);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus({ preventScroll: true }); // avoids opening the mobile keyboard immediately
    void checkReady();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); hide(); } };
    document.addEventListener('keydown', escape);
    // Follow the visible viewport when a mobile keyboard or browser toolbar changes it.
    const viewport = window.visualViewport;
    const sizePanel = () => {
      panel.current?.style.setProperty('--sol-visible-height', `${viewport?.height || window.innerHeight}px`);
      panel.current?.style.setProperty('--sol-keyboard-inset', `${Math.max(0, window.innerHeight - (viewport?.height || window.innerHeight) - (viewport?.offsetTop || 0))}px`);
      panel.current?.classList.toggle('sol-compact', (viewport?.height || window.innerHeight) < 440);
    };
    sizePanel();
    viewport?.addEventListener('resize', sizePanel);
    viewport?.addEventListener('scroll', sizePanel);
    window.addEventListener('resize', sizePanel);
    return () => {
      document.removeEventListener('keydown', escape);
      viewport?.removeEventListener('resize', sizePanel);
      viewport?.removeEventListener('scroll', sizePanel);
      window.removeEventListener('resize', sizePanel);
    };
  }, [open, checkReady, hide]);

  useEffect(() => {
    scrollArea.current?.scrollTo({ top: messages.length || busy || failure ? scrollArea.current.scrollHeight : 0, behavior: 'instant' });
  }, [messages, busy, failure, open]);

  useEffect(() => {
    if (!failure?.retryAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [failure?.retryAt]);

  async function send(payload: ChatInput, retry = false) {
    if (request.current || ready !== 'ready') return;
    if (!retry) { setMessages(previous => [...previous, { role: 'user', content: payload.message }]); setDraft(''); }
    setBusy(true); setFailure(null); setAnnouncement('Sol is thinking.');
    const controller = new AbortController();
    request.current = controller;
    const version = ++generation.current;
    const timer = window.setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch(`${config.backendUrl}/api/chat`, {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const data = await response.json() as SolReply & { error?: { code?: string; retryAfter?: number } };
      if (!response.ok) {
        const seconds = Number(data.error?.retryAfter || 0);
        const retryAfter = Number.isFinite(seconds) ? Math.min(86400, Math.max(0, seconds)) : 0;
        if (version === generation.current) {
          if ([403, 503].includes(response.status)) setReady('offline');
          const message = response.status === 429
            ? 'Sol has reached a request limit. Try again later, or use a quick link.'
            : [403, 503].includes(response.status)
              ? 'Conversational replies are unavailable. The quick links still work.'
              : 'Sol couldn’t get a reply. Give it another try, or use a quick link.';
          setFailure({ message, request: payload, retryAt: Date.now() + retryAfter * 1000 });
          setNow(Date.now());
          setAnnouncement(message);
        }
        return;
      }
      const reply = parseReply(data); // independently reject unapproved IDs; ignore any server-supplied URLs
      if (version === generation.current) {
        setMessages(previous => [...previous, { role: 'assistant', content: reply.answer, destinationIds: reply.destinationIds }]);
        setAnnouncement(`Sol says: ${reply.answer}`);
      }
    } catch {
      if (version === generation.current) {
        const message = 'Sol couldn’t connect. Please retry, or use a quick link.';
        setFailure({ message, request: payload, retryAt: 0 }); setAnnouncement(message);
      }
    } finally {
      clearTimeout(timer);
      if (version === generation.current) { setBusy(false); request.current = null; }
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || draft.length > MAX_INPUT_LENGTH || busy || failure) return;
    void send({ message: draft.trim(), history: boundHistory(messages.map(({ role, content }) => ({ role, content }))) });
  }

  const waitSeconds = failure ? Math.max(0, Math.ceil((failure.retryAt - now) / 1000)) : 0;
  return <div className="sol-widget">
    <button ref={launcher} hidden={open} className="sol-launcher" onClick={show} aria-label="Ask Sol" aria-expanded={open} aria-haspopup="dialog" aria-controls={open ? 'sol-panel' : undefined} type="button">
      <span className="sol-launcher-art"><img src={(reducedMotion ? config.headerMascotUrl : config.launcherMascotUrl) || config.mascotUrl} onError={imageFallback} alt="" /></span><span>Ask Sol <MessageCircle size={17} aria-hidden="true" /></span>
    </button>
    {open && <section ref={panel} id="sol-panel" className="sol-panel" role="dialog" aria-labelledby="sol-title" aria-describedby="sol-description">
      <div className="sol-header">
        <img src={config.headerMascotUrl || config.mascotUrl} onError={imageFallback} alt="" />
        <div className="sol-header-copy"><h2 id="sol-title">Sol</h2><p id="sol-description">Your flame companion</p></div>
        <button ref={closeButton} type="button" className="sol-icon-button" onClick={hide} aria-label="Close Sol" title="Close Sol"><X size={21} /></button>
      </div>
      <div className="sol-scroll" ref={scrollArea} tabIndex={0} role="region" aria-label="Conversation history">
        <div className="sol-welcome">
          <span className="sol-eyebrow">NICE TO MEET YOU</span>
          <h3>Hi, I’m Sol!</h3>
          <p>I’m Ignite’s little flame guide. Ask me about the program, meet the team, or find your next stop.</p>
          <nav className="sol-quick-grid" aria-label="Quick actions">{quickActions.map(id => <NavLink key={id} id={id} websiteBaseUrl={config.websiteBaseUrl} quick />)}</nav>
        </div>
        {ready === 'checking' && <p className="sol-notice" role="status">Checking if Sol can chat…</p>}
        {ready === 'offline' && <div className="sol-notice" role="status"><p>Conversational replies are unavailable right now. You can still explore with the links above.</p><button className="sol-text-button" type="button" onClick={() => void checkReady()}><RotateCcw size={14} /> Retry connection</button></div>}
        <ol className="sol-messages" aria-label="Messages">{messages.map((message, index) => <li key={index} className={`sol-message sol-${message.role}`}>
          <span className="sol-message-label">{message.role === 'user' ? 'You' : 'Sol'}</span>
          <p>{message.content}</p>
          {!!message.destinationIds?.length && <nav aria-label="Suggested pages">{message.destinationIds.map(id => <NavLink key={id} id={id} websiteBaseUrl={config.websiteBaseUrl} />)}</nav>}
        </li>)}</ol>
        {busy && <div className="sol-thinking"><span className="sol-thinking-dots" aria-hidden="true"><i /><i /><i /></span> Sol is thinking…</div>}
        {failure && <div className="sol-error"><p>{failure.message}</p>
          <button type="button" className="sol-text-button" disabled={busy || ready !== 'ready' || waitSeconds > 0} onClick={() => void send(failure.request, true)}><RotateCcw size={15} /> {waitSeconds > 0 ? `Retry in ${waitSeconds}s` : 'Retry message'}</button>
          <button type="button" className="sol-text-button" onClick={() => { setFailure(null); requestAnimationFrame(() => input.current?.focus()); }}>Dismiss</button>
        </div>}
      </div>
      <div className="sol-footer">
        <p className="sol-help-line">Need a person? <a href={destinations.contact.url}>Email Ignite <ArrowUpRight size={12} /></a></p>
        <form onSubmit={submit} className="sol-composer">
          <label htmlFor="sol-question" className="sol-sr">Your question for Sol</label>
          <textarea id="sol-question" ref={input} rows={1} value={draft} onChange={event => setDraft(event.target.value)} maxLength={MAX_INPUT_LENGTH} placeholder={ready === 'ready' ? 'What are you curious about?' : 'Chat is currently unavailable'} disabled={ready !== 'ready' || !!failure} aria-describedby={draft.length > 800 ? 'sol-input-hint' : undefined} onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
          }} />
          <button type="submit" className="sol-send" aria-label="Send message" disabled={ready !== 'ready' || busy || !!failure || !draft.trim() || draft.length > MAX_INPUT_LENGTH}><Send size={18} /></button>
        </form>
        {draft.length > 800 && <p id="sol-input-hint" className="sol-input-hint">{draft.length}/{MAX_INPUT_LENGTH}</p>}
        <p className="sol-privacy">AI replies can be imperfect. Please keep personal details private.<br />Questions go to OpenAI. History resets when you reload.</p>
      </div>
    </section>}
    <div className="sol-sr" role="status" aria-live="polite" aria-atomic="true">{open ? announcement : ''}</div>
  </div>;
}
