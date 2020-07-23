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
from flask import Flask, request, abort

app = Flask(__name__)
from config import DATABASE_FILE, TABLE_NAME

@app.route('/')
def index():
    return 'Home Page'

# Add a feedback record to DB
@app.route('/addfeedback', methods=['POST', 'GET'])
def addfeedback():
    if request.method == 'POST':
        try:
            # If no data in the POST request
            if not request.json:
                print("*****No data in POST request*****")
                abort(400)

            print("Received request with JSON: ")
            print(request.json)

            if 'system_info' in request.json:
                systemInfo = request.json['system_info']
            else:
                systemInfo = 'Unknown'
            if 'call_info' in request.json:
                callInfo = request.json['call_info']
            else:
                callInfo = 'Unknown'
            if 'rating_score' in request.json:
                ratingScore = request.json['rating_score']
            else:
                ratingScore = 0
            if 'rating_desc' in request.json:
                ratingDesc = request.json['rating_desc']
            else:
                ratingDesc = 'Unknown'
            if 'feedback_time' in request.json:
                feedbackTime = request.json['feedback_time']
            else:
                feedbackTime = 'Unknown'
            if 'feedback_notes' in request.json:
                feedbackNotes = request.json['feedback_notes']
            else:
                feedbackNotes = 'Unknown'

            with sql.connect(DATABASE_FILE) as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO "+TABLE_NAME+" (systemInfo, callInfo, ratingScore, ratingDesc, feedbackTime, feedbackNotes) VALUES(?, ?, ?, ?, ?, ?)",
                            (systemInfo, callInfo, ratingScore, ratingDesc, feedbackTime, feedbackNotes))

                conn.commit()
                # conn.close()
                print("Feedback successfully added")
                return("Feedback successfully added")
            
        except Exception as e:
            print("Error in addfeedback operation: " + str(e))
            return("Error in addfeedback operation:" + str(e))
        finally:
            conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
