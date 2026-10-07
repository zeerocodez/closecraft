import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Bot, Check, ChevronRight, CircleCheck, Command, GraduationCap, LayoutDashboard, MessageCircle, MousePointer2, Radio, ShieldCheck, Sparkles, Target, TrendingUp, Users, Workflow } from 'lucide-react';
import styles from './sample.module.css';

export const metadata: Metadata = {
  title: 'CloseCraft | Every conversation is an opportunity',
  description: 'Bring your leads, conversations and follow-ups into one focused sales workspace. Discover the CloseCraft revenue engine and Digital Sales School.',
};

const features = [
  { icon: MessageCircle, label: '01 / CONNECT', title: 'One inbox. The whole conversation.', text: 'Keep lead conversations and context together, so your next reply starts where the last one left off.', detail: 'A clearer view of every prospect', className: 'inbox' },
  { icon: Sparkles, label: '02 / QUALIFY', title: 'Know who needs your attention.', text: 'Use AI-assisted qualification to surface intent, understand the opportunity and prepare your next move.', detail: 'AI recommendations. Human judgment.', className: 'qualify' },
  { icon: Workflow, label: '03 / FOLLOW THROUGH', title: 'Keep good opportunities moving.', text: 'Connect follow-ups, appointments and your pipeline in one place. Give every lead a clear next step.', detail: 'From first message to next meeting', className: 'follow' },
];
const faqs = [
  ['Who is CloseCraft for?', 'CloseCraft brings together businesses that need a more organized sales process and aspiring sales professionals developing practical closing skills.'],
  ['Does AI replace my sales team?', 'Your team stays in control. AI can assist with qualification and draft replies, while people make the decisions, handle objections and build relationships.'],
  ['How do I get started?', 'Start with a revenue audit. Share how leads enter your business, what happens after the first conversation and where follow-ups fall through. The team can help identify the right next step.'],
  ['What is the Digital Sales School?', 'The Digital Sales School is the learning side of CloseCraft: a structured curriculum, AI role-play practice and assessments designed to help aspiring closers build practical sales skills.'],
];

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/sample" className={`${styles.brand} ${light ? styles.lightBrand : ''}`} aria-label="CloseCraft sample home"><span className={styles.brandIcon}><Command size={23} strokeWidth={2.3} /></span>closecraft<span className={styles.brandDot}>.</span></Link>;
}

function WorkspacePreview() {
  return <div className={styles.previewStage} aria-label="Illustrative CloseCraft sales workspace">
    <div className={styles.orbit} aria-hidden="true" />
    <div className={styles.workspace}>
      <div className={styles.windowBar}><div className={styles.windowDots}><i /><i /><i /></div><span>YOUR REVENUE WORKSPACE</span><span className={styles.previewTag}>PREVIEW</span></div>
      <div className={styles.workspaceBody}>
        <aside className={styles.workspaceRail} aria-hidden="true"><Command size={23} /><LayoutDashboard size={19} /><MessageCircle size={19} /><Users size={19} /><TrendingUp size={19} /><span className={styles.railAvatar}>JD</span></aside>
        <div className={styles.workspaceMain}>
          <div className={styles.workspaceHeading}><div><span className={styles.microText}>MONDAY, YOUR NEXT MOVE</span><h2>Let&apos;s close the gap.</h2></div><span className={styles.profileAvatar}>JD</span></div>
          <div className={styles.workspaceTabs}><span className={styles.activeTab}>Overview</span><span>Pipeline</span><span>Activity</span><span className={styles.workspaceDate}>This week <ArrowDown size={10} /></span></div>
          <div className={styles.opportunity}><div><span className={styles.microText}>TODAY&apos;S FOCUS</span><h3>Good conversations.<br />Clear next steps.</h3><span className={styles.opportunityPill}><TrendingUp size={12} /> Keep your pipeline moving</span></div><div className={styles.chart} aria-hidden="true">{[35, 48, 39, 62, 55, 76, 94].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div>
          <div className={styles.leadsTitle}><strong>Opportunities to move forward</strong><span>View all <ArrowUpRight size={12} /></span></div>
          <div className={styles.leadRow}><span className={`${styles.leadAvatar} ${styles.lilacAvatar}`}>AK</span><div><strong>Alex Kim</strong><small>Asked about team onboarding</small></div><span className={styles.leadStatus}>High intent</span></div>
          <div className={styles.leadRow}><span className={`${styles.leadAvatar} ${styles.orangeAvatar}`}>TM</span><div><strong>Taylor Morgan</strong><small>Ready to book a discovery call</small></div><span className={styles.leadStatus}>Follow up</span></div>
          <div className={styles.suggestedAction}><Sparkles size={17} /><div><strong>One conversation. One next step.</strong><small>Review the context. Make your next move.</small></div><ChevronRight size={17} /></div>
        </div>
      </div>
    </div>
    <div className={styles.floatingMessage}><span className={styles.messageIcon}><MessageCircle size={20} /></span><div><strong>A new conversation just started</strong><small>Turn interest into an opportunity.</small></div><span className={styles.notificationDot} /></div>
    <div className={styles.floatingAi}><span><Sparkles size={15} /> AI + HUMAN</span><p>A little less busywork.<br /><strong>A lot more possibility.</strong></p><div className={styles.aiAvatars}><span><Bot size={14} /></span><span>JD</span><Check size={15} /></div></div>
    <div className={styles.cursor} aria-hidden="true"><MousePointer2 size={23} fill="#c6f36b" /><span>Your next best move</span></div>
  </div>;
}

export default function SampleLandingPage() {
  return <div className={styles.page}>
    <a href="#main" className={styles.skipLink}>Skip to content</a>
    <div className={styles.darkTop}>
      <header className={styles.nav}>
        <Brand light />
        <nav className={styles.desktopNav} aria-label="Main navigation"><a href="#platform">The platform</a><a href="#how-it-works">How it works</a><a href="#school">Sales school <ArrowUpRight size={12} /></a></nav>
        <div className={styles.navActions}><Link href="/login" className={styles.login}>Log in <ArrowUpRight size={13} /></Link><a href="#get-started" className={styles.navCta}>Let&apos;s talk <ArrowRight size={15} /></a></div>
        <details className={styles.mobileNav}><summary aria-label="Open navigation"><span /><span /></summary><nav aria-label="Mobile navigation"><a href="#platform">The platform</a><a href="#how-it-works">How it works</a><a href="#school">Sales school</a><Link href="/login">Log in</Link><a href="#get-started">Let&apos;s talk</a></nav></details>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span /> A BETTER WAY TO MOVE REVENUE</div>
            <h1 id="hero-title">Every conversation.<br />More <span className={styles.highlight}>possibility.<svg viewBox="0 0 455 25" aria-hidden="true"><path d="M3 19 Q205 -5 451 11" /></svg></span></h1>
            <p>Your leads have potential. Give them a process.<br className={styles.desktopBreak} /> Bring conversations, AI insights and your sales team together — and turn the next message into the next opportunity.</p>
            <div className={styles.heroActions}><a href="#get-started" className={styles.primaryButton}>Find your next opportunity <ArrowUpRight size={19} /></a><a href="#platform" className={styles.secondaryButton}><span><ArrowDown size={16} /></span>Explore CloseCraft</a></div>
            <div className={styles.heroFootnote}><ShieldCheck size={15} /><span>Built around your team. Powered by possibility.</span></div>
          </div>
          <WorkspacePreview />
        </section>
        <div className={styles.heroBottom}><span>FROM FIRST HELLO TO WHAT&apos;S NEXT.</span><div><span><MessageCircle size={15} /> Conversations</span><span><Sparkles size={15} /> AI assistance</span><span><Users size={15} /> Human expertise</span></div><span className={styles.heroBottomArrow}><ArrowDown size={18} /></span></div>
      </main>
    </div>
    <section className={styles.workflowStrip} id="how-it-works" aria-label="How CloseCraft works"><div className={styles.stripIntro}>A little structure.<br /><strong>A lot of momentum.</strong></div>{[{ icon: Radio, text: 'Capture the interest' }, { icon: Target, text: 'Spot the opportunity' }, { icon: MessageCircle, text: 'Keep it moving' }, { icon: CircleCheck, text: 'Make the next move' }].map(({ icon: Icon, text }, index) => <div className={styles.workflowStep} key={text}><span><Icon size={20} /></span><strong>{text}</strong>{index < 3 && <ChevronRight className={styles.stepArrow} size={17} />}</div>)}</section>
    <section className={styles.platformSection} id="platform" aria-labelledby="platform-title">
      <div className={styles.sectionIntro}><div><span className={styles.sectionLabel}>YOUR PROCESS, CONNECTED</span><h2 id="platform-title">Less chasing.<br />More <span>closing.</span></h2></div><p>Great sales work happens when the right context meets the right action. Put both in your team&apos;s hands.</p></div>
      <div className={styles.featureGrid}>{features.map(({ icon: Icon, label, title, text, detail, className }) => <article className={`${styles.featureCard} ${styles[className]}`} key={label}><div className={styles.featureTop}><span className={styles.featureIcon}><Icon size={24} /></span><small>{label}</small></div><h3>{title}</h3><p>{text}</p><div className={styles.featureDetail}><CircleCheck size={15} />{detail}</div></article>)}</div>
    </section>
    <section className={styles.teamSection} id="school" aria-labelledby="school-title">
      <div className={styles.practiceCard}><div className={styles.practiceTop}><span><GraduationCap size={18} /> DIGITAL SALES SCHOOL</span><span className={styles.liveTag}>PRACTICE ROOM</span></div><div className={styles.waveform} aria-hidden="true">{[15, 30, 49, 26, 58, 74, 48, 90, 66, 47, 78, 96, 62, 81, 43, 66, 88, 58, 36, 62, 29, 44, 19].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className={styles.practicePrompt}><span className={styles.aiBuyer}><AudioLines size={19} /></span><div><small>AI BUYER · OBJECTION PRACTICE</small><p>“Help me understand why this<br />is the right fit for our team.”</p></div></div><div className={styles.practiceProgress}><span>Build confidence, one conversation at a time.</span><ArrowUpRight size={18} /></div></div>
      <div className={styles.schoolCopy}><span className={styles.sectionLabel}>THE HUMAN SIDE OF BETTER SALES</span><h2 id="school-title">Great tools.<br />Even better <span>closers.</span></h2><p>For the people behind the pipeline. Develop the skills to ask better questions, navigate objections and move conversations forward with the Digital Sales School.</p><ul><li><Check size={17} /> Learn the foundations of digital sales</li><li><Check size={17} /> Put the theory to work with AI role-play</li><li><Check size={17} /> Build evidence of what you can do</li></ul><Link href="/dss" className={styles.darkButton}>Explore the sales school <ArrowUpRight size={18} /></Link></div>
    </section>
    <section className={styles.faqSection} aria-labelledby="faq-title"><div><span className={styles.sectionLabel}>A LITTLE MORE CLARITY</span><h2 id="faq-title">Good questions.<br />Straight answers.</h2><p>Get to know the process behind the possibility.</p></div><div className={styles.faqList}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className={styles.finalCta} id="get-started" aria-labelledby="cta-title"><div className={styles.ctaDecoration} aria-hidden="true"><ArrowUpRight /></div><div><span className={styles.sectionLabel}>YOUR NEXT CHAPTER STARTS HERE</span><h2 id="cta-title">There&apos;s opportunity<br />in your next conversation.</h2><p>Let&apos;s look at your sales process and find it together.</p></div><Link href="/#audit" className={styles.primaryButton}>Book a revenue audit <ArrowUpRight size={20} /></Link></section>
    <footer className={styles.footer}><Brand /><span>A Zeerocodes product. Built for what&apos;s next.</span><div><Link href="/">Main website <ArrowUpRight size={13} /></Link><a href="#main">Back to top <ArrowUpRight size={13} /></a></div><small>© 2026 CloseCraft · Sample landing page</small></footer>
  </div>;
}
