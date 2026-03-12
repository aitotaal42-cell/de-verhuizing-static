var DV_API_URL = 'https://crm.deverhuizing.nl';
var DV_API_MODE = 'crm';

(function() {
  function getEndpointUrl(endpoint) {
    if (DV_API_MODE === 'wordpress') {
      return DV_API_URL + '/wp-json/deverhuizing/v1/' + endpoint;
    }
    var map = { quote: 'quote-requests', callback: 'callback-requests', contact: 'contact-messages' };
    return DV_API_URL + '/api/' + (map[endpoint] || endpoint);
  }

  function showThankYouModal(type) {
    var existing = document.getElementById('dv-thankyou-modal');
    if (existing) existing.remove();

    var titles = {
      quote: 'Aanvraag ontvangen!',
      callback: 'Terugbelverzoek ontvangen!',
      contact: 'Bericht ontvangen!'
    };
    var messages = {
      quote: 'Bedankt voor uw offerteaanvraag. We nemen binnen 24 uur contact met u op met een vrijblijvende offerte op maat.',
      callback: 'Bedankt! We bellen u zo snel mogelijk terug op het opgegeven telefoonnummer.',
      contact: 'Bedankt voor uw bericht. We reageren zo snel mogelijk, uiterlijk binnen 1 werkdag.'
    };

    var overlay = document.createElement('div');
    overlay.id = 'dv-thankyou-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);';

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:16px;padding:40px 32px;max-width:440px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.2);position:relative;">' +
        '<div style="width:64px;height:64px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '</div>' +
        '<h2 style="font-size:22px;font-weight:700;color:#1a3a5c;margin:0 0 12px;">' + (titles[type] || 'Bedankt!') + '</h2>' +
        '<p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 8px;">' + (messages[type] || 'Uw aanvraag is ontvangen.') + '</p>' +
        '<p style="font-size:13px;color:#94a3b8;margin:0 0 28px;">Heeft u vragen? Bel ons op <a href="tel:0707070341" style="color:#e87c28;font-weight:600;text-decoration:none;">070 7070341</a></p>' +
        '<button id="dv-modal-close" style="background:#e87c28;color:#fff;border:none;border-radius:8px;padding:12px 32px;font-size:15px;font-weight:600;cursor:pointer;width:100%;">Sluiten</button>' +
      '</div>';

    document.body.appendChild(overlay);

    function closeModal() { if (overlay.parentNode) overlay.remove(); }
    document.getElementById('dv-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handler); }
    });
  }

  function showMessage(form, message, isError) {
    var existing = form.querySelector('.dv-form-message');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.className = 'dv-form-message';
    div.style.cssText = 'padding:12px 16px;border-radius:8px;margin-top:12px;font-size:14px;font-weight:500;' +
      (isError ? 'background:#fef2f2;color:#dc2626;border:1px solid #fecaca;' : 'background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;');
    div.textContent = message;
    form.appendChild(div);
    if (!isError) {
      setTimeout(function() { if (div.parentNode) div.remove(); }, 5000);
    }
  }

  function setLoading(button, loading) {
    if (!button) return;
    if (loading) {
      button.dataset.originalText = button.textContent;
      button.textContent = 'Verzenden...';
      button.disabled = true;
      button.style.opacity = '0.7';
    } else {
      button.textContent = button.dataset.originalText || 'Verstuur';
      button.disabled = false;
      button.style.opacity = '1';
    }
  }

  function getVal(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function submitForm(endpoint, data, form, button) {
    setLoading(button, true);
    fetch(getEndpointUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(r) {
      if (!r.ok) {
        return r.json().catch(function() { return { message: 'Server fout (' + r.status + ')' }; }).then(function(err) {
          throw new Error(err.message || 'Er ging iets mis.');
        });
      }
      return r.json();
    })
    .then(function(result) {
      setLoading(button, false);
      if (result.success) {
        form.reset();
        showThankYouModal(endpoint);
      } else {
        showMessage(form, result.message || 'Er ging iets mis. Probeer het opnieuw.', true);
      }
    })
    .catch(function(err) {
      setLoading(button, false);
      showMessage(form, err.message || 'Er ging iets mis met de verbinding. Probeer het opnieuw of bel ons op 070 7070341.', true);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {

    var quickForm = document.querySelector('[data-testid="form-quick-quote"]');
    if (quickForm) {
      quickForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = quickForm.querySelector('[data-testid="button-quick-submit"]') || quickForm.querySelector('button[type="submit"]') || quickForm.querySelector('button');
        var data = {
          firstName: getVal(quickForm, 'firstName'),
          email: getVal(quickForm, 'email'),
          phone: getVal(quickForm, 'phone'),
          moveType: getVal(quickForm, 'moveType'),
          moveDate: getVal(quickForm, 'preferredDate')
        };
        if (!data.firstName || !data.phone) {
          showMessage(quickForm, 'Vul a.u.b. uw naam en telefoonnummer in.', true);
          return;
        }
        submitForm('quote', data, quickForm, btn);
      });
    }

    var allForms = document.querySelectorAll('form');
    allForms.forEach(function(form) {
      if (form === quickForm) return;

      var callbackFirstName = form.querySelector('[data-testid="input-callback-firstname"]');
      if (callbackFirstName) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var btn = form.querySelector('[data-testid="button-callback-submit"]') || form.querySelector('button[type="submit"]') || form.querySelector('button');
          var data = {
            firstName: getVal(form, 'firstName'),
            lastName: getVal(form, 'lastName'),
            phone: getVal(form, 'phone'),
            email: getVal(form, 'email'),
            preferredTime: getVal(form, 'requestType')
          };
          if (!data.firstName || !data.phone) {
            showMessage(form, 'Vul a.u.b. uw naam en telefoonnummer in.', true);
            return;
          }
          submitForm('callback', data, form, btn);
        });
        return;
      }

      var quoteFirstName = form.querySelector('[data-testid="input-quote-firstname"]');
      if (quoteFirstName) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var btn = form.querySelector('[data-testid="button-quote-submit"]') || form.querySelector('button[type="submit"]') || form.querySelector('button');
          var data = {
            firstName: getVal(form, 'firstName'),
            lastName: getVal(form, 'lastName'),
            email: getVal(form, 'email'),
            phone: getVal(form, 'phone'),
            moveFromAddress: getVal(form, 'moveFromAddress'),
            moveFromPostcode: getVal(form, 'moveFromPostcode'),
            moveFromCity: getVal(form, 'moveFromCity'),
            moveToAddress: getVal(form, 'moveToAddress'),
            moveToPostcode: getVal(form, 'moveToPostcode'),
            moveToCity: getVal(form, 'moveToCity'),
            moveType: getVal(form, 'moveType'),
            moveDate: getVal(form, 'moveDate'),
            additionalNotes: getVal(form, 'additionalNotes')
          };
          if (!data.firstName || !data.email || !data.phone) {
            showMessage(form, 'Vul a.u.b. uw naam, e-mail en telefoonnummer in.', true);
            return;
          }
          submitForm('quote', data, form, btn);
        });
        return;
      }

      var contactName = form.querySelector('[data-testid="input-contact-name"]');
      if (contactName) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var btn = form.querySelector('[data-testid="button-contact-submit"]') || form.querySelector('button[type="submit"]') || form.querySelector('button');
          var data = {
            name: getVal(form, 'name'),
            email: getVal(form, 'email'),
            phone: getVal(form, 'phone'),
            subject: getVal(form, 'subject'),
            message: getVal(form, 'message')
          };
          if (!data.name || !data.email || !data.message) {
            showMessage(form, 'Vul a.u.b. uw naam, e-mail en bericht in.', true);
            return;
          }
          submitForm('contact', data, form, btn);
        });
        return;
      }
    });
  });
})();
