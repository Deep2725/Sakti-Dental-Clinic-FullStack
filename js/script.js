const menu = document.getElementById("menuBtn"),
    nav = document.getElementById("navLinks");

if (menu) {
    menu.onclick = () => nav.classList.toggle("show");
}


// ===============================
// Appointment Modal
// ===============================

document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="appointment-modal" id="appointmentModal">
        <div class="appointment-box">

            <button class="appointment-close" id="appointmentClose">&times;</button>

            <span class="eyebrow">Appointment</span>

            <h2>Book an <span>Appointment</span></h2>

            <p>
                Choose your preferred date and time.
                Our team will contact you to confirm.
            </p>

            <form class="appointment-form" id="appointmentForm">

                <label>
                    Name
                    <input
                        required
                        name="name"
                        maxlength="80"
                        placeholder="Full name"
                    >
                </label>

                <label>
                    Email
                    <input
                        required
                        type="email"
                        name="email"
                        placeholder="Email"
                    >
                </label>

                <label>
                    Phone
                    <input
                        required
                        type="tel"
                        name="phone"
                        pattern="[0-9+()\\- ]{7,}"
                        placeholder="Phone number"
                    >
                </label>

                <label>
                    Treatment
                    <select required name="treatment">
                        <option value="">Select treatment</option>
                        <option>Teeth Cleaning / Scaling</option>
                        <option>Tooth Filling</option>
                        <option>Tooth Extraction</option>
                        <option>Bleaching</option>
                        <option>Orthodontic Treatment</option>
                        <option>Dental Crown</option>
                        <option>Dental Implant</option>
                        <option>Artificial Complete Denture</option>
                        <option>Pediatric Dentistry</option>
                    </select>
                </label>

                <label>
                    Preferred Date
                    <input
                        required
                        type="date"
                        name="date"
                        id="appointmentDate"
                    >
                </label>

                <label>
                    Preferred Time
                    <input
                        required
                        type="time"
                        name="time"
                    >
                </label>

                <label>
                    Message
                    <textarea
                        name="message"
                        maxlength="500"
                        placeholder="Describe your problem"
                    ></textarea>
                </label>

                <button
                    class="btn primary"
                    type="submit"
                >
                    Book Appointment
                </button>

                <div
                    class="appointment-success"
                    id="appointmentSuccess"
                ></div>

            </form>
        </div>
    </div>`
);


const modal = document.getElementById("appointmentModal");
const close = document.getElementById("appointmentClose");
const date = document.getElementById("appointmentDate");


// ===============================
// Open Appointment Modal
// ===============================

function openAppt(e) {

    e.preventDefault();

    modal.classList.add("show");

    // Minimum date = today
    date.min = new Date().toISOString().split("T")[0];
}


// Appointment buttons/links
document.querySelectorAll("a").forEach(x => {

    const t = x.textContent.trim().toLowerCase();

    if (t.includes("appointment")) {
        x.addEventListener("click", openAppt);
    }

});


// ===============================
// Close Modal
// ===============================

close.onclick = () => {
    modal.classList.remove("show");
};

modal.onclick = e => {

    if (e.target === modal) {
        modal.classList.remove("show");
    }

};


// ===============================
// Submit Appointment
// ===============================

document.getElementById("appointmentForm").onsubmit = async e => {

    e.preventDefault();

    const f = e.target;

    // Browser validation
    if (!f.checkValidity()) {
        f.reportValidity();
        return;
    }

    const b = f.querySelector("button");

    b.disabled = true;
    b.textContent = "Booking...";


    try {

        // Get form data
        const formData = Object.fromEntries(
            new FormData(f)
        );


        // IMPORTANT:
        // Frontend uses "treatment"
        // Backend model uses "service"

        formData.service = formData.treatment;

        delete formData.treatment;


        // Send data to backend
        const r = await fetch(
            "https://sakthi-dental-clinic-backend.onrender.com/api/appointments",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(formData)
            }
        );


        const d = await r.json();


        if (!r.ok) {
            throw Error(
                d.message || "Failed to book appointment"
            );
        }


        // Success message
        const s = document.getElementById(
            "appointmentSuccess"
        );

        s.textContent =
            "Appointment request saved successfully!";

        s.style.display = "block";


        // Reset form
        f.reset();


    } catch (err) {

        console.error("Appointment Error:", err);

        alert(
            err.message || "Failed to book appointment"
        );

    } finally {

        b.disabled = false;

        b.textContent = "Book Appointment";

    }

};