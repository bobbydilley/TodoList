import sqlite3
import datetime
from dateutil import parser
import re
from icalendar import Calendar, Event
import uuid
import pytz
from flask import jsonify
from passlib.hash import pbkdf2_sha256

class Database():
    def __init__(self, file_path):
        self.file_path = file_path
        self.db = sqlite3.connect(file_path)
        self.setup()

    def setup(self):
        cursor = self.db.cursor()
        cursor.execute('PRAGMA foreign_keys=ON')
        self.db.commit()

    def next_weekday(self, d, weekday):
        days_ahead = weekday - d.weekday()
        if days_ahead <= 0: # Target day already happened this week
            days_ahead += 7
        return d + datetime.timedelta(days_ahead)

    def new_user(self, username, password):
        hash = pbkdf2_sha256.hash(password)
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO Users VALUES (?, ?)
        ''', (username, hash))
        self.db.commit()

    def login(self, username, password):
        login = False
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT Password FROM Users WHERE Username = ?
        ''', (username,))

        for row in cursor:
            if row[0]:
                login = pbkdf2_sha256.verify(password, row[0])

        if login:
            return jsonify({"key" : self.create_session(username)})
        else:
            return jsonify({"status" : "Sorry, the username or password was incorrect"})

    def create_session(self, username):
        cursor = self.db.cursor()
        session_id = str(uuid.uuid4().hex)
        cursor.execute('''
            INSERT INTO Sessions VALUES (?, ?)
        ''', (session_id, username))
        self.db.commit()
        return session_id

    def get_user(self, session_id):
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT Username FROM Sessions WHERE SessionID = ?
        ''', (session_id,))
        username = None
        for row in cursor:
            if row[0]:
                username = row[0]
        return username

    def new_task(self, description, api_key):
        username = self.get_user(api_key)
        tags = {d.strip("#") for d in description.split() if d.startswith("#")}
        times = {d.strip("@") for d in description.split() if d.startswith("@")}
        due_time = None
        due_date = None
        for time in times:
            if time == "today" : due_date = datetime.date.today()
            if time == "tomorrow" : due_date = datetime.date.today() + datetime.timedelta(days=1)
            if time == "monday" : due_date = self.next_weekday(datetime.date.today(), 0)
            if time == "tuesday" : due_date = self.next_weekday(datetime.date.today(), 1)
            if time == "wednesday" : due_date = self.next_weekday(datetime.date.today(), 2)
            if time == "thursday" : due_date = self.next_weekday(datetime.date.today(), 3)
            if time == "friday" : due_date = self.next_weekday(datetime.date.today(), 4)
            if time == "saturday" : due_date = self.next_weekday(datetime.date.today(), 5)
            if time == "sunday" : due_date = self.next_weekday(datetime.date.today(), 6)

            match = re.match('[0-9][0-9][0-9][0-9]', time, re.M|re.I)
            if match:
                a = match.group()
                if due_date is None : due_date = datetime.date.today()
                due_time = datetime.time(int(a[:2]), int(a[2:4]))

            if time == "morning":
                if due_date is None : due_date = datetime.date.today()
                due_time = datetime.time(9, 00)

            if time == "afternoon":
                if due_date is None : due_date = datetime.date.today()
                due_time = datetime.time(12, 00)

            if time == "evening":
                if due_date is None : due_date = datetime.date.today()
                due_time = datetime.time(18, 00)

        if due_time is not None:
            due_time = due_time.strftime("%H:%M:%S")

        for time in times:
            description = description.replace('@' + time, '')
        for tag in tags:
            description = description.replace('#' + tag, '')
        
        URL_REGEX = re.compile(r'''((?:mailto:|ftp://|http://|https://)[^ <>'"{}|\\^`[\]]*)''')
        description = URL_REGEX.sub(r'<a href="\1">\1</a>', description)

        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO Tasks (Description, DueTime, DueDate, Username) VALUES (?, ?, ?, ?)
        ''', (description, due_time, due_date, username))
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

    def remove_task(self, task_id, api_key):
        username = self.get_user(api_key)
        cursor = self.db.cursor()
        cursor.execute('''
            DELETE FROM Tasks WHERE Username = ? AND TaskID = ?
        ''', (username,task_id))
        self.db.commit()

    def snooze_task(self, task_id, api_key):
        username = self.get_user(api_key)
        cursor = self.db.cursor()
        cursor.execute('''
            UPDATE Tasks SET DueDate = date(DueDate, "+1 Day") WHERE Username = ? AND TaskID = ?
        ''', (username,task_id))
        self.db.commit()

    def get_tags(self, api_key):
        username = self.get_user(api_key)
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT TagName FROM Tags, Tasks
            WHERE Tasks.Username = ?
            AND Tasks.TaskID = Tags.TaskID
            GROUP BY TagName
        ''', (username,))
        tags = []
        for row in cursor:
            tags.append(row[0])
        return tags

    def get_tasks(self, api_key):
        username = self.get_user(api_key)
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks
            WHERE Username = ?
            ORDER BY DueDate IS NULL, DueDate ASC, DueTime IS NULL, DueTime ASC
        ''', (username,))
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'date_due' : row[3], 'time_due' : row[4], 'completed' : row[5]})
        return tasks


    def get_tasks_tag(self, tag, api_key):
        username = self.get_user(api_key)
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks, Tags
            WHERE Tasks.TaskID = Tags.TaskID
            AND Tasks.Username = ?
            AND Tags.TagName = ?
            ORDER BY DueDate IS NULL, DueDate ASC, DueTime IS NULL, DueTime ASC
        ''', (username, tag))
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'date_due' : row[3], 'time_due' : row[4], 'completed' : row[5]})
        return tasks

    def generate_ical(self, api_key):
        username = self.get_user(api_key)
        calendar = Calendar()
        calendar.add('version', '2.0')
        calendar.add('prodid', '-//bobby@dilley.io//https://github.com/bobbydilley/todolist//EN')
        calendar.add('TZID', 'Europe/London')
        local = pytz.timezone("Europe/London")
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks
            WHERE Username = ?
            ORDER BY DueDate IS NULL, DueDate ASC, DueTime IS NULL, DueTime ASC
        ''', (username,))
        tasks = []
        for row in cursor:
            if row[3]:
                event_time = datetime.time(9, 00)
                if row[4]:
                    event_time = datetime.time(int(row[4][:2]), int(row[4][3:5]))
                event = Event()
                event.add('summary', row[1])
                local_dt = local.localize(datetime.datetime.combine(parser.parse(row[3]), event_time), is_dst=None)
                next_dt = local.localize(datetime.datetime.combine(parser.parse(row[3]), event_time) + datetime.timedelta(hours=1), is_dst=None)
                event.add('dtstart', local_dt.astimezone(pytz.utc))
                event.add('dtend', next_dt.astimezone(pytz.utc))
                event['uid'] = str(uuid.uuid4().hex) + "-todolist"

                calendar.add_component(event)
        return calendar.to_ical()
