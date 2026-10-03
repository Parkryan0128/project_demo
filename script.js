/**
 * Loads data.json and renders the whole page.
 * Edit data.json to add/change profile, experience, projects, contact.
 *
 * Note: browsers block fetch() on file:// — serve locally, e.g.:
 *   python3 -m http.server 8000
 * then open http://localhost:8000
 */

const DATA_URL = "data.json?v=inventory-3";

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
  const { site, profile } = data;

  document.title = site.title || "Ryan Park";
  document.getElementById("window-title").textContent = site.windowTitle || "";

  const shell = document.getElementById("shell-intro");
  shell.innerHTML = "";

  const line1 = el("p");
  line1.innerHTML = `<span class="prompt">${site.shellUser} ~ $</span> hostname -f`;

  const line2 = el("p", "output", site.hostname);

  const line3 = el("p");
  line3.innerHTML = `<span class="prompt">${site.shellUser} ~ $</span> whoami`;

  const line4 = el("p", "output", profile.name);

  const line5 = el("p");
  line5.innerHTML = `<span class="prompt">${site.shellUser} ~ $</span> cat about.txt`;

  const line6 = el("p", "output", profile.role);

  const line7 = el("p");
  line7.innerHTML =
    `<span class="prompt">${site.shellUser} ~ $</span> ` +
    `cat experience.txt projects.txt` +
    `<span class="cursor" aria-hidden="true"></span>`;

  shell.append(line1, line2, line3, line4, line5, line6, line7);
}

function renderExperience(items) {
  const list = document.getElementById("exp-list");
  list.innerHTML = "";

  (items || []).forEach((job) => {
    const li = el("li", "exp-item");
    const logo = el("div", "exp-logo");
    logo.setAttribute("aria-hidden", "true");

    if (job.logoSrc) {
      const img = document.createElement("img");
      img.src = job.logoSrc;
      img.alt = job.company || "";
      logo.appendChild(img);
    } else {
      logo.textContent = job.logo || "?";
    }

    const body = el("div", "exp-body");
    body.appendChild(el("p", "exp-company", job.company));
    body.appendChild(el("p", "exp-meta", job.title));
    body.appendChild(el("p", "exp-dates", job.dates));
    if (job.description) {
      body.appendChild(el("p", "exp-desc", job.description));
    }
    body.appendChild(renderTags(job.tags, "muted"));

    li.append(logo, body);
    list.appendChild(li);
  });

  list.querySelectorAll(".exp-item").forEach((item, i) => {
    item.style.animationDelay = `${0.05 + i * 0.08}s`;
  });
}

function renderProject(project) {
  const card = el("article", "project-card");

  const body = el("div", "project-body");
  body.appendChild(el("h3", "project-title", `> ./${project.slug}`));
  body.appendChild(el("p", "project-desc", project.description));

  if (project.tags?.length) {
    body.appendChild(renderTags(project.tags, "amber"));
  }

  if (project.links?.length) {
    const actions = el("div", "project-actions");
    project.links.forEach((link) => {
      const line = el("p", "project-link");
      const prompt = el("span", "prompt", "$");
      const cmd = document.createTextNode(" open ");
      const a = el("a", null, link.label);
      a.href = link.url || "#";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      line.append(prompt, cmd, a);
      actions.appendChild(line);
    });
    body.appendChild(actions);
  }

  if (project.media) {
    const media = el("div", "project-media", project.media.label || "[ media ]");
    if (project.media.src) {
      const img = document.createElement("img");
      img.src = project.media.src;
      img.alt = project.media.label || project.slug || "project media";
      img.loading = "lazy";
      img.decoding = "async";
      media.textContent = "";
      media.appendChild(img);
    }
    card.append(body, media);
  } else {
    card.appendChild(body);
  }

  return card;
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  grid.innerHTML = "";
  (projects || []).forEach((p) => grid.appendChild(renderProject(p)));
  grid.querySelectorAll(".project-card").forEach((card, i) => {
    card.style.animationDelay = `${0.12 + i * 0.1}s`;
  });
}

function renderContact(site, contact) {
  const footer = document.getElementById("footer-shell");
  footer.innerHTML = "";
  if (!contact) return;

  const user = site?.shellUser || "ryan@ubc";

  const cmd = el("p");
  cmd.innerHTML = `<span class="prompt">${user} ~ $</span> cat contact.txt`;
  footer.appendChild(cmd);

  const line = el("p", "output footer-links");

  const mailItem = el("span", "footer-item");
  mailItem.append("email: ");
  const mail = el("a", null, contact.email);
  mail.href = `mailto:${contact.email}`;
  mailItem.appendChild(mail);
  line.appendChild(mailItem);

  if (contact.github) {
    const sep = el("span", "footer-sep", " | ");
    const gItem = el("span", "footer-item");
    gItem.append("github: ");
    const g = el("a", null, contact.github.label);
    g.href = contact.github.url || "#";
    g.target = "_blank";
    g.rel = "noopener noreferrer";
    gItem.appendChild(g);
    line.append(sep, gItem);
  }

  if (contact.linkedin) {
    const sep = el("span", "footer-sep", " | ");
    const lItem = el("span", "footer-item");
    lItem.append("linkedin: ");
    const l = el("a", null, contact.linkedin.label);
    l.href = contact.linkedin.url || "#";
    l.target = "_blank";
    l.rel = "noopener noreferrer";
    lItem.appendChild(l);
    line.append(sep, lItem);
  }

  footer.appendChild(line);
}

function render(data) {
  renderHeader(data);
  renderExperience(data.experience);
  renderProjects(data.projects);
  renderContact(data.site, data.contact);
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
