var tags = {};
var tasks = {};

function removeTask(task_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      loadTasks();
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
  xhttp.open("GET", "../tasks", true);
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
	var innerList = `<li><a href="#" class="active">INBOX</a></li>`;
	for(var id in tags) {
		innerList += `<li><a href="#">${tags[id].toUpperCase()}</a></li>`
	}
	document.getElementById("tags").innerHTML = innerList;
}

var input = document.getElementById("newtasktext");
input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
       addTask();
    }
});

window.onload = function() {
	loadTasks();
	loadTags();
}
