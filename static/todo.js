var tags = {};
var tasks = {};
var current_tag = -1;
var last_tag = current_tag;
var months = [
    "JANUARY", "FEBRUARY", "MARCH",
    "APRIL", "MAT", "JUNE", "JULY",
    "AUGUST", "SEPTEMBER", "OCTOBER",
    "NOVEMBER", "DECEMBER"
  ];

function removeTask(task_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
      if(current_tag == 0) {
        loadTags();
      }
    }
  };
  xhttp.open("GET", "../removeTask/" + task_id, true);
  xhttp.setRequestHeader("X-API-Key", userkey);
  xhttp.send();
}

function changeTaskComplete(task_id, task_status) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
      if(current_tag == 0) {
        loadTags();
      }
    }
  };
  xhttp.open("POST", "../changeTaskComplete/" + task_id, true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.setRequestHeader("X-API-Key", userkey);
  xhttp.send("task_status=" + task_status);
}



function snoozeTask(task_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
    }
  };
  xhttp.open("GET", "../snoozeTask/" + task_id, true);
  xhttp.setRequestHeader("X-API-Key", userkey);
  xhttp.send();
}

function addTask() {
  var description = document.getElementById('newtasktext').value;
  if(current_tag > 0) {
    description += " #" + current_tag;
  }
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
      loadTags();
    }
  };
  xhttp.open("POST", "../newTask", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.setRequestHeader("X-API-Key", userkey);
  xhttp.send("description=" + description);
  document.getElementById('newtasktext').value = "";
}

function loadTasks() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      tasks = JSON.parse(this.responseText);
      populateList();
    }
  };
  if(current_tag == -1) {
        xhttp.open("GET", "../inbox", true);
  }
  else if(current_tag == 0) {
  	xhttp.open("GET", "../tasks", true);
  } 
  else {
	xhttp.open("GET", "../tasks/" + current_tag, true);
  }
  xhttp.setRequestHeader("X-API-Key", userkey);
  xhttp.send();
}


function loadTags() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      tags = JSON.parse(this.responseText);
      populateTags();
    }
  };
  xhttp.open("GET", "../tags", true);
  xhttp.setRequestHeader("X-API-Key", userkey);
  xhttp.send();
}

function populateList() {
  var innerList = "";
  var late_label = 0;
  var today_label = 0;
  var tomorrow_label = 0;
  var this_week_label = 0;
  var rest_week_label = 0;
  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  for(var id in tasks) {


    if(late_label == 0 && tasks[id].date_due != null && new Date(tasks[id].date_due) < today && new Date(tasks[id].date_due).toDateString() != today.toDateString()) {
	innerList += `<h2 class="late">Yeasterday</h2>\n`;
	late_label = 1;
    }
    else if(today_label == 0 && new Date(tasks[id].date_due).toDateString() == today.toDateString()) {
	innerList += "<h2>Today</h2>\n";
	today_label = 1;
    }
    else if(tomorrow_label == 0 && new Date(tasks[id].date_due).toDateString() == tomorrow.toDateString()) {
	innerList += "<h2>Tomorrow</h2>\n";
	tomorrow_label = 1;
    }
    else if(rest_week_label == 0 && (tasks[id].date_due == null || new Date(tasks[id].date_due) > tomorrow)) {
	innerList += "<h2>Future Tasks</h2>\n";
	rest_week_label = 1;
    }

    innerList += `<div class="item">`;
    innerList += `<div class="desc">${tasks[id].description}</div>`;
    innerList += `<div class="actions">`;
    if(tasks[id].date_due != null) {
      if(new Date(tasks[id].date_due) > tomorrow) {
        if(tasks[id].time_due) {
          tmpDate = new Date('1970-01-01T' + tasks[id].time_due + 'Z');
          innerList += `<a class="snooze" onclick="snoozeTask(${tasks[id].id})">${new Date(tasks[id].date_due).getDate()} ${months[new Date(tasks[id].date_due).getMonth()]} ${tmpDate.getHoursTwoDigits()}:${tmpDate.getMinutesTwoDigits()}</a>`;
        } else {
          innerList += `<a class="snooze" onclick="snoozeTask(${tasks[id].id})">${new Date(tasks[id].date_due).getDate()} ${months[new Date(tasks[id].date_due).getMonth()]}</a>`;
        }
        } else {
        if(tasks[id].time_due) {
          tmpDate = new Date('1970-01-01T' + tasks[id].time_due + 'Z');
          innerList += `<a  class="snooze" onclick="snoozeTask(${tasks[id].id})">${tmpDate.getHoursTwoDigits()}:${tmpDate.getMinutesTwoDigits()}</a>`;
        } else {
          innerList += `<a  class="snooze" onclick="snoozeTask(${tasks[id].id})">ALL DAY</a>`;
        }

      }
    }
    var task_type = "READY";
    var task_class = "ready";
    if(tasks[id].completed == 1) {
      task_type = "PROGRESS";
      task_class = "progress";
    }
    //innerList += `<div class="complete_dropdown"><a class="complete" onclick="removeTask(${tasks[id].id})">COMPLETE</a><div class="complete_dropdown_content"><a class="ready" href="#">READY</a><a class="progress" href="#">PROGRESS</a><a href="#">COMPLETE</a></div></div>`;
    innerList += `<div class="complete_dropdown"><a class="complete ${task_class}" onclick="toggleView('toggle${tasks[id].id}')">${task_type}</a><div id="toggle${tasks[id].id}" class="complete_dropdown_content"><a onclick="changeTaskComplete(${tasks[id].id}, 0);" class="ready" href="#">READY</a><a onclick="changeTaskComplete(${tasks[id].id}, 1);" class="progress" href="#">PROGRESS</a><a onclick="removeTask(${tasks[id].id})" href="#">COMPLETE</a></div></div>`;
    innerList += `</div></div>`;
  }
  if(innerList == "") {
	  if(current_tag == 0) {
	  	innerList = `<div class="center_message">No more tasks - create one by typing!</div>`;
          } else {
		innerList = `<div class="center_message">Thats all your ${current_tag.toLowerCase()} tasks done!</div>`;
          }
  }
  document.getElementById("today").innerHTML = innerList;
}

function populateTags() {
	var innerList = `<li><a onclick="loadTag(-1)" id="tag_-1">INBOX</a></li>`;
	innerList += `<li><a onclick="loadTag(0)" id="tag_0">ALL</a></li>`;
	for(var id in tags) {
		innerList += `<li><a id="tag_${tags[id]}" onclick="loadTag('${tags[id]}')">${tags[id].toUpperCase()}</a></li>`
	}
	document.getElementById("tags").innerHTML = innerList;
	if(document.getElementById("tag_" + current_tag) == null) {
		current_tag = 0;
		last_tag = current_tag;
	}
	swapTag(current_tag);
}

function loadTag(name) {
	loadTags();
	swapTag(name);
}

function swapTag(name) {
	if(name == current_tag) {
		document.getElementById("tag_" + name).classList.add('active');
	} else {
		last_tag = current_tag;
		document.getElementById("tag_" + last_tag).classList.remove('active');
		document.getElementById("tag_" + name).classList.add('active');
		current_tag = name;
	}
	loadTasks();
}

function toggleView(view_id) {
  var x = document.getElementById(view_id);
        if (x.style.display != "block") {
          x.style.display = "block";
        } else {
          x.style.display = "none";
        }
}

function setHeadText() {
	var result = "Bobby Dilley";
	var d = new Date();
	var h = d.getHours();
	var tod = "";
	if (h < 12) {
	  tod = 'Morning'
	} else if (h < 18) {
	  tod = 'Afternoon'
	} else {
	  tod = 'Evening'
	}
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	result = days[d.getDay()] + " " + tod;
	document.getElementById('head_text').innerHTML = result;
}

var input = document.getElementById("newtasktext");
input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
       addTask();
       copy();
    }
});

var userkey = "";
window.onload = function() {
  userkey = getCookie('todokey');
  if(userkey == "") {
    window.location.href = "../";
  }
  setHeadText();
	loadTasks();
	loadTags();
  document.getElementById('newtasktext').focus();
}

function getUserKey() {
  return userkey;
}

function copy() {
  document.getElementById("textunder").innerHTML = document.getElementById("newtasktext").value
  .replace(/#\w+/gi, function (x) {
    return "<span class=\"red\">" + x + "</span>";
  })
  .replace(/@\w+/gi, function (x) {
    return "<span class=\"blue\">" + x + "</span>";
  })
  .replace(/-\-\w+\=*\w*/gi, function (x) {
    return "<span class=\"green\">" + x + "</span>";
  });
  rightAmount();
}

function rightAmount() {
  var a = textWidth(document.getElementById("newtasktext").value);
  var b = document.getElementById("newtasktext").clientWidth;
  if(a <= b) {
    document.getElementById('textunder').style.left = 0;
  } else {
    var diff = b - a;
    document.getElementById('textunder').style.left = (diff);
  }
  document.getElementById("textunder").style.width = textWidth(document.getElementById("newtasktext").value);
}

Date.prototype.getHoursTwoDigits = function() {
    var retval = this.getUTCHours();
    if (retval < 10) {
        return ("0" + retval.toString());
    } else {
        return retval.toString();
    }
}

Date.prototype.getMinutesTwoDigits = function() {
    var retval = this.getUTCMinutes();
    if (retval < 10) {
        return ("0" + retval.toString());
    } else {
        return retval.toString();
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

function textWidth(text) {
    var tag = document.createElement("div");
    tag.style.position = "absolute";
    tag.style.fontWeight = "200";
    tag.style.padding = "10px";
    tag.style.whiteSpace = "pre";
    tag.style.fontFamily = "Open Sans";
    tag.style.fontSize = "24px";
    tag.style.margin = "0";
    tag.style.border = "0";
    tag.innerHTML = text;
    document.body.appendChild(tag);
    var result = tag.clientWidth;
    document.body.removeChild(tag);
    return result + 5;
}

function icalLink() {
  window.location.href = "/" + getUserKey() + ".ics";
}

function showHide(name) {
  document.getElementById(name).classList.toggle("show");
}
