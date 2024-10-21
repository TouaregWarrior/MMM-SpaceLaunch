//MMM-SpaceLaunch.js:

/* Magic Mirror
 * Module: MMM-SpaceLaunch
 *
 * By TouaregWarrior
 * MIT Licensed.
 */

Module.register("MMM-SpaceLaunch", {
    defaults: {
        updateInterval: 3600000,  // Update every 1 hour
        apiUrl: "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?format=json", 
        showMission: true,         // Show mission name
        showLaunchDate: true,      // Show launch date
        showRocket: true,          // Show rocket name
        showLaunchSite: true,      // Show launch site
        showLocation: true,        // Show location
        showPayload: true,         // Show payload
        showOrbit: true,           // Show orbit details
        showDetails: true          // Show additional details
    },

    start: function() {
        this.launchData = null;  // Placeholder for launch data
        this.loadData();
        setInterval(() => {
            this.loadData();
        }, this.config.updateInterval);  // Set interval for data refresh
    },

    getDom: function() {
        let wrapper = document.createElement("div");
        wrapper.className = "spacex-wrapper";  // Apply a wrapper class for styling

        if (this.launchData) {
            let content = `
                <div>
                    <div class="module-header">Next Space Launch</div>
                    <hr class="underline">
            `;

            // Show mission
            if (this.config.showMission) {
                content += `<p>Mission: <span class="highlight">${this.launchData.mission_name}</span></p>`;
            }

            // Show launch date
            if (this.config.showLaunchDate) {
                content += `<p>Launch Date: <span class="highlight">${this.formatDate(this.launchData.net)}</span></p>`;
            }

            // Show rocket name
            if (this.config.showRocket) {
                content += `<p>Rocket: <span class="highlight">${this.launchData.rocket.configuration.name}</span></p>`;
            }

            // Show launch site
            if (this.config.showLaunchSite) {
                content += `<p>Launch Site: <span class="highlight">${this.launchData.pad.name}</span></p>`;
            }

            // Show location details (city, country)
            if (this.config.showLocation && this.launchData.pad.location && typeof this.launchData.pad.location.name === 'string') {
                content += `<p>Location: <span class="highlight">${this.launchData.pad.location.name}</span>`;
                if (typeof this.launchData.pad.location.country === 'string') {
                    content += `, ${this.launchData.pad.location.country}`;
                }
                content += `</p>`;
            }

            // Show payload
            if (this.config.showPayload) {
                content += `<p>Payload: <span class="highlight">${this.launchData.mission.description || 'Details TBD.'}</span></p>`;
            }

            // Show orbit details
            if (this.config.showOrbit) {
                content += `<p>Orbit: <span class="highlight">${this.launchData.mission.orbit.name || 'Unknown'}</span></p>`;
            }

            // Show additional details
            if (this.config.showDetails) {
                content += `<p>Details: <span class="highlight">${this.launchData.mission.description || 'Details TBD.'}</span></p>`;
            }

            content += `</div>`;
            wrapper.innerHTML = content;

        } else {
            wrapper.innerHTML = "Loading next space launch details...";
        }

        return wrapper;
    },

    loadData: function() {
        let self = this;

        fetch(this.config.apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.results && data.results.length > 0) {
                    let nextLaunch = data.results[0];  // Fetch the first (next) upcoming launch
                    
                    self.launchData = {
                        mission_name: nextLaunch.name,
                        net: nextLaunch.net,  // Launch date and time
                        mission: nextLaunch.mission || { description: "N/A", orbit: { name: "N/A" } },
                        rocket: nextLaunch.rocket,
                        pad: nextLaunch.pad  // Launch pad details
                    };
                    self.updateDom();  // Update the UI with the fetched data
                } else {
                    console.error("No upcoming launches found in API response");
                }
            })
            .catch(error => {
                console.error("Error fetching data from SpaceDevs API:", error);
                self.launchData = null;
                self.updateDom();
            });
    },

    formatDate: function(dateString) {
        let date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    },

    getStyles: function() {
        return ["MMM-SpaceLaunch.css"];  // Reference the CSS file for styling
    }
});
