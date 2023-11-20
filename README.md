## Tutorials_booking_app


### Base URL
- The base URL for the API is `http://localhost:3001` unless you configure it differently.

### Scoring method
- the score is calculated as follows :
- we only consider tutors who teach the same subject for the same grade.
- if the tutor has slots avaiable in days that will be sufficent for the number of classes gets 10 points
- for each class if the tutor has sufficent slots for the duration and in the prefered time and prefered day gets 15 points
- for each class if the tutor has sufficent slots for the duration prefered day but not in the prefered time and  gets 10 points

### AI mode and conventional mode 
- They both work with the same algorithm the only diffrence is how each one gets the student prefrences.
- The AI mode uses openAI version 4 with the new function calling capbilties which is utilized here to create the studentPrefrences JSON with good acuracy.
- Subjects are enumed to maths,arabic,science .
- The start and end time refer to the start and end of the prefered time in 24h format.

### Endpoints

#### 1. Match Tutors
- **Endpoint:** `POST /match`
- **Description:** Matches tutors based on student preferences.
- **Request Payload:**
  ```json
  {
    "subject": "maths",
    "grade": 10,
    "classes": [
      {
        "duration": 1,
        "prefTime": [
          { "day": "monday", "slots": [14, 15] },
          { "day": "wednesday", "slots": [16, 17] }
        ]
      },
      // Additional class preferences...
    ]
  }
  ```
- **Response:**
  ```json
  {
    "matchedTutors": [
      { "tutor": { "name": "John Doe", "subject": "maths", "grades": [10], "availability": [...] }, "fitScore": 75 },
      // Additional matched tutors...
    ]
  }
  ```

#### 2. Generate Student Preferences using GPT
- **Endpoint:** `POST /ai`
- **Description:** Uses GPT to generate student preferences based on user input.
- **Request Payload:**
  ```json
  {
    "message": "Generate student preferences for a math class."
  }
  ```
- **Response:**
  ```json
  {
    "matchedTutors": [
      { "tutor": { "name": "Jane Doe", "subject": "maths", "grades": [10], "availability": [...] }, "fitScore": 80 },
      // Additional matched tutors...
    ]
  }
  ```

#### 3. Add to Favorites
- **Endpoint:** `POST /addToFav`
- **Description:** Adds a tutor to the student's favorites.
- **Request Payload:**
  ```json
  {
    "studentName": "Alice",
    "tutorName": "John Doe",
    "fitScore": 75
  }
  ```
- **Response:**
  ```json
  {
    "studentName": "Alice",
    "tutorName": "John Doe",
    "fitScore": 75,
    "_id": "5f25d18aa08be327882bf84e",
    "__v": 0
  }
  ```

### Data Models

#### Tutor Model
- Represents information about a tutor.
  ```json
  {
    "name": "John Doe",
    "subject": "maths",
    "grades": [10],
    "availability": [
      { "day": "monday", "slots": [14, 15] },
      { "day": "wednesday", "slots": [16, 17] }
    ]
  }
  ```

#### Student Preferences Model
- Represents student preferences for matching tutors.
  ```json
  {
    "subject": "maths",
    "grade": 10,
    "classes": [
      {
        "duration": 1,
        "prefTime": [
          { "day": "monday", "slots": [14, 15] },
          { "day": "wednesday", "slots": [16, 17] }
        ]
      }
    ]
  }
  ```

#### Favorite Tutor Model
- Represents a tutor added to a student's favorites.
  ```json
  {
    "studentName": "Alice",
    "tutorName": "John Doe",
    "fitScore": 75
  }
  ```

### Errors
- If an error occurs, the API will respond with an appropriate status code and an error message.

### Notes
- Make sure to replace the base URL with the actual URL where the API is hosted.
- Always check the API documentation for any updates or changes.

### conventional mode

<img width="798" alt="Screenshot 2023-11-20 at 11 22 48 PM" src="https://github.com/Ahmed-Elghobashy/Tutorials_booking_app/assets/61662872/f56294b6-9fe5-4485-b1ff-d6af67d8d516">

### AI mode 
<img width="655" alt="Screenshot 2023-11-20 at 11 35 25 PM" src="https://github.com/Ahmed-Elghobashy/Tutorials_booking_app/assets/61662872/d48b3f6f-6b57-4429-91f0-fb458d03d723">

