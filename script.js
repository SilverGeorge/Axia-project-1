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
  const mobileMenuButton = document.getElementById("mobileMenuButton");
  const mobileMenu = document.getElementById("mobileMenu");

  // State
  let users = [];
  let darkMode = localStorage.getItem("darkMode") === "enabled";

  // Initialize dark mode
  if (darkMode) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }

  // Fetch users
  fetchUsers();

  // Event Listeners
  retryButton.addEventListener("click", () => {
    searchInput.value = "";
    cityFilter.value = "All Cities";
    companyFilter.value = "All Companies";
    fetchUsers();
  });

  searchInput.addEventListener("input", filterUsers);
  cityFilter.addEventListener("change", filterUsers);
  companyFilter.addEventListener("change", filterUsers);
  darkModeToggle.addEventListener("click", toggleDarkMode);
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  // Fetch users from API
  async function fetchUsers() {
    try {
      showLoading();
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      if (!response.ok) throw new Error("Failed to fetch users");

      users = await response.json();
      hideError();
      renderUsers(users);
      populateFilters(users);
    } catch (err) {
      console.error(err);
      showError();
    } finally {
      hideLoading();
    }
  }

  // Render user cards
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
        "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition";

      userCard.innerHTML = `
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="bg-purple-100 text-purple-800 rounded-full w-12 h-12 flex items-center justify-center font-bold">
                ${user.name.charAt(0)}
              </div>
              <div class="ml-4">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-white">${
                  user.name
                }</h2>
                <p class="text-gray-600 dark:text-gray-300">@${
                  user.username
                }</p>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-gray-700 dark:text-gray-300"><i class="fas fa-envelope mr-2 text-purple-500"></i> ${
                user.email
              }</p>
              <p class="text-gray-700 dark:text-gray-300"><i class="fas fa-building mr-2 text-purple-500"></i> ${
                user.company.name
              }</p>
              <p class="text-gray-700 dark:text-gray-300"><i class="fas fa-map-marker-alt mr-2 text-purple-500"></i> ${
                user.address.city
              }</p>
            </div>
          </div>
        `;

      // Extra details container
      const extraInfo = document.createElement("div");
      extraInfo.id = `extra-${user.id}`;
      extraInfo.className =
        "hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 p-6";
      extraInfo.innerHTML = `
          <p class="text-gray-700 dark:text-gray-300"><i class="fas fa-phone mr-2 text-gray-500"></i> ${user.phone}</p>
          <p class="text-gray-700 dark:text-gray-300"><i class="fas fa-globe mr-2 text-gray-500"></i> ${user.website}</p>
          <p class="text-gray-700 dark:text-gray-300"><i class="fas fa-home mr-2 text-gray-500"></i> ${user.address.street}, ${user.address.suite}</p>
        `;

      // Details toggle button
      const detailsBtn = document.createElement("button");
      detailsBtn.className =
        "mt-4 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition m-6";
      detailsBtn.innerHTML = `<span>View More</span> <i class="fas fa-chevron-down ml-1"></i>`;

      detailsBtn.addEventListener("click", () => {
        const isHidden = extraInfo.classList.contains("hidden");
        extraInfo.classList.toggle("hidden");

        const span = detailsBtn.querySelector("span");
        const icon = detailsBtn.querySelector("i");
        if (isHidden) {
          span.textContent = "View Less";
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        } else {
          span.textContent = "View More";
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      });

      userCard.appendChild(extraInfo);
      userCard.appendChild(detailsBtn);
      userGrid.appendChild(userCard);
    });
  }

  // Populate city and company filters dynamically
  function populateFilters(users) {
    cityFilter.innerHTML = '<option value="All Cities">All Cities</option>';
    companyFilter.innerHTML =
      '<option value="All Companies">All Companies</option>';

    const cities = [...new Set(users.map((u) => u.address.city))].sort();
    const companies = [...new Set(users.map((u) => u.company.name))].sort();

    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });

    companies.forEach((company) => {
      const option = document.createElement("option");
      option.value = company;
      option.textContent = company;
      companyFilter.appendChild(option);
    });
  }

  // Filter users based on search and filters
  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCity = cityFilter.value;
    const selectedCompany = companyFilter.value;

    const filtered = users.filter((user) => {
      const searchMatch = (user.name + user.username)
        .toLowerCase()
        .includes(searchTerm);
      const cityMatch =
        selectedCity === "All Cities" || user.address.city === selectedCity;
      const companyMatch =
        selectedCompany === "All Companies" ||
        user.company.name === selectedCompany;
      return searchMatch && cityMatch && companyMatch;
    });

    renderUsers(filtered);
  }

  // Dark mode functions
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
    darkModeToggle.querySelector(".fa-moon").classList.add("hidden");
    darkModeToggle.querySelector(".fa-sun").classList.remove("hidden");
    darkModeToggle.querySelector(".dark-mode-text").textContent = "Light Mode";
  }

  function disableDarkMode() {
    document.documentElement.classList.remove("dark");
    darkModeToggle.querySelector(".fa-moon").classList.remove("hidden");
    darkModeToggle.querySelector(".fa-sun").classList.add("hidden");
    darkModeToggle.querySelector(".dark-mode-text").textContent = "Dark Mode";
  }

  // Loading & error handling
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
    loading.classList.add("hidden");
  }

  function hideError() {
    error.classList.add("hidden");
  }
});
