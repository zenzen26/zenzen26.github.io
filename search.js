// Global variable to store data
let storeData = [];

Papa.parse("stores.csv", {
  download: true,
  header: true,
  complete: function (results) {
    if (!results.data || results.data.length === 0) {
      console.error("CSV data is empty or undefined!");
      return;
    }
    storeData = results.data; 
    console.log("CSV Data Loaded:", storeData);

    // Extract categories
    categories = [...new Set(storeData.map(item => item.Category))];
    console.log("Categories:", categories);

    // Now, update the category list after CSV load
    updateCategoryList();
  },
});

function updateCategoryList() {
  if (categories.length === 0) return;

  const categoryListContainer = document.getElementById("category-list");
  categoryListContainer.innerHTML = ""; 

  categories.forEach((category) => {
    const tabItem = document.createElement("div");
    tabItem.textContent = category;
    tabItem.classList.add("tab-item");

    tabItem.addEventListener("click", () => {
      // Remove active class from all
      document.querySelectorAll(".tab-item").forEach(tab => tab.classList.remove("active-tab"));
      tabItem.classList.add("active-tab");

      // 🚀 Filter store list by selected category
      const filteredStores = storeData.filter(store => store.Category === category);
      updateStoreList("", filteredStores);  // 🔥 Pass filtered stores
    });

    categoryListContainer.appendChild(tabItem);
  });

  categoryListContainer.style.display = "none";
}


function updateStoreList(query = "", customData = null) {
  if (storeData.length === 0) return; 

  const storeListContainer = document.getElementById("store-list");
  storeListContainer.innerHTML = "";

  // Use filtered data if provided, otherwise use the full store list
  const dataToFilter = customData || storeData;

  // Apply search filter (only show items that **start with** query)
  const filtered = dataToFilter.filter(
    (item) => item.Store && item.Store.toLowerCase().startsWith(query.toLowerCase())
  );

  if (filtered.length === 0) {
    storeListContainer.innerHTML = "<p>No stores found.</p>";
  } else {
    filtered.forEach((item) => {
      const tabItem = document.createElement("div");
      tabItem.textContent = item.Store;
      tabItem.classList.add("tab-item");

      tabItem.addEventListener("click", () => {
        document.querySelectorAll(".tab-item").forEach(tab => tab.classList.remove("active-tab"));
        tabItem.classList.add("active-tab");

        console.log(`Store clicked: ${item.Store}`);
      });

      storeListContainer.appendChild(tabItem);
    });
  }

  storeListContainer.style.display = "block";
}

// Virtual Keyboard Object
const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: [],
  },

  properties: {
    value: "",
    capsLock: false
  },

  init() {
    // Create keyboard container
    this.elements.main = document.createElement("div");
    this.elements.main.classList.add("keyboard", "keyboard--hidden");

    // Append to keyboard-placeholder
    document.getElementById("keyboard-placeholder").appendChild(this.elements.main);

    // Create keys container
    this.elements.keysContainer = document.createElement("div");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.main.appendChild(this.elements.keysContainer);

    // Create the keys and append to container
    this.elements.keysContainer.appendChild(this._createKeys());
    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");
  },

  _createKeyBtn(label, extraClass, onClick) {
    const keyElement = document.createElement("button");
    keyElement.setAttribute("type", "button");
    keyElement.classList.add("keyboard__key");

    if (extraClass) keyElement.classList.add(extraClass);
    keyElement.textContent = label;

    keyElement.addEventListener("click", onClick);
    return keyElement;
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();
    const rows = [[], [], [], [], []]; // To store rows separately

    // The key layout array
    const keyLayout = [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
        "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
        "a", "s", "d", "f", "g", "h", "j", "k", "l", "'",
        "z", "x", "c", "v", "b", "n", "m", ",", ".", "space"
    ];

    // Iterate over the keyLayout array
    keyLayout.forEach((key, index) => {
        let keyElement;

        switch (key) {
            case "backspace":
                // Create a backspace button
                keyElement = this._createKeyBtn("⌫", "keyboard__key--wide", () => {
                    this.properties.value = this.properties.value.slice(0, -1);
                    this._updateValueInTarget();
                });
                rows[0].push(keyElement);
                break;

            case "space":
                // Create a space button, extra wide
                keyElement = this._createKeyBtn("", "keyboard__key--extra-wide", () => {
                    this.properties.value += " ";
                    this._updateValueInTarget();
                });
                rows[4].push(keyElement); // Place the space key in the 5th row
                break;

            default:
                // Create a regular key button
                keyElement = this._createKeyBtn(key, "", () => {
                    this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                    this._updateValueInTarget();
                });

                // Determine where to place the key based on its index
                if (index < 11) {
                    rows[0].push(keyElement); // First row (1-0, backspace)
                } else if (index < 21) {
                    rows[1].push(keyElement); // Second row (q-p)
                } else if (index < 31) {
                    rows[2].push(keyElement); // Third row (a-l, ')
                } else if (index < 41) {
                    rows[3].push(keyElement); // Fourth row (z-m, ", .")
                }
                break;
        }
    });

    // Append rows with line breaks
    rows.forEach((row) => {
      if (row.length) {
          const rowDiv = document.createElement("div");
          rowDiv.classList.add("keyboard__row"); // Ensure proper styling
          row.forEach((key) => rowDiv.appendChild(key));
          fragment.appendChild(rowDiv);
      }
  });


    return fragment;
},


  _updateValueInTarget() {
    const display = document.getElementById("display");
    if (display) {
      display.innerText = this.properties.value;
    }
    updateStoreList(this.properties.value);
  },

  open(initialValue = "") {
    this.properties.value = initialValue;
    this._updateValueInTarget();
    this.elements.main.classList.remove("keyboard--hidden");
  },

  close() {
    this.elements.main.classList.add("keyboard--hidden");
  },
};


// Initialize the keyboard on page load
window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init();

  // Get UI elements
  const searchButton = document.getElementById("search-button");
  const homeButton = document.getElementById("home-button");
  const mapContainer = document.getElementById("map-container");
  const keyboardPlaceholder = document.getElementById("keyboard-placeholder");
  const displayContainer = document.getElementById("display-container");
  const storeListContainer = document.getElementById("store-list");
  const categoryButton = document.getElementById("category-button");
  const categoryListContainer = document.getElementById("category-list");

  // Toggle category view
  function toggleCategoryView() {
    if (categoryListContainer.style.display === "none" || categoryListContainer.style.display === "") {
      // Show category list and hide other views
      categoryListContainer.style.display = "block";
      mapContainer.style.display = "none";
      displayContainer.style.display = "none";
      storeListContainer.style.display = "none";
      keyboardPlaceholder.style.display = "none";
    } else {
      // Hide category list and restore other views
      categoryListContainer.style.display = "none";
      keyboardPlaceholder.style.display = "none";
      mapContainer.style.display = "block";
      displayContainer.style.display = "none";
      storeListContainer.style.display = "none";
    }
  }

  // Attach event listener to category button
  categoryButton.addEventListener("click", toggleCategoryView);

  // Toggle keyboard view
  function toggleKeyboard() {
    if (keyboardPlaceholder.style.display === "none" || keyboardPlaceholder.style.display === "") {
      keyboardPlaceholder.style.display = "block";
      displayContainer.style.display = "flex";
      storeListContainer.style.display = "block";
      mapContainer.style.display = "none";
      categoryListContainer.style.display = "none";

      Keyboard.open("");
      searchButton.classList.add("hidden");
      homeButton.classList.remove("hidden");
    } else {
      keyboardPlaceholder.style.display = "none";
      displayContainer.style.display = "none";
      storeListContainer.style.display = "none";
      mapContainer.style.display = "block";

      Keyboard.close();
      searchButton.classList.remove("hidden");
      homeButton.classList.add("hidden");
    }
  }

  searchButton.addEventListener("click", toggleKeyboard);
  homeButton.addEventListener("click", toggleKeyboard);
});
document.addEventListener("DOMContentLoaded", function () {
  const assistButton = document.getElementById("assist-button");
  const assistReturnButton = document.getElementById("assist-return-button");
  const container = document.querySelector(".content-box");

  const section1 = document.querySelector(".section-1");
  const section2 = document.querySelector(".section-2");
  const section3 = document.querySelector(".section-3");
  const section4 = document.querySelector(".section-4");

  let isReordered = false; // Track current state
  let timeoutId; // Store timeout ID

  function reorderSections() {
      if (isReordered) {
          // Restore original order
          container.appendChild(section1);
          container.appendChild(section2);
          container.appendChild(section3);
          container.appendChild(section4);
          assistButton.style.display = "block";
          assistReturnButton.style.display = "none";
      } else {
          // Move Section 4 to the top
          container.appendChild(section4);
          container.appendChild(section2);
          container.appendChild(section3);
          assistButton.style.display = "none";
          assistReturnButton.style.display = "block";
      }

      isReordered = !isReordered; // Toggle state
  }

  assistButton.addEventListener("click", function () {
      reorderSections();
  });

  assistReturnButton.addEventListener("click", function () {
    reorderSections();
  });


  document.getElementById("chinese-button").addEventListener("click", function () {
    document.getElementById("assist-button").textContent = "无障碍援助";
    document.getElementById("assist-return-button").textContent = "默认配置";
    document.getElementById("category-button").textContent = "类别";
    document.getElementById("search-button").textContent = "搜索";
    document.getElementById("home-button").textContent = "主页";
  }); 

  document.getElementById("english-button").addEventListener("click", function () {
    document.getElementById("assist-button").textContent = "Accessible Assistance";
    document.getElementById("assist-return-button").textContent = "Return to Default";
    document.getElementById("category-button").textContent = "Category";
    document.getElementById("search-button").textContent = "Search";
    document.getElementById("home-button").textContent = "Home";
  }); 

});
