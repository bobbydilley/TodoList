window.onload = function() {
  userkey = setCookie('todokey', '', 0);
  userkey = setCookie('cache', '', 0);
  window.location.href = "../";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
