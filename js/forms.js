var DV_WORDPRESS_URL = 'https://deverhuizing.nl';

(function() {
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
      setTimeout(function() { div.remove(); }, 5000);
    }
  }

  function setLoading(button, loading) {
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

  function submitToWP(endpoint, data, form, button) {
    setLoading(button, true);
    fetch(DV_WORDPRESS_URL + '/wp-json/deverhuizing/v1/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      setLoading(button, false);
      if (result.success) {
        showMessage(form, 'Bedankt! Uw aanvraag is succesvol verzonden. We nemen zo snel mogelijk contact met u op.', false);
        form.reset();
      } else {
        showMessage(form, result.message || 'Er ging iets mis. Probeer het opnieuw.', true);
      }
    })
    .catch(function() {
      setLoading(button, false);
      showMessage(form, 'Er ging iets mis met de verbinding. Probeer het opnieuw of bel ons op 070 7070341.', true);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {

    var quickForm = document.querySelector('[data-testid="form-quick-quote"]');
    if (quickForm) {
      quickForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = quickForm.querySelector('[data-testid="button-quick-submit"]') || quickForm.querySelector('button[type="submit"]');
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
        submitToWP('quote', data, quickForm, btn);
      });
    }

    var callbackForms = document.querySelectorAll('form');
    callbackForms.forEach(function(form) {
      if (form === quickForm) return;
      var firstNameField = form.querySelector('[data-testid="input-callback-firstname"]');
      if (!firstNameField) return;

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('[data-testid="button-callback-submit"]') || form.querySelector('button[type="submit"]');
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
        submitToWP('callback', data, form, btn);
      });
    });

    var quoteForm = document.querySelector('[data-testid="card-quote-form"]');
    if (quoteForm) {
      var actualForm = quoteForm.querySelector('form') || quoteForm.closest('form');
      if (!actualForm) {
        var forms = quoteForm.querySelectorAll('form');
        actualForm = forms.length > 0 ? forms[0] : null;
      }
      if (!actualForm) {
        var parentForms = document.querySelectorAll('form');
        parentForms.forEach(function(f) {
          if (f.querySelector('[data-testid="input-quote-firstname"]')) {
            actualForm = f;
          }
        });
      }

      if (actualForm) {
        actualForm.addEventListener('submit', function(e) {
          e.preventDefault();
          var btn = document.querySelector('[data-testid="button-quote-submit"]') || actualForm.querySelector('button[type="submit"]');
          var data = {
            firstName: getVal(actualForm, 'firstName'),
            lastName: getVal(actualForm, 'lastName'),
            email: getVal(actualForm, 'email'),
            phone: getVal(actualForm, 'phone'),
            moveFromAddress: getVal(actualForm, 'moveFromAddress'),
            moveFromPostcode: getVal(actualForm, 'moveFromPostcode'),
            moveFromCity: getVal(actualForm, 'moveFromCity'),
            moveToAddress: getVal(actualForm, 'moveToAddress'),
            moveToPostcode: getVal(actualForm, 'moveToPostcode'),
            moveToCity: getVal(actualForm, 'moveToCity'),
            moveType: getVal(actualForm, 'moveType'),
            moveDate: getVal(actualForm, 'moveDate'),
            additionalNotes: getVal(actualForm, 'additionalNotes')
          };
          if (!data.firstName || !data.email || !data.phone) {
            showMessage(actualForm, 'Vul a.u.b. uw naam, e-mail en telefoonnummer in.', true);
            return;
          }
          submitToWP('quote', data, actualForm, btn);
        });
      }
    }
  });
})();
