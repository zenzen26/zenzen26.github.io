// Load CSV Data
let storeData = [];

Papa.parse("stores.csv", {
  download: true,
  header: true,
  complete: function (results) {
    storeData = results.data; // Array of objects with Store and Category properties
    console.log("CSV Data Loaded:", storeData);
  },
});

// Update the Category List
function updateCategoryList() {
  if (storeData.length === 0) return; // Prevent filtering if CSV isn't loaded yet

  const categoryListContainer = document.getElementById("category-list");
  categoryListContainer.innerHTML = ""; // Clear previous list

  // Extract unique categories from the store data
  const categories = [...new Set(storeData.map(item => item.Category))];

  if (categories.length === 0) {
    categoryListContainer.innerHTML = "<p>No categories found.</p>";
  } else {
    const ul = document.createElement("ul");
    categories.forEach((category) => {
      const li = document.createElement("li");
      li.textContent = category;
      ul.appendChild(li);
    });
    categoryListContainer.appendChild(ul);
  }

  categoryListContainer.style.display = "block"; // Show the category list
}

// Add event listener to the Category Button
document.getElementById("category-button").addEventListener("click", function() {
  updateCategoryList(); // Display the category list when the button is clicked
});
