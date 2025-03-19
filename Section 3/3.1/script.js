
class SimpleAPIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.cache = {};  
        this.retryLimit = 3;  // Number of retries for failed requests
        this.throttleTime = 1000;  // Delay between requests (in milliseconds)
        this.queue = []; 
        this.isProcessing = false;
    }

    // Function to fetch data from API with caching and retries
    async fetchData(endpoint, retryCount = 0) {
        const url = `${this.baseURL}${endpoint}`;

        // Check if data is in cache
        if (this.cache[url]) {
            console.log("Using cached data:", this.cache[url]);
            return this.cache[url];
        }

        // Throttle requests (wait before making another request)
        await this.throttle();

        try {
            // Fetch data with a timeout
            const response = await this.fetchWithTimeout(url, 5000);
            
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            
            // Save response in cache
            this.cache[url] = data;
            return data;

        } catch (error) {
            if (retryCount < this.retryLimit) {
                console.warn(`Retrying request (${retryCount + 1})...`);
                return this.fetchData(endpoint, retryCount + 1);
            }
            throw new Error("Failed to fetch data after multiple attempts.");
        }
    }

    // Function to handle request timeout
    async fetchWithTimeout(url, timeout = 5000) {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), timeout))
        ]);
    }

    // Throttling: ensures a short delay between API requests
    async throttle() {
        return new Promise(resolve => setTimeout(resolve, this.throttleTime));
    }

    // Function to add requests to a queue and process them sequentially
    async enqueueRequest(endpoint) {
        return new Promise(resolve => {
            this.queue.push({ endpoint, resolve });

            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        this.isProcessing = true;

        const { endpoint, resolve } = this.queue.shift();

        try {
            const data = await this.fetchData(endpoint);
            resolve(data);
        } catch (error) {
            resolve(null);
        }

        setTimeout(() => this.processQueue(), this.throttleTime);
    }
}

// Initialize API client with a public API
const apiClient = new SimpleAPIClient("https://jsonplaceholder.typicode.com");

// Function to fetch a user by email
async function fetchUser() {
    const emailInput = document.getElementById("emailInput").value.trim();
    const resultDiv = document.getElementById("result");

    // Validate input
    if (!emailInput) {
        resultDiv.innerHTML = "Please enter an email.";
        return;
    }

    try {
        resultDiv.innerHTML = "Fetching user...";
        const users = await apiClient.enqueueRequest("/users");

        // Find user by email
        const user = users.find(user => user.email.toLowerCase() === emailInput.toLowerCase());

        // Display user details
        if (user) {
            resultDiv.innerHTML = `
                <strong>Name:</strong> ${user.name} <br>
                <strong>Email:</strong> ${user.email} <br>
                <strong>Phone:</strong> ${user.phone} <br>
            `;
        } else {
            resultDiv.innerHTML = "User not found.";
        }
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}