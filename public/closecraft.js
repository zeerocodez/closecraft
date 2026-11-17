(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__closecraft_widget_loaded) return;
  window.__closecraft_widget_loaded = true;

  // Resolve active script tag to extract workspace attributes
  var scriptTag = document.currentScript || document.querySelector('script[data-workspace]');
  var workspaceSlug = scriptTag ? scriptTag.getAttribute('data-workspace') : null;
  var apiHost = scriptTag && scriptTag.getAttribute('data-host') ? scriptTag.getAttribute('data-host') : '';
  var buttonText = scriptTag && scriptTag.getAttribute('data-button-text') ? scriptTag.getAttribute('data-button-text') : 'Talk to Sales';

  if (!workspaceSlug) {
    console.warn('[Closecraft] Missing required data-workspace attribute on script tag.');
    return;
  }

  // Inject widget CSS styles
  var style = document.createElement('style');
  style.textContent = `
    .cc-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #248277;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 9999px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.15);
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .cc-widget-btn:hover {
      background: #1f6f65;
      transform: translateY(-2px);
      box-shadow: 0 14px 28px -5px rgba(0,0,0,0.5);
    }
    .cc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(4px);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .cc-modal-box {
      background: #0f1214;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      max-width: 440px;
      width: 100%;
      padding: 24px;
      color: #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
      position: relative;
    }
    .cc-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .cc-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .cc-modal-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .cc-modal-close:hover {
      color: #ffffff;
    }
    .cc-form-group {
      margin-bottom: 14px;
    }
    .cc-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    .cc-input, .cc-textarea {
      width: 100%;
      box-sizing: border-box;
      background: #0a0d12;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13px;
      color: #ffffff;
      outline: none;
      transition: border-color 0.2s;
    }
    .cc-input:focus, .cc-textarea:focus {
      border-color: #45bfae;
    }
    .cc-submit-btn {
      width: 100%;
      background: #248277;
      color: #ffffff;
      padding: 12px;
      border-radius: 12px;
      border: none;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 8px;
    }
    .cc-submit-btn:hover {
      background: #1f6f65;
    }
    .cc-submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .cc-success-box {
      text-align: center;
      padding: 24px 8px;
    }
    .cc-success-title {
      font-size: 18px;
      font-weight: 700;
      color: #45bfae;
      margin-bottom: 8px;
    }
    .cc-success-msg {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);

  // Create floating button
  var btn = document.createElement('button');
  btn.className = 'cc-widget-btn';
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>${buttonText}</span>
  `;
  document.body.appendChild(btn);

  // Modal lifecycle
  var modalBackdrop = null;

  function openModal() {
    if (modalBackdrop) return;

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'cc-modal-backdrop';
    modalBackdrop.innerHTML = `
      <div class="cc-modal-box">
        <div class="cc-modal-header">
          <h3 class="cc-modal-title">Send Us a Message</h3>
          <button class="cc-modal-close" id="cc-close-btn">&times;</button>
        </div>
        <form id="cc-lead-form">
          <div class="cc-form-group">
            <label class="cc-label">Your Full Name *</label>
            <input type="text" class="cc-input" id="cc-name" placeholder="e.g. Aliko Dangote" required />
          </div>
          <div class="cc-form-group">
            <label class="cc-label">Email Address</label>
            <input type="email" class="cc-input" id="cc-email" placeholder="name@company.com" />
          </div>
          <div class="cc-form-group">
            <label class="cc-label">Phone or WhatsApp</label>
            <input type="tel" class="cc-input" id="cc-phone" placeholder="+234..." />
          </div>
          <div class="cc-form-group">
            <label class="cc-label">How can we help your business? *</label>
            <textarea class="cc-textarea" id="cc-message" rows="3" placeholder="Briefly describe what you're looking for..." required></textarea>
          </div>
          <button type="submit" class="cc-submit-btn" id="cc-submit">Submit Enquiry</button>
        </form>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    document.getElementById('cc-close-btn').onclick = closeModal;
    modalBackdrop.onclick = function (e) {
      if (e.target === modalBackdrop) closeModal();
    };

    var form = document.getElementById('cc-lead-form');
    form.onsubmit = function (e) {
      e.preventDefault();
      var submitBtn = document.getElementById('cc-submit');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';

      var payload = {
        workspaceSlug: workspaceSlug,
        name: document.getElementById('cc-name').value,
        email: document.getElementById('cc-email').value || undefined,
        phone: document.getElementById('cc-phone').value || undefined,
        message: document.getElementById('cc-message').value,
      };

      var endpoint = (apiHost ? apiHost.replace(/\\/$/, '') : '') + '/api/leads/embed';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Submission failed');
          return res.json();
        })
        .then(function () {
          var modalBox = modalBackdrop.querySelector('.cc-modal-box');
          modalBox.innerHTML = `
            <div class="cc-success-box">
              <div class="cc-success-title">Message Received!</div>
              <p class="cc-success-msg">Thank you. Our sales operations team has received your enquiry and will be in touch shortly.</p>
              <button class="cc-submit-btn" id="cc-done-btn" style="margin-top:16px;">Done</button>
            </div>
          `;
          document.getElementById('cc-done-btn').onclick = closeModal;
        })
        .catch(function (err) {
          alert(err.message || 'Error submitting message. Please try again.');
          submitBtn.disabled = false;
          submitBtn.innerText = 'Submit Enquiry';
        });
    };
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.remove();
      modalBackdrop = null;
    }
  }

  btn.onclick = openModal;
})();
