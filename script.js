document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const userGrid = document.getElementById("userGrid");
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const retryButton = document.getElementById("retryButton");
  const searchInput = document.getElementById("searchInput");
  const cityFilter = document.getElementById("cityFilter");
  const companyFilter = document.getElementById("companyFilter");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // State
  let users = [];
  let darkMode = localStorage.getItem("darkMode") === "enabled";

  // Initialize - light mode is default
  if (darkMode) {
    enableDarkMode();
  } else {
    disableDarkMode(); // Ensure light mode is properly set
  }
  fetchUsers();

  // Event Listeners
  retryButton.addEventListener("click", fetchUsers);
  searchInput.addEventListener("input", filterUsers);
  cityFilter.addEventListener("change", filterUsers);
  companyFilter.addEventListener("change", filterUsers);
  darkModeToggle.addEventListener("click", toggleDarkMode);

  // Functions
  async function fetchUsers() {
    try {
      showLoading();
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      users = await response.json();
      hideError();
      renderUsers(users);
      populateFilters(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      showError();
    } finally {
      hideLoading();
    }
  }

  function renderUsers(usersToRender) {
    userGrid.innerHTML = "";

    if (usersToRender.length === 0) {
      userGrid.innerHTML =
        '<p class="col-span-full text-center text-gray-500 py-8">No users found matching your criteria.</p>';
      return;
    }

    usersToRender.forEach((user) => {
      const userCard = document.createElement("div");
      userCard.className =
        "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition";
      userCard.innerHTML = `
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <div class="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center font-bold">
                            ${user.name.charAt(0)}
                        </div>
                        <div class="ml-4">
                            <h2 class="text-xl font-semibold text-gray-800">${
                              user.name
                            }</h2>
                            <p class="text-gray-600">@${user.username}</p>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <p class="text-gray-700"><i class="fas fa-envelope mr-2 text-gray-500"></i> ${
                          user.email
                        }</p>
                        <p class="text-gray-700"><i class="fas fa-building mr-2 text-gray-500"></i> ${
                          user.company.name
                        }</p>
                        <p class="text-gray-700"><i class="fas fa-map-marker-alt mr-2 text-gray-500"></i> ${
                          user.address.city
                        }</p>
                    </div>
                    <div id="extra-${
                      user.id
                    }" class="hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <p class="text-gray-700"><i class="fas fa-phone mr-2 text-gray-500"></i> ${
                          user.phone
                        }</p>
                        <p class="text-gray-700"><i class="fas fa-globe mr-2 text-gray-500"></i> ${
                          user.website
                        }</p>
                        <p class="text-gray-700"><i class="fas fa-home mr-2 text-gray-500"></i> ${
                          user.address.street
                        }, ${user.address.suite}</p>
                    </div>
                    <button onclick="toggleDetails(${user.id})"
                        class="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                        <span id="btn-text-${
                          user.id
                        }">View More</span> <i id="btn-icon-${
        user.id
      }" class="fas fa-chevron-down ml-1"></i>
                    </button>
                </div>
            `;
      userGrid.appendChild(userCard);
    });
  }

  function populateFilters(users) {
    // Clear existing options first
    cityFilter.innerHTML = '<option value="All Cities">All Cities</option>';
    companyFilter.innerHTML =
      '<option value="All Companies">All Companies</option>';

    // Get unique cities and companies
    const cities = [...new Set(users.map((user) => user.address.city))];
    const companies = [...new Set(users.map((user) => user.company.name))];

    // Populate city filter
    cities.sort().forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });

    // Populate company filter
    companies.sort().forEach((company) => {
      const option = document.createElement("option");
      option.value = company;
      option.textContent = company;
      companyFilter.appendChild(option);
    });
  }

  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCity = cityFilter.value;
    const selectedCompany = companyFilter.value;

    const filteredUsers = users.filter((user) => {
      // Check search term against name AND username
      const nameMatch = user.name.toLowerCase().includes(searchTerm);
      const usernameMatch = user.username.toLowerCase().includes(searchTerm);

      // Check filters
      const cityMatch =
        selectedCity === "All Cities"
          ? true
          : user.address.city === selectedCity;
      const companyMatch =
        selectedCompany === "All Companies"
          ? true
          : user.company.name === selectedCompany;

      return (nameMatch || usernameMatch) && cityMatch && companyMatch;
    });

    renderUsers(filteredUsers);
  }

  function toggleDarkMode() {
    darkMode = !darkMode;

    if (darkMode) {
      enableDarkMode();
      localStorage.setItem("darkMode", "enabled");
    } else {
      disableDarkMode();
      localStorage.setItem("darkMode", "disabled");
    }
  }

  function enableDarkMode() {
    document.documentElement.classList.add("dark");
    darkModeToggle.classList.remove(
      "bg-gray-200",
      "text-gray-800",
      "hover:bg-gray-300"
    );
    darkModeToggle.classList.add(
      "bg-gray-700",
      "text-white",
      "hover:bg-gray-600"
    );
    darkModeToggle.querySelector(".fa-moon").classList.add("hidden");
    darkModeToggle.querySelector(".fa-sun").classList.remove("hidden");
    darkModeToggle.querySelector(".dark-mode-text").textContent = "Light Mode";

    // Update all user cards to dark mode classes
    const userCards = document.querySelectorAll("#userGrid > div");
    userCards.forEach((card) => {
      card.className =
        "bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition";
      // Update other elements as needed
    });
  }

  function disableDarkMode() {
    document.documentElement.classList.remove("dark");
    darkModeToggle.classList.add(
      "bg-gray-200",
      "text-gray-800",
      "hover:bg-gray-300"
    );
    darkModeToggle.classList.remove(
      "bg-gray-700",
      "text-white",
      "hover:bg-gray-600"
    );
    darkModeToggle.querySelector(".fa-moon").classList.remove("hidden");
    darkModeToggle.querySelector(".fa-sun").classList.add("hidden");
    darkModeToggle.querySelector(".dark-mode-text").textContent = "Dark Mode";

    // Update all user cards to light mode classes
    const userCards = document.querySelectorAll("#userGrid > div");
    userCards.forEach((card) => {
      card.className =
        "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition";
      // Update other elements as needed
    });
  }

  function showLoading() {
    loading.classList.remove("hidden");
    userGrid.classList.add("hidden");
    error.classList.add("hidden");
  }

  function hideLoading() {
    loading.classList.add("hidden");
    userGrid.classList.remove("hidden");
  }

  function showError() {
    error.classList.remove("hidden");
    userGrid.classList.add("hidden");
  }

  function hideError() {
    error.classList.add("hidden");
  }
});

// Global function for toggling details
function toggleDetails(userId) {
  const extraInfo = document.getElementById(`extra-${userId}`);
  const btnText = document.getElementById(`btn-text-${userId}`);
  const btnIcon = document.getElementById(`btn-icon-${userId}`);

  if (extraInfo.classList.contains("hidden")) {
    extraInfo.classList.remove("hidden");
    btnText.textContent = "View Less";
    btnIcon.classList.remove("fa-chevron-down");
    btnIcon.classList.add("fa-chevron-up");
  } else {
    extraInfo.classList.add("hidden");
    btnText.textContent = "View More";
    btnIcon.classList.remove("fa-chevron-up");
    btnIcon.classList.add("fa-chevron-down");
  }
}
