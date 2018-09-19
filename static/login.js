function login() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      key = JSON.parse(this.responseText);
      if(key.status != null) {
        alert(key.status);
      } else {
        setCookie('todokey', key.key, 100);
        window.location.href = "../";
      }
    }
  };

  xhttp.open("POST", "/login", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("username=" + username + "&password=" + password);
}

window.onload = function() {
  userkey = getCookie('todokey');
  if(userkey != "") {
    window.location.href = "../dashboard";
  }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
