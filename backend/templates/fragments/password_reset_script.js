let url_elements = window.location.pathname.split("/");
if (url_elements.length == 6) {
  let uid = url_elements[url_elements.length - 3];
  if (uid !== undefined) {
    document.querySelector("input[name=uid]").value = uid;
  }
  let token = url_elements[url_elements.length - 2];
  if (token !== undefined) {
    document.querySelector("input[name=token]").value = token;
  }
}

let error_response = function (data) {
  document
    .querySelector(".api-response")
    .html(
      "API Response: " +
        data.status +
        " " +
        data.statusText +
        "<br/>Content: " +
        data.responseText
    );
};
let success_response = function (data) {
  $(".api-response").html(
    "API Response: OK<br/>Content: " + JSON.stringify(data)
  );
};

// document.querySelector("form.ajax-post button[type=submit]").onclick = () => {
document.querySelector("form").onsubmit = (event) => {
  event.preventDefault();
  let form = document.querySelector("form.ajax-post");
  let output = document.querySelector(".api-response");
  const data = new FormData(event.target);
  const value = Object.fromEntries(data.entries());
  let success = false;
  fetch("{% url  'rest_password_reset_confirm' %}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  })
    .then((response) => {
      if (response.status === 200) {
        success = true;
      }
      return response.json();
    })
    .then((body) => {
      if (success) {
        output.innerText = "Successfully changed password. Redirecting...";
        setTimeout(() => {
          window.location = "https://{{ WEB_DOMAIN }}";
        }, 2000);
      } else {
        errors = JSON.stringify(body);
        output.innerText = `Error ${errors}`;
      }
    })
    .catch((error) => {
      output.innerText = `Error ${error}`;
    });
};