/* ==========================================================================
   Australian Fracture Group: page script
   LAYOUT FILE. Content editors do not need to change anything in here.
   This script reads the JSON files in /site/data/ and builds the page.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (selector) { return document.querySelector(selector); };

  /** Build a DOM element: el('p', {class: 'x'}, 'text', childNode) */
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== '') {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child === null || child === undefined || child === false) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function loadJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) throw new Error(path + ' could not be loaded (' + response.status + ')');
      return response.json();
    });
  }

  function showError(container, what, error) {
    clear(container);
    var message = 'Sorry, the ' + what + ' could not be loaded.';
    if (location.protocol === 'file:') {
      message += ' This page must be opened through a web server, not directly from a file. See the README ("Preview on your computer").';
    }
    container.appendChild(el('p', { class: 'load-error' }, message));
    if (window.console) console.error(what, error);
  }

  /* ---------- Site basics ---------- */
  function renderSite(site) {
    if (site.name) {
      $('#hero-title').textContent = site.name;
      document.title = site.name;
    }
    if (site.logo) $('.logo').textContent = site.logo;
    if (site.tagline) $('#hero-tagline').textContent = site.tagline;
    $('#footer-text').textContent =
      '© ' + new Date().getFullYear() + ' ' + (site.name || 'Australian Fracture Group');
  }

  /* ---------- History ---------- */
  function renderHistory(history) {
    var body = $('#history-body');
    clear(body);
    var byline = [history.title, history.author].filter(Boolean).join(' · ');
    $('#history-byline').textContent = byline;

    (history.sections || []).forEach(function (section) {
      var article = el('article', { class: 'history-section' }, el('h3', null, section.heading));
      (section.paragraphs || []).forEach(function (text) {
        article.appendChild(el('p', null, text));
      });
      body.appendChild(article);
    });
  }

  /* ---------- Members ---------- */
  function personNode(person) {
    return el('div', { class: 'person' },
      el('span', { class: 'person-name' }, person.name),
      person.affiliation ? el('span', { class: 'person-aff' }, person.affiliation) : null
    );
  }

  /** Surname used for A-Z grouping: the "surname" field if given, otherwise the last word of the name. */
  function surnameOf(person) {
    if (person.surname) return person.surname;
    var words = String(person.name).replace(/[.,]+$/, '').trim().split(/\s+/);
    return words[words.length - 1];
  }

  function sortKey(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function renderMembers(members) {
    var committee = $('#committee-body');
    clear(committee);
    (members.committee || []).forEach(function (group) {
      var people = el('div', { class: 'role-people' });
      (group.people || []).forEach(function (p) { people.appendChild(personNode(p)); });
      committee.appendChild(el('div', { class: 'role-row' },
        el('div', { class: 'role-label' }, group.role),
        people
      ));
    });

    var grid = $('#group-members');
    clear(grid);
    var byLetter = {};
    (members.groupMembers || []).forEach(function (person) {
      var surname = surnameOf(person);
      var letter = sortKey(surname).charAt(0).toUpperCase() || '#';
      (byLetter[letter] = byLetter[letter] || []).push({ person: person, key: sortKey(surname) + ' ' + sortKey(person.name) });
    });
    Object.keys(byLetter).sort().forEach(function (letter) {
      var block = el('div', { class: 'alpha-block' }, el('h4', null, letter));
      byLetter[letter]
        .sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; })
        .forEach(function (entry) { block.appendChild(personNode(entry.person)); });
      grid.appendChild(block);
    });
  }

  /* ---------- Events ---------- */
  function parseDate(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }

  /** Upcoming events whose (end) date has not passed. Undated events always show. Soonest first. */
  function currentUpcoming(list) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var kept = (list || []).filter(function (ev) {
      var last = parseDate(ev.endDate) || parseDate(ev.date);
      return !last || last >= today;
    });
    return kept
      .map(function (ev, index) { return { ev: ev, index: index, time: parseDate(ev.date) }; })
      .sort(function (a, b) {
        if (a.time && b.time) return a.time - b.time;
        if (a.time) return -1;
        if (b.time) return 1;
        return a.index - b.index;
      })
      .map(function (item) { return item.ev; });
  }

  function metaLine(ev) {
    return [ev.when, ev.venue].filter(Boolean).join(' · ');
  }

  function linkNode(ev) {
    if (!ev.link) return null;
    return el('p', null, el('a', { href: ev.link, rel: 'noopener' }, ev.linkText || 'More information'));
  }

  function renderEvents(events) {
    var body = $('#events-body');
    clear(body);

    var upcoming = currentUpcoming(events.upcoming);
    if (upcoming.length) {
      var next = upcoming[0];
      body.appendChild(el('div', { class: 'next-event' },
        el('p', { class: 'eyebrow' }, 'Next event'),
        el('h3', null, next.title),
        el('p', { class: 'meta' }, metaLine(next)),
        next.details ? el('p', null, next.details) : null,
        linkNode(next)
      ));
      if (upcoming.length > 1) {
        var list = el('ul');
        upcoming.slice(1).forEach(function (ev) {
          list.appendChild(el('li', null,
            el('strong', null, ev.title),
            ' – ' + metaLine(ev) + (ev.details ? '. ' + ev.details : '')
          ));
        });
        body.appendChild(el('div', { class: 'also-coming' }, el('h3', null, 'Also coming up'), list));
      }
    } else {
      body.appendChild(el('div', { class: 'next-event' },
        el('p', { class: 'eyebrow' }, 'Next event'),
        el('h3', null, 'To be announced'),
        el('p', null, 'No events are scheduled at the moment. Please check back soon.')
      ));
    }

    body.appendChild(el('h3', { class: 'past-title' }, 'Previous events'));

    (events.past || []).forEach(function (series) {
      var section = el('div', { class: 'series' }, el('h4', null, series.name));
      section.appendChild(el('div', { class: 'event-head', 'aria-hidden': 'true' },
        el('span', null, 'Year'), el('span', null, 'Venue'), el('span', null, 'Chair(s)'), el('span', null, 'Awards')
      ));
      var rows = el('ul');
      (series.events || []).forEach(function (ev) {
        rows.appendChild(el('li', { class: 'event-row' },
          el('span', { class: 'ev-year' }, String(ev.year)),
          el('span', { class: 'ev-venue' }, ev.venue),
          el('span', { class: 'ev-chairs' }, ev.chairs),
          el('span', { class: 'ev-award' }, ev.award || '')
        ));
      });
      section.appendChild(rows);
      body.appendChild(section);
    });

    if ((events.proceedings || []).length) {
      var items = el('ul');
      events.proceedings.forEach(function (item) {
        items.appendChild(el('li', null,
          item.url ? el('a', { href: item.url, rel: 'noopener' }, item.label) : item.label
        ));
      });
      body.appendChild(el('div', { class: 'proceedings' }, el('h4', null, 'Proceedings'), items));
    }
  }

  /* ---------- Contact ---------- */
  function renderContact(contact) {
    var body = $('#contact-body');
    clear(body);
    body.appendChild(el('h3', { class: 'contact-name' }, contact.name));
    var org = [contact.role, contact.organisation].filter(Boolean).join(', ');
    if (org) body.appendChild(el('p', { class: 'contact-org' }, org));
    if (contact.email) {
      // The address is only put into the page by this script, which keeps it away from simple spam bots.
      body.appendChild(el('p', null,
        el('a', { class: 'contact-email', href: 'mailto:' + contact.email }, contact.email)
      ));
    }
  }

  /* ---------- Navigation ---------- */
  function setupNav() {
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });

    // Highlight the link for the section being read.
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].classList.toggle('is-active', id === entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Start ---------- */
  function start() {
    setupNav();

    var jobs = [
      ['data/site.json', 'site details', renderSite, null],
      ['data/history.json', 'history', renderHistory, $('#history-body')],
      ['data/members.json', 'member list', renderMembers, $('#committee-body')],
      ['data/events.json', 'events', renderEvents, $('#events-body')],
      ['data/contact.json', 'contact details', renderContact, $('#contact-body')]
    ];

    jobs.forEach(function (job) {
      loadJSON(job[0]).then(job[2]).catch(function (error) {
        if (job[3]) showError(job[3], job[1], error);
        else if (window.console) console.error(job[1], error);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
