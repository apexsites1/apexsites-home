/* ==========================================================================
   ApexSites — Consent-aware marketing tracking scaffold
   --------------------------------------------------------------------------
   NO REAL IDS ARE HARDCODED. Replace every __PLACEHOLDER__ below before launch,
   ideally by managing tags inside a single GTM container.

   Load order (in <head>, deferred):
     <script src="/assets/js/tracking.js" defer></script>

   This scaffold:
     - Initializes a clean dataLayer + Google Consent Mode v2 defaults (denied)
     - Waits for consent before loading GTM / GA4 / Ads / Meta / TikTok / LinkedIn
     - Exposes ApexTrack.event(name, params) for the event taxonomy
     - Exposes ApexTrack.grantConsent() / denyConsent() for your consent banner
   Server-side Conversions APIs (Meta CAPI, TikTok Events API, LinkedIn CAPI)
   are documented as placeholders — send events to your backend endpoint.
   ========================================================================== */
(function () {
  'use strict';

  // ---- Replace these before launch (or manage via GTM) --------------------
  var IDS = {
    GTM:        '__GTM_CONTAINER_ID__',      // e.g. GTM-XXXXXXX
    GA4:        '__GA4_MEASUREMENT_ID__',    // e.g. G-XXXXXXXXXX
    GOOGLE_ADS: '__GOOGLE_ADS_ID__',         // e.g. AW-XXXXXXXXX
    META_PIXEL: '__META_PIXEL_ID__',
    TIKTOK_PIXEL: '__TIKTOK_PIXEL_ID__',
    LINKEDIN_PARTNER: '__LINKEDIN_PARTNER_ID__'
  };
  // Server-side Conversions API endpoint on YOUR backend (proxies to Meta/TikTok/LinkedIn).
  var CAPI_ENDPOINT = '__SERVER_CAPI_ENDPOINT__'; // e.g. https://api.apexsites.ai/events

  // ---- dataLayer + Consent Mode v2 defaults (denied until user consents) --
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  var loaded = false;

  function loadScript(src, attrs) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
    return s;
  }

  // ---- Load marketing tags AFTER consent -----------------------------------
  function loadMarketingTags() {
    if (loaded) return;
    loaded = true;

    // Google Tag Manager (preferred single container for GA4 + Ads)
    if (IDS.GTM.indexOf('__') !== 0) {
      loadScript('https://www.googletagmanager.com/gtm.js?id=' + IDS.GTM);
    }
    // GA4 direct (skip if managed inside GTM)
    if (IDS.GA4.indexOf('__') !== 0) {
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + IDS.GA4);
      gtag('js', new Date());
      gtag('config', IDS.GA4);
      if (IDS.GOOGLE_ADS.indexOf('__') !== 0) gtag('config', IDS.GOOGLE_ADS);
    }
    // Meta Pixel
    if (IDS.META_PIXEL.indexOf('__') !== 0) {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', IDS.META_PIXEL); window.fbq('track', 'PageView');
    }
    // TikTok Pixel
    if (IDS.TIKTOK_PIXEL.indexOf('__') !== 0) {
      !function (w, d, t) {
        w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
        ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
        ttq.setAndDefer = function (o, m) { o[m] = function () { o.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.load = function (e) { var s = 'https://analytics.tiktok.com/i18n/pixel/events.js'; var a = d.createElement('script'); a.async = !0; a.src = s + '?sdkid=' + e; var f = d.getElementsByTagName('script')[0]; f.parentNode.insertBefore(a, f); };
        ttq.load(IDS.TIKTOK_PIXEL); ttq.page();
      }(window, document, 'ttq');
    }
    // LinkedIn Insight Tag
    if (IDS.LINKEDIN_PARTNER.indexOf('__') !== 0) {
      window._linkedin_partner_id = IDS.LINKEDIN_PARTNER;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(IDS.LINKEDIN_PARTNER);
      loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
    }

    ApexTrack.event('PageView', { page: location.pathname });
  }

  // ---- Event taxonomy (PDR) -----------------------------------------------
  // Supported: PageView, ViewContent, CTA_Click, Lead, CompleteRegistration,
  // StartTrial, GenerateSiteStarted, GenerateSiteCompleted, PricingViewed,
  // InitiateCheckout, Subscribe, DemoBooked, contact_submitted, page_view,
  // cta_click, pricing_viewed, generate_site_started, generate_site_completed,
  // initiate_checkout, demo_booked, complete_registration
  var ApexTrack = {
    event: function (name, params) {
      params = params || {};
      var payload = Object.assign({ event: name, timestamp: Date.now() }, params);
      window.dataLayer.push(payload);
      // Mirror to platform pixels when present and consented
      try { if (window.fbq && loaded) window.fbq('trackCustom', name, params); } catch (e) {}
      try { if (window.ttq && loaded) window.ttq.track(name, params); } catch (e) {}
      // Server-side Conversions API placeholder (Meta CAPI / TikTok Events API / LinkedIn CAPI)
      if (loaded && CAPI_ENDPOINT.indexOf('__') !== 0 && navigator.sendBeacon) {
        try { navigator.sendBeacon(CAPI_ENDPOINT, JSON.stringify(payload)); } catch (e) {}
      }
    },
    grantConsent: function () {
      gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted',
        ad_personalization: 'granted', analytics_storage: 'granted'
      });
      loadMarketingTags();
      try { localStorage.setItem('apx_consent', 'granted'); } catch (e) {}
    },
    denyConsent: function () {
      try { localStorage.setItem('apx_consent', 'denied'); } catch (e) {}
    }
  };
  window.ApexTrack = ApexTrack;

  // ---- Auto data-attribute wiring: <a data-track="CTA_Click" data-track-cta="Start Free">
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var name = el.getAttribute('data-track');
    var params = {};
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (a.name.indexOf('data-track-') === 0 && a.name !== 'data-track') {
        params[a.name.replace('data-track-', '')] = a.value;
      }
    });
    ApexTrack.event(name, params);
  });

  // ---- Restore prior consent (re-visits) -----------------------------------
  try { if (localStorage.getItem('apx_consent') === 'granted') ApexTrack.grantConsent(); } catch (e) {}
})();
