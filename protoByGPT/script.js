// Toggle categories open/close
function toggle(btn) {
  const ul = btn.nextElementSibling;
  ul.classList.toggle("hidden");
  btn.textContent = ul.classList.contains("hidden") ? "▶ " + btn.textContent.slice(2) : "▼ " + btn.textContent.slice(2);
}

// Queue page: add/remove items
function addItem() {
  const ul = document.getElementById("queueList");
  const li = document.createElement("li");
  li.textContent = "📗 New Resource ";
  const btn = document.createElement("button");
  btn.textContent = "Remove";
  btn.onclick = () => removeItem(btn);
  li.appendChild(btn);
  ul.appendChild(li);
}
function removeItem(btn) {
  btn.parentElement.remove();
}

// Search page filter
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("input", () => {
      const term = searchBox.value.toLowerCase();
      document.querySelectorAll("#resourceList li").forEach(li => {
        li.style.display = li.dataset.title.includes(term) ? "list-item" : "none";
      });
    });
  }
});