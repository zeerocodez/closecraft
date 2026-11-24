# CloseCraft Demonstration Recording Guide

This guide provides step-by-step instructions for screen recording, audio capture, and post-production editing for the official two-minute demonstration video.

---

## 1. Technical Specifications

| Parameter | Recommended Standard |
| :--- | :--- |
| **Video Resolution** | 1920 &times; 1080 (Full HD 1080p, 16:9 widescreen) |
| **Frame Rate** | 60 fps (or 30 fps progressive) |
| **Bitrate** | 12–16 Mbps (H.264 / MP4) |
| **Audio Format** | 48 kHz, 24-bit WAV or 320 kbps AAC stereo |
| **Recording Software** | OBS Studio, ScreenFlow, or Loom HD (Pro recording mode) |
| **Browser Environment** | Google Chrome (Latest), Zoom: 100%, Bookmarks Bar hidden |

---

## 2. Pre-Recording Environment Checklist

1. **Database Seeding:**
   Run the dedicated seed script to ensure all 12 scenarios, 7 team members, and active leaks are populated:
   ```bash
   npx tsx scripts/seed_apex_demo_workspace.ts
   ```
2. **Clean Browser Profile:**
   * Disable browser extensions (Grammarly, ad blockers, translation banners).
   * Hide developer toolbars and bookmark bars (`Ctrl + Shift + B`).
   * Set window size to exact 1920&times;1080.
3. **Authentication:**
   * Sign into `http://localhost:3000/login` with `demo.owner@apexconsulting.ng` / `DemoAccess2026!`.
   * Keep a separate tab open to `/demo` for quick reference.
4. **Mouse Smoothing:**
   * Enable cursor highlight or smooth mouse tracking in your screen recorder to ensure viewers can easily follow clicks and drawer transitions.

---

## 3. Screen Recording Walkthrough (Scene-by-Scene)

### Section 1: The Problem (0:00 – 0:15)
* Start on `http://localhost:3000/`.
* Smoothly scroll down to the Revenue Leakage calculator.
* Click the slider to show `₦18.5M` in lost revenue.

### Section 2: Inbound Capture & WhatsApp Triage (0:15 – 0:35)
* Switch to `http://localhost:3000/inbox`.
* Point out the green badge indicating verified WhatsApp Business Platform connectivity.
* Click on **Dr. Adeyemi Adeleke** to view the raw conversation thread.

### Section 3: Structured AI Qualification (0:35 – 0:55)
* Navigate to `http://localhost:3000/leads`.
* Click Dr. Adeleke's row.
* Allow the lead details drawer to slide out smoothly.
* Pause for 2 seconds on the **Intent (95)**, **Fit (90)**, **Urgency (95)**, and **₦4.5M Budget** badges.
* Scroll to **David Adeleke** at the bottom to show how an under-budget lead is gracefully disqualified.

### Section 4: Sales Command Centre (0:55 – 1:15)
* Navigate to `http://localhost:3000/today`.
* Show the Hot Leads section.
* Click on the action card for Dr. Adeleke: reveal the Next Best Action (`SCHEDULE_DISCOVERY`) and the assigned closer (`Chidi Okafor`).
* Highlight the suggested WhatsApp conversation opener.

### Section 5: Discovery Scheduling & Leak Detection (1:15 – 1:35)
* Navigate to `http://localhost:3000/appointments`.
* Show the scheduled meeting with Google Meet link.
* Switch to `http://localhost:3000/pipeline`.
* Highlight **Chief Victor Okafor (₦6.0M)** flagged with the red **STALLED_OPPORTUNITY** badge.

### Section 6: Financial Separation & Final Close (1:35 – 2:00)
* Navigate to `http://localhost:3000/dashboard/revenue-engine`.
* Smoothly pan across the four distinct financial metric cards:
  * Estimated Opportunity Value
  * Qualified Pipeline Value
  * Closed-Won Contract Value
  * Verified Realised Revenue
* Fade to the official CloseCraft title card.

---

## 4. Voiceover & Audio Recording Tips

1. **Microphone Setup:** Use a dedicated USB condenser or dynamic broadcast microphone (e.g. Shure SM7B, Blue Yeti, Rode NT-USB) positioned 6 inches from the mouth with a pop filter.
2. **Pacing:** Maintain an energetic, confident, and professional executive tone. Avoid rushing; aim for 130–140 words per minute.
3. **Punch Lines:** Emphasize critical differentiators:
   * *"zero data leakage across tenant workspaces"*
   * *"CloseCraft never hallucinates"*
   * *"no fabricated numbers"*
   * *"Every viable lead closed."*

---

## 5. Post-Production & Editing Checklist

- [ ] Align screen video transitions with the timestamped audio script.
- [ ] Add smooth zoom-ins (110%–115%) on critical UI badges (Signals, Meeting links, Stalled Deal alerts).
- [ ] Import `captions.srt` to ensure full subtitle accessibility.
- [ ] Add subtle background music (lo-fi executive tech ambient, mixed at -24dB relative to voiceover at -6dB).
- [ ] Export final MP4 at 1080p, 60fps, stereo 48kHz.
