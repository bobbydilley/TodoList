var tags = {};
var tasks = {};
var current_tag = 0;
var last_tag = current_tag;

function removeTask(task_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
      loadTags();
    }
  };
  xhttp.open("GET", "../removeTask/" + task_id, true);
  xhttp.send();
}

function addTask() {
  var description = document.getElementById('newtasktext').value;
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
  for(var id in tasks) {
    innerList += `<div class="item"><div class="desc">${tasks[id].description}</div><div class="actions"><a href="#" onclick="removeTask(${tasks[id].id})">COMPLETE</a></div></div>`;
  }
  document.getElementById("today").innerHTML = "<h2>Today</h2>\n" + innerList;
}

function populateTags() {
	current_tag = 0;
	last_tag = current_tag;
	var innerList = `<li><a href="#" onclick="swapTag(0)" id="tag_0" class="active">INBOX</a></li>`;
	for(var id in tags) {
		innerList += `<li><a href="#" id="tag_${tags[id]}" onclick="swapTag('${tags[id]}')">${tags[id].toUpperCase()}</a></li>`
	}
	document.getElementById("tags").innerHTML = innerList;
}

function swapTag(name) {
	last_tag = current_tag;
	document.getElementById("tag_" + name).classList.add('active');
	document.getElementById("tag_" + last_tag).classList.remove('active');
	current_tag = name;
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
