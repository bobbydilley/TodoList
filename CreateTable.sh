#!/bin/bash

sqlite3 todo.db < schema.sql
sqlite3 todo.db < values.sql
