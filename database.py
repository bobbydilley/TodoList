import sqlite3

class Database():
    def __init__(self, file_path):
        self.file_path = file_path
        self.db = sqlite3.connect(file_path)

    def new_task(self, description):
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO Tasks (Description) VALUES (?)
        ''', (description,))
        self.db.commit()

    def remove_task(self, task_id):
        cursor = self.db.cursor()
        cursor.execute('''
            DELETE FROM Tasks WHERE TaskID = ?
        ''', (task_id,))
        self.db.commit()

    def get_tasks(self):
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks
        ''')
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'time_due' : row[3], 'completed' : row[4]})
        return tasks
