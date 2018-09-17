#!flask/bin/python
from flask import Flask, jsonify, request, send_from_directory
from database import Database

app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/stat/<path:path>')
def stat(path):
    return send_from_directory('stat', path)

@app.route('/newTask', methods = ['POST'])
def new_task():
    database = Database('todo.db')
    database.new_task(request.form['description'])
    return jsonify({'status' : 'created'})

@app.route('/removeTask/<task_id>')
def remove_task(task_id):
    database = Database('todo.db')
    database.remove_task(task_id)
    return jsonify({'status' : 'removed'})

@app.route('/tasks')
def get_tasks():
    database = Database('todo.db')
    return jsonify(database.get_tasks())

if __name__ == '__main__':
    app.run(debug=True)
