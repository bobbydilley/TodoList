#!/usr/bin/python

from database import Database
import sys

database = Database('todo.db')

database.new_user(sys.argv[1], sys.argv[2])

print "New user", sys.argv[1]," created successfully."
