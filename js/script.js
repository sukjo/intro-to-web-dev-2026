const section = document.querySelector("section");

const routes = {
  404: {
    template: "/pages/404.html",
    title: "404",
    // description: "Page not found",
  },
  "/": {
    template: "/pages/home.html",
    title: "Intro to Web Development",
    // description: "Home page",
  },
  "/assignments": {
    template: "/pages/assignments.html",
    title: "Assignments",
    description: "Assignments page",
  },
  "/schedule": {
    template: "/pages/schedule.html",
    title: "Schedule",
    // description: "Schedule page",
  },
};

const locationHandler = async () => {
  //   let location = window.location.pathname; // get the url path
  //   // if the path length is 0, set it to primary page route
  //   if (location.length == 0) {
  //     location = "/";
  //   } // all the above for URL routing

  let location = window.location.hash.slice(1) || "/"; // hash routing

  // get the route object from the urlRoutes object
  const route = routes[location] || routes["404"];
  // get the html from the template
  const html = await fetch(route.template).then((response) => response.text());
  // set the content of the content div to the html
  section.innerHTML = html;
  // set the title of the document to the title of the route
  document.title = route.title;
  //   set the description of the document to the description of the route
  //   document
  //     .querySelector('meta[name="description"]')
  //     .setAttribute("content", route.description);

  if (location === "/schedule") {
    loadScheduleData();
  }
};

const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  //   window.history.pushState({}, "", event.target.href); // URL routing
  window.location.hash = event.target.getAttribute("href"); // hash routing
  //   locationHandler(); // URL routing
};

document.addEventListener("click", (e) => {
  const { target } = e;
  if (!target.matches("nav a")) {
    // may have to update this if you want any other links outside of nav to be responsive on the page
    return;
  }
  e.preventDefault();
  route(); // URL routing
  route(e); // hash routing
});

// add an event listener to the window that watches for url changes
// window.onpopstate = locationHandler; // URL routing
window.addEventListener("hashchange", locationHandler); // hash routing

// call the urlLocationHandler function to handle the initial url
window.route = route;
// call the urlLocationHandler function to handle the initial url
locationHandler();

function loadScheduleData() {
  const sDiv = document.getElementById("schedule");

  console.log("loadScheduleData running...");

  fetch(
    "https://script.google.com/macros/s/AKfycbxambbhgGeru8BaH9LNidUBCmhvayXDje8Pd0fxvgV5eBJ4aPPmXiZh1M6NCutp6H25Aw/exec"
  )
    .then((res) => res.json())
    .then((data) => {
      data.forEach((row) => {
        if (!isNaN(row["week"])) {
          const oneWeek = document.createElement("div");
          oneWeek.class = "oneWeek";
          sDiv.appendChild(oneWeek);

          const week = document.createElement("h3");
          week.class = "week";
          week.innerHTML = `Week ${row["week"]}`;
          oneWeek.appendChild(week);

          const topics = document.createElement("h4");
          topics.class = "topics";
          topics.innerHTML = row["topics"];
          oneWeek.appendChild(topics);

          if (row["sww_1"].length == 0 && row["sww_2"].length == 0) {
            return;
          } else if (row["sww_1"].length == 0 || row["sww_2"].length == 0) {
            const sww = document.createElement("p");
            sww.class = "sww";

            if (row["sww_1"].length > row["sww_2"].length) {
              sww.innerHTML = `Scholarly website of the week: ${row["sww_1"]}`;
              oneWeek.appendChild(sww);
            } else {
              sww.innerHTML = `Scholarly website of the week: ${row["sww_2"]}`;
              oneWeek.appendChild(sww);
            }
          } else {
            const sww = document.createElement("p");
            sww.class = "sww";
            sww.innerHTML = `Scholarly website of the week: ${row["sww_1"]} and ${row["sww_2"]}`;
            oneWeek.appendChild(sww);
          }

          if (row["guest"].length > 0) {
            const guest = document.createElement("p");
            guest.class = "guest";
            guest.innerHTML = `Guest lecturer: ${row["guest"]}`;
            oneWeek.appendChild(guest);
          }

          if (row["tutorial"].length > 0) {
            const tutorial = document.createElement("p");
            tutorial.class = "tutorial";
            tutorial.innerHTML = `Technical tutorial: ${row["tutorial"]}`;
            oneWeek.appendChild(tutorial);
          }

          if (row["readings"].length > 0) {
            const readings = document.createElement("p");
            readings.class = "readings";
            readings.innerHTML = `Readings for the following week: ${row["readings"]}`;
            oneWeek.appendChild(readings);
          }

          if (row["assignments"].length > 0) {
            const assignments = document.createElement("p");
            assignments.class = "assignments";
            assignments.innerHTML = `Assignments: ${row["assignments"]}`;
            oneWeek.appendChild(assignments);
          }
        }
      });
    })

    // console.log(data);

    .catch((err) => console.error(err));
}
