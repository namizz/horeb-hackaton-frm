// Save registration to localStorage
function saveRegistration(data) {
  let registrations = JSON.parse(
    localStorage.getItem("hackHawassaRegistrations") || "[]"
  );
  data.id = Date.now();
  data.timestamp = new Date().toLocaleString();
  registrations.push(data);
  localStorage.setItem(
    "hackHawassaRegistrations",
    JSON.stringify(registrations)
  );
  return true;
}

// Main form submission handler
function handleSubmit(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById("name").value.trim(),
    department: document.getElementById("department").value.trim(),
    year: document.getElementById("year").value.trim(),
    team: document.getElementById("team").value.trim(),
    role: document.getElementById("role").value,
    expectations: document.getElementById("expectations").value.trim(),
    timestamp: new Date().toISOString(),
  };

  // Role-specific validation
  if (formData.role === "student") {
    formData.category = document.getElementById("student_category").value;
    if (!formData.category) {
      alert("Please select your skill category!");
      return;
    }
  } else if (formData.role === "professional") {
    formData.profession = document.getElementById("profession_type").value;
    if (!formData.profession) {
      alert("Please select your profession!");
      return;
    }
  } else {
    alert("Please select your role!");
    return;
  }

  // Basic required field check
  if (
    !formData.name ||
    !formData.department ||
    !formData.year ||
    !formData.team
  ) {
    alert("Please fill all required fields!");
    return;
  }

  // Save data
  if (saveRegistration(formData)) {
    document.getElementById("flashMessage").classList.add("show");
    document.getElementById("registrationForm").reset();
    showOptions();
    updateCharCount();

    setTimeout(() => {
      document.getElementById("flashMessage").classList.remove("show");
    }, 5000);

    // Optional: Send to real backend (currently commented)
    sendToBackend(formData);
  }
}

// Placeholder for real backend (e.g. Formspree, Google Sheets, etc.)
async function sendToBackend(data) {
  try {
    const response = await fetch("/api/submit", {
      // Relative path to Vercel API
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Data sent to Google Sheet!");
      // Optional: Update flash message
      document.getElementById("flashMessage").innerHTML =
        "✅ Registration submitted successfully! Saved to Google Sheet.";
    } else {
      throw new Error("Backend error");
    }
  } catch (error) {
    console.error(" Error:", error);
    alert("Failed to save to Google Sheet. Saved locally as backup.");
  }
}

// Show/hide role-specific fields
function showOptions() {
  const role = document.getElementById("role").value;
  const studentSection = document.getElementById("student_section");
  const professionalSection = document.getElementById("professional_section");

  studentSection.classList.add("hidden");
  professionalSection.classList.add("hidden");
  document.getElementById("student_category").required = false;
  document.getElementById("profession_type").required = false;

  if (role === "student") {
    studentSection.classList.remove("hidden");
    document.getElementById("student_category").required = true;
  } else if (role === "professional") {
    professionalSection.classList.remove("hidden");
    document.getElementById("profession_type").required = true;
  }
}

// Character counter for expectations
function updateCharCount() {
  const textarea = document.getElementById("expectations");
  const charCount = document.getElementById("charCount");
  const length = textarea.value.length;
  charCount.textContent = length;

  if (length > 450) charCount.style.color = "#e74c3c";
  else if (length > 400) charCount.style.color = "#f39c12";
  else charCount.style.color = "#666";
}

// View all saved registrations (for admin/debug)
function viewRegistrations() {
  const regs = JSON.parse(
    localStorage.getItem("hackHawassaRegistrations") || "[]"
  );
  if (regs.length === 0) return alert("No registrations yet.");

  let msg = `Total: ${regs.length}\n\n`;
  regs.forEach((r, i) => {
    const extra = r.category || r.profession || "";
    msg += `${i + 1}. ${r.name} (${r.team}) - ${r.role} ${extra}\n`;
  });
  alert(msg);

  if (confirm("Download as JSON?")) {
    const data =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(regs, null, 2));
    const a = document.createElement("a");
    a.href = data;
    a.download = "hack-hawassa-registrations.json";
    a.click();
  }
}

// Initialize
window.onload = function () {
  updateCharCount();
  showOptions();
  document.getElementById("registrationForm").onsubmit = handleSubmit;
};
