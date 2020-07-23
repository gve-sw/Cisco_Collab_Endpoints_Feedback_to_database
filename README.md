# Cisco_Collab_Endpoints_Feedback_to_database
Cisco Collaboration Endpoints macro that collects feedback after a call and stores it in a remote database via simple Flask application.  

| :exclamation:  External repository notice   |
|:---------------------------|
| This repository is now mirrored at "PLEASE UPDATE HERE - add External repo URL after code review is completed"  Please inform a https://github.com/gve-sw/ organization admin of any changes to mirror them to the external repo |

## Contacts
* Gerardo Chaves
* Rami Alfadel

## Solution Components
* Collaboration Endpoints
*  Javascript
*  Python 3
*  Flask
*  SQLLite

## Installation/Configuration

1. Make sure that the Cisco Room Collaboration device you are going to install the macro on has the 
```HttpClient AllowHTTP``` parameter set to 'True'. This is to allow the device to communicate using
 HTTP(S) requests with the server hosting the database. Can be changed on the web interface of the Collaboration Endpoint: 
    ```Setup -> Configuration -> HttpClient -> AllowHttp```.
    More details in the admin guide for the corresponding device, but that setting should be the same for all. Here is 
    the Admin guide for the Cisco Webex RoomKit device: 
    https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/ce913/room-kit-administrator-guide-ce913.pdf

2. Copy the contents of the **Feedback_toDB.js** file into a macro you create on the Macro Editor from the Integration menu  
on the web interface of the Webex Collaboration Room Device you intend to run it on. Turn on the macro so it is active 
for all calls.  

3. Change constants SQLDBServerHost and SQLDBServerPort in **Feedback_toDB.js** to point to the location (IP Address and port) of the REST server being implemented by running **04-run_flask_app.py** as per above.
   Example:  
    ```
    const SQLDBServerHost='10.0.0.10';
    const SQLDBServerPort='5000';
    ```

4. The macro code clears the Collaboration Endpoint's list of hosts allowed to reach via HTTPClient and adds the host specified above.
If the device has an existing list of hosts to allow, comment out or remove the line that clears it:  
   ``` xapi.command("HttpClient Allow Hostname Clear"); ```

The sample is using SQLLite to generate and manipulate a new database and table. 
If using an existing database, you can customize the below configuration to connect to it and create the new table. 

5. Copy all the python scripts from this repository (*.py) to a server you intend to host the database on. 
Make sure that it has Python3 installed and it is reachable by the Collaboration Endpoint.   
 
6. Copy the **requirements.txt** file from this repository onto the server and install the required dependencies using the following command:   
```pip install -r requirements.txt```  

7. Edit the **config.py** file if you wish to use different names for the database and table used by the sample code
to store the feedback information: 
    ```
    DATABASE_FILE = 'feedback_database.db'
    TABLE_NAME = 'feedbacks'
    ```  

8. Run the setup python scripts in the server to initialize the database and table:  

    1. Create the database file and create a table:        
    ```python 01-create_db_and_table.py```

    2. (Optional) Connect to the database file and create a sample record:        
    ```python 02-add_sample_record.py```
    
    3. (Optional) Viewing the database can be done using any SQL database viewer software, or
    using this script to display the database records:        
    ```python 03-view_db_rows.py``` 

9. Launch the flask application on the server so the macro code on the Cisco Collaboration Device can reach it:  
```python 04-run_flask_app.py```

#### Note:
- This sample code creates a table with the following objects/columns :
    ```
    feedbackId INTEGER PRIMARY KEY AUTOINCREMENT,
    systemInfo TEXT,
    callInfo TEXT, 
    ratingScore int, 
    ratingDesc TEXT, 
    feedbackTime TEXT, 
    feedbackNotes TEXT
    ``` 
  - If needs to be changed or customized, the changes must be done and matched on: 
    -   Database table
    -   The python scripts on the server
    -   The web application running on the server (Flask in this sample)
    -   The macro code on the Collaboration Endpoint 

## Usage

Once the macro and flask server are up and running, just place a call or receive a call on the Cisco Collaboration Room device
and upon the call disconnecting you should receive the pop-ups depicted in the images below on the Touch10 device you used
to place/receive the call or on the main screen if it is a DX80, DX70 or DeskPro device. 

 

# Screenshots


![Initial Feedback Pop-up](/IMAGES/01.png)

![Feedback reason selection](/IMAGES/02.png)

![Contact info collecting](/IMAGES/03.png)

![Final Thank You pop-up](/IMAGES/04.png)

### LICENSE

Provided under Cisco Sample Code License, for details see [LICENSE](LICENSE.md)

### CODE_OF_CONDUCT

Our code of conduct is available [here](CODE_OF_CONDUCT.md)

### CONTRIBUTING

See our contributing guidelines [here](CONTRIBUTING.md)

#### DISCLAIMER:
<b>Please note:</b> This script is meant for demo purposes only. All tools/ scripts in this repo are released for use "AS IS" without any warranties of any kind, including, but not limited to their installation, use, or performance. Any use of these scripts and tools is at your own risk. There is no guarantee that they have been through thorough testing in a comparable environment and we are not responsible for any damage or data loss incurred with their use.
You are responsible for reviewing and testing any scripts you run thoroughly before use in any non-testing environment.