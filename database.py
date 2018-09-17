import sqlite3

class Database():
    def __init__(self, file_path):
        self.file_path = file_path
        self.db = sqlite3.connect(file_path)
        self.setup()

    def setup(self):
        cursor = self.db.cursor()
        cursor.execute('PRAGMA foreign_keys=ON')
        self.db.commit()

    def new_task(self, description):
        tags = {d.strip("#") for d in description.split() if d.startswith("#")}
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO Tasks (Description) VALUES (?)
        ''', (description,))
        self.db.commit()
        task_id = cursor.lastrowid
        for tag in tags:
            self.add_tag(tag, task_id)

    def add_tag(self, tag_name, task_id):
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO Tags VALUES (?, ?)
        ''', (tag_name, task_id))
        self.db.commit()

    def remove_task(self, task_id):
        cursor = self.db.cursor()
        cursor.execute('''
            DELETE FROM Tasks WHERE TaskID = ?
        ''', (task_id,))
        self.db.commit()

    def get_tags(self):
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT TagName FROM Tags GROUP BY TagName
        ''')
        tags = []
        for row in cursor:
            tags.append(row[0])
        return tags

    def get_tasks(self):
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks
        ''')
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'time_due' : row[3], 'completed' : row[4]})
        return tasks


    def get_tasks_tag(self, tag):
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks, Tags WHERE Tasks.TaskID = Tags.TaskID AND Tags.TagName = ?
        ''', (tag,))
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'time_due' : row[3], 'completed' : row[4]})
        return tasks
