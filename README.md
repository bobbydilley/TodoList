# TodoList

A very simple todolist application written in python, that is built to be simple and light weight for you to host on your own machine.

## Setup

Make sure you have the dependencies installed

```
sudo apt install python python-pip python-flask sqlite
sudo pip install flask
```

## Running

Simply run this command to start the server in development mode:

```
python app.py
```

You can then navigate to `localhost:5000` in your browser and start using the app.

## Usage

Simply type a task into the textbox at the top and press enter.

### Tags

To tag a task write a `#` symbol followed by the tag name.

For example `Check emails #work #emails`, would create a `Check emails` task with the tags `work` and `emails`.

### Times

To assign a time to a task, write an `@` symbol followed by one of these possible times:

- `today`
- `tomorrow`
- `monday`
- `tuesday`
- `wednesday`
- `thursday`
- `friday`
- `saturday`
- `sunday`

For example `Check emails #work @tomorrow`, would create a `Check emails` task with the tag `work` and a due date of tomorrow.
