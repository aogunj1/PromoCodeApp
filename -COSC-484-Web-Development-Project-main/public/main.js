/*function run() {
  fetch("/api/members")
    .then((res) => res.json())
    .then((json) => {
      const tableSection = document.getElementById("table");
      tableSection.style.visibility = "visible";
      json.forEach(function(user) { 
        tableSection.getElementsByTagName("p")[0].innerText += user.name + '\n';
      });
    });
}*/

function verifyLogin(e, form) {
  e.preventDefault();
  query = "?email=" + form.floatingInput.value 
  + "&pass=" + form.floatingPassword.value ;

  fetch("/api/getAccount" + query, {method: 'get'}).then((res) => res.json()).then((json) => {
    console.log(json);
    console.log(form.memory.checked);
    if(json.length > 0) {
      const jsonObj = JSON.parse(JSON.stringify(json));

      const d = new Date();
      const expirationDays = 10;
      d.setTime(d.getTime() + (expirationDays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      if(!form.memory.checked) {
        expires = "";
      }

      document.cookie = "loggedin=true;" + expires + ";path=/";
      //document.cookie = "email=true;" + expires + ";path=/";
      for (var i = 0; i < jsonObj.length; i++) {
        document.cookie = "email="+ jsonObj[i]['email'] +";" + expires + ";path=/";
        console.log();
      }
      window.location.href = 'index.html';
      } else {
      document.getElementById("fail").innerHTML = "Incorrect Email or Password";
    }
  }).catch((err) => {
    console.log(err);
    document.getElementById("fail").innerHTML = "Error";
  });
}

function verifyNewAccount(form) {
  const pass = form.floatingPassword.value;
  const cpass = form.floatingConfirmPassword.value;
  const uname = form.floatingUsername.value;

  return verifyPassword(pass, cpass) && verifyUsername(uname);
}

function createNewAccount(e, form) {
  e.preventDefault();

  if(verifyNewAccount(form)) {
    fetch("/api/signup", {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({
        "uname": form.floatingUsername.value,
        "email": form.floatingEmail.value,
        "fname": form.floatingFirstName.value,
        "lname": form.floatingLastName.value,
        "pass": form.floatingPassword.value,
        "phone": form.floatingTelephone.value,
        "favs": {}
      })
    }).then((res) => {
      console.log(res);
      // get expires time
      const d = new Date();
      const expirationDays = 1;
      d.setTime(d.getTime() + (expirationDays*24*60*60*1000));
      const expires = "expires="+ d.toUTCString();

      document.cookie = "loggedin=true;" + expires + ";path=/";
      document.cookie = "email="+ form.floatingEmail.value +";" + expires + ";path=/";

      window.location.href = res.url;
    }).catch((err) => {
      alert('Error')
      alert(err);
      document.getElementById("fail").innerHTML = "Error";
    });
  }
}

function updateSettings(e, form) {
  e.preventDefault();
  const username = form.floatingUsername.value;
  const currentPassword = form.floatingPassword.value;
  const confirmPassword = form.floatingConfirmPassword.value;
  var dbPassword;
  //get the user password from database
  fetch("/api/getAccount?email=" + getCookie("email"), {method: 'get'}).then((res) => res.json()).then((json) => {
    const jsonObj = JSON.parse(JSON.stringify(json));
    //loop through response and get the password
    for (var i = 0; i < jsonObj.length; i++) {
      dbPassword = jsonObj[i]['pass'];
    }
    console.log(verifyUsername(username));
    console.log(verifyPassword(currentPassword, confirmPassword));
    console.log(verifyPassword(currentPassword, dbPassword));

    return (verifyUsername(username) && verifyPassword(currentPassword, confirmPassword) && verifyPassword(currentPassword, dbPassword));
  }).then((verified) => {
    console.log("verified:" + verified);
    if(verified) {
      fetch("/api/updateSettings", {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "uname": form.floatingUsername.value,
          "email": getCookie("email"),
          "fname": form.floatingFirstName.value,
          "lname": form.floatingLastName.value,
          "pass": form.floatingNewPassword.value,
          "phone": form.floatingTelephone.value
        })
      }).then((res) => {
        console.log("fetch updateAccount modified: " + res);
      });
    }
  });
}

function updateInterests(e, form) {
  e.preventDefault();

  const clothing = document.querySelector('#clothing:checked');
  const electronics = document.querySelector('#electronics:checked');
  const food = document.querySelector('#food:checked');
  console.log('clothing: ' + !(clothing == null));
  console.log('electronics: ' + !(electronics == null));
  console.log('food: ' + !(food == null));

  fetch("/api/updateInterests", {
    method: 'POST',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "email": getCookie("email"),
      "favs": {
        "clothing": !(clothing == null),
        "electronics": !(electronics == null),
        "food": !(food == null)
      }
    })
  }).then((res) => {
    console.log("fetch updateAccount modified: " + res);
  });
}

function userInfo() {
  const query = "?email=" +getCookie("email");
  var uname, email, fname, lname, phone;
  fetch("/api/getAccount" + query, {method: 'GET'})
  .then((res) => res.json().then((json) => {
    const jsonObj = JSON.parse(JSON.stringify(json));

    //loop through response and get the email
    for (var i = 0; i < jsonObj.length; i++) {
      uname = jsonObj[i]['uname'];
      email = jsonObj[i]['email'];
      fname = jsonObj[i]['fname'];
      lname = jsonObj[i]['lname'];
      phone = jsonObj[i]['phone'];
      favs = jsonObj[i]['favs'];
    }

    document.getElementById("info-usr").innerHTML = uname;
    document.getElementById("info-em").innerHTML = email;
    document.getElementById("info-name").innerHTML = fname + " " + lname;
    document.getElementById("info-ph").innerHTML = 
    "(" + phone.substring(0,3) + ") " + phone.substring(3,6) + "-" + phone.substring(6,10);
    
    document.getElementById("clothing").checked = favs.clothing;
    document.getElementById("electronics").checked = favs.electronics;
    document.getElementById("food").checked = favs.food;
  }));
}

/* Verify Username Length
   - Length L must satisfy 5 < L < 24 */
   function verifyUsername(username) {
    var len = username.length;
    if( len < 4 ) {
        alert('username must be at least 4 characters long');
        return false;
    }
    else if( len > 24 ) {
        alert('username must be less than 24 characters long');
        return false;
    }
    return true;
}

/* Verify Password Match
   - Password and Confirm Password Inputs must match */
function verifyPassword(password, confirmPassword) {
    if(password != confirmPassword) {
        alert("passwords don't match");
        return false;
    }
    return true;
}

// get specfic named cookie
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// login check on pages, kicks back out if not. Or on login kicks back in.
function checkLogin() {
  let loggin = getCookie("loggedin");
  if(window.location.href.substring(window.location.href.lastIndexOf('/'),) == "/login.html") {
    if (loggin) {
      window.location.href = 'index.html';
    }
  }
  else if (!loggin) {
    window.location.href = 'login.html';
  } else {
    console.log('check login success');
  }
}

// on logout, delete the cookies allowing site acces
function logout() {
  document.cookie = "loggedin=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = 'login.html';
}

/* Create a post
-  takes a form from home page and creates an entry in the database, returns the new post
*/
function createPost(e, formPost){
  e.preventDefault();
  //query formPost values replaced by id or for element in home page
  query = "?title=" + formPost.title.value
  + "&desc=" + formPost.desc.value
  + "&imageUrl=" + formPost.imageUrl.value
  + "&link=" + formPost.link.value
  + "&category=" + formPost.category.value;
  fetch("api/posts" + query, {method: 'post'}).then((res) => res.json()).then((json) => {    
    alert("Post was created!");
  }).catch((err) => {
    alert(err);
  });
}

/* Shows all posts under a selected category selected by user
*/
function getPost(e, formPost){
  e.preventDefault();
  document.getElementById('ca').innerHTML = "";
  // alert(JSON.stringify(x));

  query = "?category=" + formPost.categoryG.value;
  fetch("api/post" + query, {method: 'get'}).then((res) => res.json()).then((json) => {
    if(json.length == 0){
      alert("No entries found");
    }
    postAdd(json);
  }).catch((err) => {
    alert(err);
  });
}

function postAdd(jPost){
  for(let i = 0; i < jPost.length; i++){
    var div = document.createElement('div');
    div.setAttribute('class', 'card');
    div.innerHTML = `
    <h4 class="card-title">${jPost[i].title}</h4>
    <h6 class="card-subtitle mb-2 text-muted">${jPost[i].desc}</h6>
     <img src="${jPost[i].imageUrl}" alt= "Image">
     <a href="${jPost[i].link}" class="btn btn-primary">Click Here</a>`;
     document.getElementById('ca').appendChild(div);
  }
}

function getFavorites(){
  const query = "?email=" +getCookie("email");
  var uname, email, fname, lname, phone;
  fetch("/api/getAccount" + query, {method: 'GET'})
  .then((res) => res.json().then((json) => {
    const jsonObj = JSON.parse(JSON.stringify(json));

    //loop through response and get the email
    for (var i = 0; i < jsonObj.length; i++) {
      uname = jsonObj[i]['uname'];
      email = jsonObj[i]['email'];
      fname = jsonObj[i]['fname'];
      lname = jsonObj[i]['lname'];
      phone = jsonObj[i]['phone'];
      favs = jsonObj[i]['favs'];
    }
    var favor = document.getElementById("categoryG");
    if(favs.clothing == true){
      var fOption = document.createElement('option');
      fOption.value = "Clothing";
      fOption.innerHTML = "Clothing";
      favor.appendChild(fOption);
    }
    if(favs.food == true){
      var fOption = document.createElement('option');
      fOption.value = "Food";
      fOption.innerHTML = "Food";
      favor.appendChild(fOption);
    }
    if(favs.electronics == true){
      var fOption = document.createElement('option');
      fOption.value = "Electronics";
      fOption.innerHTML = "Electronics";
      favor.appendChild(fOption);
    }
}
  ))}