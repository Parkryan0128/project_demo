/**
 * Loads data.json and renders the whole page.
 * Edit data.json to add/change profile, experience, projects, contact.
 *
 * Note: browsers block fetch() on file:// — serve locally, e.g.:
 *   python3 -m http.server 8000
 * then open http://localhost:8000
 */

const DATA_URL = "data.json";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderTags(tags, variant) {
  const wrap = el("div", `tags ${variant}`);
  (tags || []).forEach((t) => wrap.appendChild(el("span", null, t)));
  return wrap;
}

function renderHeader(data) {
  const { site, profile, nav } = data;

  document.title = site.title || "Portfolio";
  document.getElementById("window-title").textContent = site.windowTitle || "";

  const shell = document.getElementById("shell-intro");
  shell.innerHTML = "";

  const line1 = el("p");
  line1.innerHTML = `<span class="prompt">${site.shellUser} ~ $</span> hostname --fqdn`;
  const line2 = el("p", "output", site.hostname);
  const line3 = el("p");
  line3.innerHTML =
    `<span class="prompt">${site.shellUser} ~ $</span> ` +
    `./contact --name <span class="string">"${profile.name}"</span>` +
    `<span class="cursor" aria-hidden="true"></span>`;
  shell.append(line1, line2, line3);

  document.getElementById("avatar").textContent = profile.initials || "";
  document.getElementById("role").textContent = profile.role || "";

  const navEl = document.getElementById("nav");
  navEl.innerHTML = "";
  (nav || []).forEach((item) => {
    const a = el("a", item.active ? "active" : null, item.label);
    a.href = item.href || "#";
    navEl.appendChild(a);
  });
}

function renderExperience(items) {
  const list = document.getElementById("exp-list");
  list.innerHTML = "";

  (items || []).forEach((job) => {
    const li = el("li", "exp-item");
    const logo = el("div", "exp-logo", job.logo || "?");
    logo.setAttribute("aria-hidden", "true");

    const body = el("div", "exp-body");
    body.appendChild(el("p", "exp-company", job.company));
    body.appendChild(
      el("p", "exp-meta", `${job.title} · ${job.dates}`)
    );
    body.appendChild(renderTags(job.tags, "muted"));

    li.append(logo, body);
    list.appendChild(li);
  });
}

function renderProject(project) {
  const card = el("article", "project-card" + (project.span2 ? " span-2" : ""));

  card.appendChild(el("h3", "project-title", `> ./${project.slug}`));
  card.appendChild(el("p", "project-desc", project.description));

  if (project.tags?.length) {
    card.appendChild(renderTags(project.tags, "amber"));
  }

  if (project.media) {
    const media = el("div", "project-media", project.media.label || "[ media ]");
    if (project.media.src) {
      const img = document.createElement("img");
      img.src = project.media.src;
      img.alt = project.slug || "project media";
      media.textContent = "";
      media.appendChild(img);
    }
    card.appendChild(media);
  }

  if (project.subCommand) {
    card.appendChild(el("p", "sub-cmd", `> ${project.subCommand}`));
  }

  if (project.links?.length) {
    const actions = el("div", "project-actions");
    project.links.forEach((link) => {
      const btn = el("a", "btn");
      btn.href = link.url || "#";
      btn.innerHTML = `[${link.label} <span class="icon">${link.icon || ""}</span>]`;
      actions.appendChild(btn);
    });
    card.appendChild(actions);
  }

  return card;
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  grid.innerHTML = "";
  (projects || []).forEach((p) => grid.appendChild(renderProject(p)));
}

function renderContact(contact) {
  const footer = document.getElementById("footer-links");
  if (!contact) {
    footer.textContent = "";
    return;
  }

  footer.innerHTML = "";
  footer.appendChild(el("span", "prompt", "$"));
  footer.append(" email: ");

  const mail = el("a", null, contact.email);
  mail.href = `mailto:${contact.email}`;
  footer.appendChild(mail);

  if (contact.github) {
    footer.append(document.createTextNode(" | github: "));
    const g = el("a", null, contact.github.label);
    g.href = contact.github.url || "#";
    footer.appendChild(g);
  }

  if (contact.linkedin) {
    footer.append(document.createTextNode(" | linkedin: "));
    const l = el("a", null, contact.linkedin.label);
    l.href = contact.linkedin.url || "#";
    footer.appendChild(l);
  }
}

function render(data) {
  renderHeader(data);
  renderExperience(data.experience);
  renderProjects(data.projects);
  renderContact(data.contact);
}

async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error(err);
    document.getElementById("shell-intro").textContent =
      `Error: could not load ${DATA_URL}. Serve this folder over HTTP ` +
      `(e.g. python3 -m http.server 8000) instead of opening the file directly.`;
  }
}

init();
