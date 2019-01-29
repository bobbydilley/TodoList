from flask import Flask, jsonify, request, send_from_directory
from database import Database

app = Flask(__name__)
databasefp = '/home/bobbydilley/todo.db'
@app.route('/')
def index():
    return send_from_directory('static', 'login.html')

@app.route('/auth')
def auth():
    return send_from_directory('static', 'login.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('static', 'index.html')

@app.route('/logout')
def logout():
    return send_from_directory('static', 'logout.html')

@app.route('/newTask', methods = ['POST'])
def new_task():
    database = Database(databasefp)
    database.new_task(request.form['description'], request.headers.get('X-API-Key'))
    return jsonify({'status' : 'created'})

@app.route('/removeTask/<task_id>')
def remove_task(task_id):
    database = Database(databasefp)
    database.remove_task(task_id, request.headers.get('X-API-Key'))
    return jsonify({'status' : 'removed'})

@app.route('/changeTaskComplete/<task_id>', methods = ['POST'])
def change_task(task_id):
    database = Database(databasefp)
    database.change_task_complete(task_id, request.form['task_status'], request.headers.get('X-API-Key'))
    return jsonify({'status' : 'changed'})

@app.route('/login', methods = ['POST'])
def login():
    database = Database(databasefp)
    return database.login(request.form['username'], request.form['password'])

@app.route('/<api_key>.ics')
def generate_ical(api_key):
    database = Database(databasefp)
    return database.generate_ical(api_key)

@app.route('/tags')
def get_tags():
    database = Database(databasefp)
    return jsonify(database.get_tags(request.headers.get('X-API-Key')))

@app.route('/tasks')
def get_tasks():
    database = Database(databasefp)
    return jsonify(database.get_tasks(request.headers.get('X-API-Key')))

@app.route('/tasks/<tag>')
def get_tasks_tag(tag):
    database = Database(databasefp)
    return jsonify(database.get_tasks_tag(tag, request.headers.get('X-API-Key')))

@app.route('/snoozeTask/<task_id>')
def snooze_task(task_id):
    database = Database(databasefp)
    database.snooze_task(task_id, request.headers.get('X-API-Key'))
    return jsonify({'status' : 'snoozed'})

@app.route('/<path:path>')
def stat(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
