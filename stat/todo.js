var tags = {};
var tasks = {};
var current_tag = 0;
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
  xhttp.send();
}


function snoozeTask(task_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
    }
  };
  xhttp.open("GET", "../snoozeTask/" + task_id, true);
  xhttp.send();
}

function addTask() {
  var description = document.getElementById('newtasktext').value;
  if(current_tag != 0) {
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
  if(current_tag == 0) {
  	xhttp.open("GET", "../tasks", true);
  } else {
	xhttp.open("GET", "../tasks/" + current_tag, true);
  }
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
 

    if(late_label == 0 && tasks[id].time_due != null && new Date(tasks[id].time_due) < today && new Date(tasks[id].time_due).toDateString() != today.toDateString()) {
	innerList += `<h2 class="late">Late</h2>\n`;
	late_label = 1;
    }
    else if(today_label == 0 && new Date(tasks[id].time_due).toDateString() == today.toDateString()) {
	innerList += "<h2>Today</h2>\n";
	today_label = 1;
    }
    else if(tomorrow_label == 0 && new Date(tasks[id].time_due).toDateString() == tomorrow.toDateString()) {
	innerList += "<h2>Tomorrow</h2>\n";
	tomorrow_label = 1;
    }
    else if(rest_week_label == 0 && (tasks[id].time_due == null || new Date(tasks[id].time_due) > tomorrow)) {
	innerList += "<h2>Future Tasks</h2>\n";
	rest_week_label = 1;
    }

    innerList += `<div class="item">`;
    innerList += `<div class="desc">${tasks[id].description}</div>`;
    innerList += `<div class="actions">`;
    if(tasks[id].time_due != null) {
	    if(new Date(tasks[id].time_due) > tomorrow) {
		innerList += `<a href="#" class="snooze" onclick="snoozeTask(${tasks[id].id})">${new Date(tasks[id].time_due).getDate()} ${months[new Date(tasks[id].time_due).getMonth()]}</a>`;
	    } else {
	       innerList += `<a href="#" class="snooze" onclick="snoozeTask(${tasks[id].id})">SNOOZE</a>`;
            }
	    innerList += `<a href="#" class="complete" onclick="removeTask(${tasks[id].id})">COMPLETE</a>`;
    } else {
        innerList += `<a href="#" class="complete" onclick="removeTask(${tasks[id].id})">COMPLETE</a>`;
    }
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
	var innerList = `<li><a href="#" onclick="loadTag(0)" id="tag_0">ALL</a></li>`;
	for(var id in tags) {
		innerList += `<li><a href="#" id="tag_${tags[id]}" onclick="loadTag('${tags[id]}')">${tags[id].toUpperCase()}</a></li>`
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

window.onload = function() {
	setHeadText();
	loadTasks();
	loadTags();
}

function copy() {
  document.getElementById("textunder").innerHTML = document.getElementById("newtasktext").value
  .replace(/#\w+/gi, function (x) {
    return "<span class=\"red\">" + x + "</span>";
  })
  .replace(/@\w+/gi, function (x) {
    return "<span class=\"blue\">" + x + "</span>";
  });
}
