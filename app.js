const API_URL =
    "https://script.google.com/macros/s/AKfycbzPIr6NHzx_sDdcZUMUXlQ19KkJE_1UTMm3XjR7N0z6kZJAoxmPWYJqioiQx17z4Yn7GQ/exec";


const registerForm =
    document.getElementById("registerForm");


const nextAppointmentForm =
    document.getElementById("nextAppointmentForm");


const messageBox =
    document.getElementById("message");


const connectionStatus =
    document.getElementById("connectionStatus");



/* ---------------------------------------------------------
   MESSAGE
--------------------------------------------------------- */

function showMessage(text, type) {

    messageBox.textContent = text;

    messageBox.className =
        `message ${type}`;
}



/* ---------------------------------------------------------
   BUTTON BUSY STATE
--------------------------------------------------------- */

function setBusy(button, busy) {

    if (!button.dataset.originalText) {

        button.dataset.originalText =
            button.textContent;
    }


    button.disabled = busy;


    button.textContent =
        busy
            ? "Please wait..."
            : button.dataset.originalText;
}



/* ---------------------------------------------------------
   CALL GOOGLE APPS SCRIPT
--------------------------------------------------------- */

async function callApi(payload) {

    const response = await fetch(
        API_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify(payload)
        }
    );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}`
        );
    }


    const text =
        await response.text();


    try {

        return JSON.parse(text);

    } catch {

        throw new Error(
            "The server returned an unexpected response."
        );
    }
}



/* ---------------------------------------------------------
   REGISTER NEW PATIENT
--------------------------------------------------------- */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const button =
            event.submitter;


        setBusy(button, true);


        messageBox.classList.add(
            "hidden"
        );


        const payload = {

            action: "register",

            name:
                document
                    .getElementById("name")
                    .value
                    .trim(),

            mobile:
                document
                    .getElementById("mobile")
                    .value
                    .trim(),

            appointmentDate:
                document
                    .getElementById("appointmentDate")
                    .value,

            appointmentTime:
                document
                    .getElementById("appointmentTime")
                    .value
        };


        try {

            const result =
                await callApi(payload);


            if (result.success) {

                showMessage(

                    `Patient registered successfully.
Patient ID: ${result.patientId}
Name: ${result.patientName}`,

                    "success"
                );


                registerForm.reset();


                setDefaultDates();

            } else {

                showMessage(

                    result.message ||
                    "Registration failed.",

                    "error"
                );
            }


        } catch (error) {

            showMessage(

                `Unable to contact the clinic API.
${error.message}`,

                "error"
            );

        } finally {

            setBusy(button, false);
        }

    }
);



/* ---------------------------------------------------------
   NEXT APPOINTMENT
--------------------------------------------------------- */

nextAppointmentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const button =
            event.submitter;


        setBusy(button, true);


        messageBox.classList.add(
            "hidden"
        );


        const payload = {

            action: "nextAppointment",

            patientId:
                document
                    .getElementById("patientId")
                    .value
                    .trim()
                    .toUpperCase(),

            appointmentDate:
                document
                    .getElementById("nextAppointmentDate")
                    .value,

            appointmentTime:
                document
                    .getElementById("nextAppointmentTime")
                    .value
        };


        try {

            const result =
                await callApi(payload);


            if (result.success) {

                showMessage(

                    `Next appointment scheduled successfully.
Patient ID: ${result.patientId}
Name: ${result.patientName}
Date: ${result.appointmentDate}
Time: ${result.appointmentTime}`,

                    "success"
                );


                nextAppointmentForm.reset();


                setDefaultDates();

            } else {

                showMessage(

                    result.message ||
                    "Appointment scheduling failed.",

                    "error"
                );
            }


        } catch (error) {

            showMessage(

                `Unable to contact the clinic API.
${error.message}`,

                "error"
            );

        } finally {

            setBusy(button, false);
        }

    }
);



/* ---------------------------------------------------------
   TAB SWITCHING
--------------------------------------------------------- */

document
    .querySelectorAll(".tab")
    .forEach(function (tab) {

        tab.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".tab")
                    .forEach(function (t) {

                        t.classList.remove(
                            "active"
                        );

                    });


                document
                    .querySelectorAll(".section")
                    .forEach(function (section) {

                        section.classList.remove(
                            "active"
                        );

                    });


                tab.classList.add(
                    "active"
                );


                document
                    .getElementById(
                        tab.dataset.section
                    )
                    .classList.add(
                        "active"
                    );


                messageBox.classList.add(
                    "hidden"
                );

            }
        );

    });



/* ---------------------------------------------------------
   DEFAULT DATE
--------------------------------------------------------- */

function todayForInput() {

    const now =
        new Date();


    const offset =
        now.getTimezoneOffset();


    return new Date(
        now.getTime()
        -
        offset * 60000
    )
        .toISOString()
        .slice(0, 10);
}



function setDefaultDates() {

    const today =
        todayForInput();


    document
        .getElementById(
            "appointmentDate"
        )
        .value = today;


    document
        .getElementById(
            "nextAppointmentDate"
        )
        .value = today;
}


setDefaultDates();



/* ---------------------------------------------------------
   PWA SERVICE WORKER
--------------------------------------------------------- */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator
                .serviceWorker
                .register("sw.js")
                .catch(function () {

                    // Service worker is optional
                    // during development.

                });

        }
    );

}



/* ---------------------------------------------------------
   ONLINE / OFFLINE STATUS
--------------------------------------------------------- */

connectionStatus.textContent =
    navigator.onLine
        ? "Online"
        : "Offline";


window.addEventListener(
    "online",
    function () {

        connectionStatus.textContent =
            "Online";

    }
);


window.addEventListener(
    "offline",
    function () {

        connectionStatus.textContent =
            "Offline";

    }
);

// --- PWA form safeguards ---
function setMinimumAppointmentDate() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const minDate = `${yyyy}-${mm}-${dd}`;
  dateInputs.forEach((input) => {
    if (!input.min) input.min = minDate;
  });
}

function isValidIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value || "").trim());
}

function isValidPatientId(value) {
  return /^P\d{6}$/.test(String(value || "").trim().toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {
  setMinimumAppointmentDate();
});


document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.dataset.submissionGuard === "1") return;
  form.dataset.submissionGuard = "1";
  const buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
  buttons.forEach((button) => {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    if (button.tagName === "BUTTON") button.textContent = "Please wait…";
  });
  // Re-enable after 15 seconds in case the app's existing async handler needs to recover.
  setTimeout(() => {
    delete form.dataset.submissionGuard;
    buttons.forEach((button) => {
      button.disabled = false;
      if (button.tagName === "BUTTON" && button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    });
  }, 15000);
}, true);
