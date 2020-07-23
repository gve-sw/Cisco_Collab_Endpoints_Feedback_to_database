"""Copyright (c) 2020 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
"""

import sqlite3 as sql

from config import DATABASE_FILE, TABLE_NAME

# Creating a new db file to store the new table, or connecting if already exists
conn = sql.connect(DATABASE_FILE)
print("Opened database successfully")

# Sample data to add to db
systemInfo = "systemInfo_test"
callInfo = "callInfo_test"
ratingScore = 2
ratingDesc = "ratingDesc_test"
feedbackTime = "time_test"
feedbackNotes = "notes_test"

# Insert the data to the created table
cur = conn.cursor()
cur.execute("INSERT INTO "+TABLE_NAME+" (systemInfo, callInfo, ratingScore, ratingDesc, feedbackTime, feedbackNotes) VALUES(?, ?, ?, ?, ?, ?)",
            (systemInfo, callInfo, ratingScore, ratingDesc, feedbackTime, feedbackNotes))

print("Sample data inserted successfully")

#  Print the table contents
print("Current table rows: ")
cur.execute("SELECT * FROM "+TABLE_NAME)
rows = cur.fetchall()
for row in rows:
    print(row)



# Save the changes and close the connection
conn.commit()
conn.close()
