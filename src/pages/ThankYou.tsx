import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RedirectArrow } from '../components/ui/redirect-arrow';
import './thank-you.css';

export default function ThankYou() {
  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robots = existing ?? document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    if (!existing) document.head.append(robots);
    return () => robots.remove();
  }, []);

  return <div className="thank-you-page">
    <img className="thank-you-background" src="/backgrounds/Thank%20You.jpg" alt="" fetchPriority="high" />

    <header className="thank-you-header">
      <Link className="thank-you-brand" to="/" aria-label="Ignite home">
        <img src="/mascots/Logo.png" width="36" height="36" alt="" />
        Ignite
      </Link>
    </header>

    <section className="thank-you-content" aria-labelledby="thank-you-title">
      <h1 id="thank-you-title">Thank you!</h1>
      <p>Thank you for your interest in Ignite Education! Your pre-enrollment form has been successfully submitted. We’re excited to help you explore practical life skills through our free educational programs.</p>
      <div className="thank-you-next">
        <p>We’ll contact you by email with updates about course availability, enrollment, and next steps. In the meantime, explore more of what Ignite has to offer at <Link to="/">ignitefindyourfire.org</Link>.</p>
      </div>
      <Link className="thank-you-home" to="/">
        Back to home <RedirectArrow />
      </Link>
    </section>
  </div>;
}
