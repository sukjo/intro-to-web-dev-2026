let siteDataPromise;

/* -------------------------------------------------------------------------- */
/*                             google sheets data                             */
/* -------------------------------------------------------------------------- */
const CSVURLs = {
  schedule:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJOOLP80A5zIrLE0zfMmtcL8y3-ecBg8ycPxbo8R8gxI_oKteZ0cT_PEwlS6VY1x7uXmvn-q1Fz8w7/pub?gid=0&single=true&output=csv",
  readings:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJOOLP80A5zIrLE0zfMmtcL8y3-ecBg8ycPxbo8R8gxI_oKteZ0cT_PEwlS6VY1x7uXmvn-q1Fz8w7/pub?gid=2095943669&single=true&output=csv",
  assignments:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJOOLP80A5zIrLE0zfMmtcL8y3-ecBg8ycPxbo8R8gxI_oKteZ0cT_PEwlS6VY1x7uXmvn-q1Fz8w7/pub?gid=509634392&single=true&output=csv",
  projects:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJOOLP80A5zIrLE0zfMmtcL8y3-ecBg8ycPxbo8R8gxI_oKteZ0cT_PEwlS6VY1x7uXmvn-q1Fz8w7/pub?gid=405980673&single=true&output=csv",
  resources:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJOOLP80A5zIrLE0zfMmtcL8y3-ecBg8ycPxbo8R8gxI_oKteZ0cT_PEwlS6VY1x7uXmvn-q1Fz8w7/pub?gid=779378196&single=true&output=csv",
};

function fetchCSVasJSON(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

async function loadAllCSVs() {
  try {
    const entries = Object.entries(CSVURLs);
    const promises = entries.map(([key, url]) => {
      return fetchCSVasJSON(url).then((data) => [key, data]);
    });

    return Promise.all(promises).then((res) => {
      return Object.fromEntries(res);
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

siteDataPromise = loadAllCSVs();

function createPageSection(parent, id, title) {
  const container = document.createElement("div");
  container.id = id;

  const header = document.createElement("h3");
  header.textContent = title;

  container.appendChild(header);
  parent.appendChild(container);

  return container;
}

function createAssignmentsSection(row) {
  const dueDate =
    row["Due Date"] && row["Due Date"] !== "N/A"
      ? `<p class="dueDate">Due ${row["Due Date"]}</p>`
      : "";

  return `
    <h4>${row["Title"]}</h4>
    <p>${row["Description"]}</p>
    ${dueDate}
  `;
}

function createResourcesSection(res) {
  const li = `<li><a href="${res["URL"]}" target="_blank"
          class="ext">${res["Title"]}</a></li>`;

  return li;
}

function initSchedule(data) {
  const weeks = {};
  const sDiv = document.getElementById("schedule");

  data.schedule.forEach((row) => {
    // const week = Number(row["Week"]);
    // if (!Number.isInteger(week)) return;

    const week = row["Week"];
    if (week.length < 1) return;

    weeks[week] = {
      schedule: row,
      readings: [],
      assignments: [],
      container: null,
    };
  });

  data.readings.forEach((row) => {
    const week = Number(row["Week"]);
    if (!weeks[week]) return;

    weeks[week].readings.push(row);
  });

  data.assignments.forEach((row) => {
    const week = Number(row["Week"]);
    if (!weeks[week]) return;

    weeks[week].assignments.push(row);
  });

  Object.keys(weeks)
    .sort((a, b) => a - b)
    .forEach((week) => {
      const weekContainer = document.createElement("div");
      weekContainer.classList.add("eachWeek");

      sDiv.appendChild(weekContainer);

      weeks[week].container = weekContainer;
    });

  Object.values(weeks).forEach(({ container, schedule }) => {
    const sww1 = schedule["Scholarly Website of the Week (1)"];
    const sww2 = schedule["Scholarly Website of the Week (2)"];
    let swwHTML = "";

    if (sww1.length > 0 && sww2.length > 0) {
      swwHTML = `<p class="sww">Scholarly website presentations: ${sww1} and ${sww2}</p>`;
    } else if (sww1.length > 0 || sww2.length > 0) {
      swwHTML = `<p class="sww">Scholarly website presentation: ${
        sww1 || sww2
      }</p>`;
    } else {
      swwHTML = "";
    }

    let rowHTML = `
          <h3>Week ${schedule["Week"]}: ${schedule["Date"]}</h3>
          <p>${schedule["Topics"]}</p>
          ${swwHTML}
          ${
            schedule["Guest Lecture"]
              ? `<p>Guest lecture: ${schedule["Guest Lecture"]}</p>`
              : ""
          }
      `;

    container.insertAdjacentHTML("beforeend", rowHTML);
  });

  Object.values(weeks).forEach(({ container, readings }) => {
    if (readings.length === 0) return;

    const h4 = document.createElement("h4");
    h4.innerHTML = "Readings";
    h4.classList.add("readings-h4");
    container.appendChild(h4);
    const ul = document.createElement("ul");
    ul.classList.add("readings-list");

    readings.forEach((row) => {
      const li = `<li>${row["Author"] ? row["Author"] : ""} ${
        row["URL"]
          ? `<a
          href="${row["URL"]}"
          target="_blank"
          class="ext"
          >${row["Title"]}</a
        >`
          : `<p>${row["Title"]}</p>`
      } ${row["Section"] ? row["Section"] : ""}</li>`;
      ul.insertAdjacentHTML("beforeend", li);
    });

    container.appendChild(ul);
  });

  Object.values(weeks).forEach(({ container, assignments }) => {
    if (assignments.length === 0) return;

    const h4 = document.createElement("h4");
    h4.innerHTML = "Assignments";
    h4.classList.add("assignments-h4");
    container.appendChild(h4);
    const ul = document.createElement("ul");
    ul.classList.add("assignments-list");

    assignments.forEach((row) => {
      const li = document.createElement("li");
      li.innerHTML = row["Assignment"];
      ul.appendChild(li);
    });

    container.appendChild(ul);
  });
}

function initAssignments(data) {
  const aDiv = document.getElementById("assignments");

  const projectsCont = createPageSection(aDiv, "projectsCont", "Projects");
  const assignmentsCont = createPageSection(
    aDiv,
    "assignmentsCont",
    "Assignments",
  );

  const projectsHTML = data
    .filter((row) => row["Type"] === "project")
    .map((row) => createAssignmentsSection(row))
    .join("");

  const assignmentsHTML = data
    .filter((row) => row["Type"] === "assignment")
    .map((row) => createAssignmentsSection(row))
    .join("");

  projectsCont.insertAdjacentHTML("beforeend", projectsHTML);
  assignmentsCont.insertAdjacentHTML("beforeend", assignmentsHTML);
}

function initResources(data) {
  const rDiv = document.getElementById("resources");
  let uniqueTypes = [];
  let sortedResources = [];

  data.forEach((row) => {
    if (!uniqueTypes.includes(row["Type"])) uniqueTypes.push(row["Type"]);
  });

  uniqueTypes.forEach((type) => {
    sortedResources[type] = [];
  });

  data.forEach((row) => {
    const type = row["Type"];
    sortedResources[type].push(row);
  });

  uniqueTypes.forEach((type) => {
    const typeCont = createPageSection(rDiv, `${type}`, `${type}`);
    const htmlContent = `
      <ul>
      ${sortedResources[type]
        .map((resource) => {
          return createResourcesSection(resource);
        })
        .join("")}
      </ul>
    `;
    // console.log(htmlContent);
    typeCont.insertAdjacentHTML("beforeend", htmlContent);
  });

  // console.log(sortedResources);
  // console.log(uniqueTypes);
}

/* -------------------------------------------------------------------------- */
/*                                   routing                                  */
/* -------------------------------------------------------------------------- */

const base_path = "/intro-to-web-dev-2026";
const section = document.querySelector("section");

const routes = {
  404: {
    template: `${base_path}/pages/404.html`,
    title: "404",
    description: "Page not found",
  },
  "/": {
    template: `${base_path}/pages/home.html`,
    title: "Intro to Web Development",
    description: "Home page",
  },
  "/assignments": {
    template: `${base_path}/pages/assignments.html`,
    title: "Assignments",
    description: "Assignments and projects page",
  },
  "/schedule": {
    template: `${base_path}/pages/schedule.html`,
    title: "Schedule",
    description: "Schedule page",
  },
  "/students": {
    template: `${base_path}/pages/students.html`,
    title: "Students",
    description: "Students page",
  },
  "/resources": {
    template: `${base_path}/pages/resources.html`,
    title: "Resources",
    description: "Resources page",
  },
};

const locationHandler = async () => {
  let location = window.location.hash.slice(1) || "/"; // hash routing

  location = location.startsWith("/") ? location : `/${location}`;

  const route = routes[location] || routes["404"];

  // get the html from the template
  const html = await fetch(route.template).then((response) => response.text());
  section.innerHTML = html;
  document.title = route.title;
  // document
  //   .querySelector('meta[name="description"]')
  //   .setAttribute("content", route.description);

  if (location === "/schedule") {
    const data = await siteDataPromise;
    initSchedule(data);
  } else if (location === "/assignments") {
    const data = await siteDataPromise;
    initAssignments(data.projects);
  } else if (location === "/resources") {
    const data = await siteDataPromise;
    initResources(data.resources);
  }
};

const route = (event) => {
  event.preventDefault();
  window.location.hash = event.target.getAttribute("href"); // hash routing
};

document.addEventListener("click", (e) => {
  const { target } = e;
  if (!target.matches("nav a:not(.ext)")) return;
  e.preventDefault();
  route(e); // hash routing
});

window.addEventListener("hashchange", locationHandler); // hash routing

window.route = route;

locationHandler();

/* -------------------------------------------------------------------------- */
/*                                DOM inspector                               */
/* -------------------------------------------------------------------------- */

// const inspector = new DomInspector({
//   root: "body",
//   exclude: [],
//   maxZIndex: "100",
//   theme: "DI",
// });

// // inspector.enable();

// const DI_toggle = document.getElementById("DI-toggle-box");

// DI_toggle.addEventListener("change", (e) => {
//   if (e.currentTarget.checked) {
//     inspector.enable();
//   } else {
//     inspector.disable();
//   }
// });

// // inspector.overlay.parent.style.transition = "display ease-in 1s";
