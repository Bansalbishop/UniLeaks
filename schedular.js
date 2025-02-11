document.addEventListener("DOMContentLoaded", function () {
    let scheduleContainer = document.getElementById("schedule");

    // Load events from localStorage
    let events = JSON.parse(localStorage.getItem("scheduledEvents")) || [];

    // Remove past events
    events = events.filter(event => new Date(`${event.date} ${event.time}`) >= new Date());

    // Save the updated list back to localStorage
    localStorage.setItem("scheduledEvents", JSON.stringify(events));

    renderSchedule();

    // Listen for storage changes (to sync across multiple open tabs/pages)
    window.addEventListener("storage", function (event) {
        if (event.key === "scheduledEvents") {
            events = JSON.parse(localStorage.getItem("scheduledEvents")) || [];
            renderSchedule();
        }
    });

    // Function to mark/unmark events
    window.markevent = function (button) {
        let eventPost = button.closest(".eventpost");
        let title = eventPost.querySelector("h2").innerText;
        let date = eventPost.querySelector(".postschedule div:nth-child(1)").innerText;
        let time = eventPost.querySelector(".postschedule div:nth-child(2)").innerText;
        let imgSrc = eventPost.querySelector("img").src;

        let eventKey = `${title}-${date}-${time}`;

        // Check if event exists
        let eventIndex = events.findIndex(e => e.key === eventKey);

        if (eventIndex === -1) {
            // Add event
            events.push({ key: eventKey, title, date, time, imgSrc });
            button.innerText = "UNMARK";
        } else {
            // Remove event
            events.splice(eventIndex, 1);
            button.innerText = "MARK";
        }

        // Remove past events before saving
        events = events.filter(event => new Date(`${event.date} ${event.time}`) >= new Date());

        // Save to localStorage
        localStorage.setItem("scheduledEvents", JSON.stringify(events));

        // Update UI
        renderSchedule();

        // Broadcast changes to other open pages
        window.dispatchEvent(new Event("storage"));
    };

    // Function to render scheduler
    function renderSchedule() {
        scheduleContainer.innerHTML = ""; // Clear existing
    
        let currentDate = new Date(); // Get current date and time
    
        events.forEach(event => {
            let eventDateTime = new Date(`${event.date} ${event.time}`);
    
            let eventDiv = document.createElement("div");
            eventDiv.classList.add("scheduled-event");
    
            // Check if event is outdated
            let isOutdated = eventDateTime < currentDate;
            if (isOutdated) {
                eventDiv.classList.add("outdated-event"); // Add class for styling
            }
    
            eventDiv.innerHTML = `
                <img src="${event.imgSrc}" width="50px" style="margin-right:10px;">
                <strong>${event.title}</strong> - ${event.date} at ${event.time}
            `;
    
            scheduleContainer.appendChild(eventDiv);
        });
    
        // Update button states for all events
        document.querySelectorAll(".post-mark-button").forEach(button => {
            let eventPost = button.closest(".eventpost");
            let title = eventPost.querySelector("h2").innerText;
            let date = eventPost.querySelector(".postschedule div:nth-child(1)").innerText;
            let time = eventPost.querySelector(".postschedule div:nth-child(2)").innerText;
            let eventKey = `${title}-${date}-${time}`;
    
            let eventDateTime = new Date(`${date} ${time}`);
            let isOutdated = eventDateTime < currentDate;
    
            if (isOutdated) {
                button.innerText = "EXPIRED"; // Change button text
                button.disabled = true; // Make button unclickable
                button.classList.add("expired-button"); // Add expired styling
            } else {
                button.innerText = events.some(e => e.key === eventKey) ? "UNMARK" : "MARK";
                button.disabled = false; // Ensure button is clickable for future events
                button.classList.remove("expired-button");
            }
        });
    }
    
    }
    
);

function saveEvent(eventData) {
    let savedEvents = JSON.parse(localStorage.getItem("markedEvents")) || []; 
    savedEvents.push(eventData); 
    localStorage.setItem("markedEvents", JSON.stringify(savedEvents)); 
    console.log("Saved Events:", localStorage.getItem("markedEvents")); // Debugging
}

function loadEvents() {
    let savedEvents = JSON.parse(localStorage.getItem("markedEvents")) || [];
    let currentDate = new Date();

    // Remove past events
    savedEvents = savedEvents.filter(event => new Date(`${event.date} ${event.time}`) >= currentDate);

    // Save updated list
    localStorage.setItem("markedEvents", JSON.stringify(savedEvents));

    let eventContainer = document.getElementById("events");
    eventContainer.innerHTML = "";

    savedEvents.forEach(event => {
        let eventElement = document.createElement("div");
        eventElement.innerHTML = `<strong>${event.title}</strong> - ${event.date} at ${event.time}`;
        eventContainer.appendChild(eventElement);
    });
}

// Run when page loads
document.addEventListener("DOMContentLoaded", loadEvents);

// Auto-remove expired events every minute
setInterval(loadEvents, 60000);
