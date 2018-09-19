import sqlite3
import datetime
from dateutil import parser
import re
from icalendar import Calendar, Event

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

    def new_task(self, description):
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
        description = description.capitalize()
        cursor = self.db.cursor()
        cursor.execute('''
            INSERT INTO Tasks (Description, DueTime, DueDate) VALUES (?, ?, ?)
        ''', (description, due_time, due_date))
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

    def snooze_task(self, task_id):
        cursor = self.db.cursor()
        cursor.execute('''
            UPDATE Tasks SET DueDate = date(DueDate, "+1 Day") WHERE TaskID = ?
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
            ORDER BY DueDate IS NULL, DueDate ASC, DueTime IS NULL, DueTime ASC
        ''')
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'date_due' : row[3], 'time_due' : row[4], 'completed' : row[5]})
        return tasks


    def get_tasks_tag(self, tag):
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks, Tags WHERE Tasks.TaskID = Tags.TaskID AND Tags.TagName = ?
            ORDER BY DueDate IS NULL, DueDate ASC, DueTime IS NULL, DueTime ASC
        ''', (tag,))
        tasks = []
        for row in cursor:
            tasks.append({'id' : row[0], 'description' : row[1], 'time_created' : row[2], 'date_due' : row[3], 'time_due' : row[4], 'completed' : row[5]})
        return tasks

    def generate_ical(self):
        calendar = Calendar()
        calendar.add('version', '2.0')
        calendar.add('prodid', '-//bobby@dilley.io//https://github.com/bobbydilley/todolist//EN')
        calendar.add('TZID', 'Europe/London')
        cursor = self.db.cursor()
        cursor.execute('''
            SELECT * FROM Tasks
            ORDER BY DueDate IS NULL, DueDate ASC, DueTime IS NULL, DueTime ASC
        ''')
        tasks = []
        for row in cursor:
            if row[3]:
                event_time = datetime.time(9, 00)
                if row[4]:
                    event_time = datetime.time(int(row[4][:2]), int(row[4][3:5]))
                event = Event()
                event.add('summary', row[1])
                event.add('dtstart', datetime.datetime.combine(parser.parse(row[3]), event_time))
                event.add('dtend', datetime.datetime.combine(parser.parse(row[3]), event_time) + + datetime.timedelta(hours=1))
                calendar.add_component(event)
        return calendar.to_ical()
