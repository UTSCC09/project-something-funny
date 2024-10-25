[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/DnqlZtdt)

Team registration and project proposal
Project Title: 
University of Toronto Grand Library

Team Members:
Chang Ma, Swetha Poneasan, Masahisa Sekita

Description of the web application:
Our web application is going to be a database for courses that can be taken at the University of Toronto. The database will allow us to see all courses, see course descriptions, see previous course lectures/assignments/tests, and allow students to create community notes on these courses. Students will be able to interact with other students through any posts they make and can work on files and documents together in real-time.

Web Application Features:

Beta Version:
  Registration: Users can register with local authentication and third-party authentication
  Email verification when users register
  Login/Sign out
  UI/UX
  Uploading files/videos/images
  commenting on files/videos/images
  Storing and displaying notes
  Real-Time document editing (like Google Docs)
  Allow users to type and add annotations, highlight, and change font sizes
  Adding comments to documents
  Commenting on certain parts of text (like in Google Docs)

Final Version:
  Authorization (e.g. who can edit and who reads). User permissions may change over time.
  Security (ensuring that our website is secure)
  Timestamp Video Commenting (Commenting on Video appears at a specific time the user wants)
  Ensure that only the most voted for comments/uploads/notes are displayed on the website
  Private messaging/calling feature that allows users to message or call other users in real-time
  Putting restrictions on users so that they do not perform too many actions in too short of a time (e.g. in one hour a user cannot be allowed to make over 10,000 comments).

Technology stack:
  SPA: Next.js
  Backend: RESTful (Node.js, Express)
  Backend database: NeDB
  Deployment: Virtual Machine

Description of the top 5 technical challenges:
  Real-time document editing: We must ensure that users can see what another user is writing or editing in real time. Users should be able to see the cursors of other users when they are editing.
  Authorization: Ensuring that users are allowed/not allowed to edit certain files. Providing and removing access to users for different documents at different times. Additionally, make sure that the website is safe from people trying to hack in or attack the server.
  Video Comments: Ensuring that comments only appear at the correct video timestamps (similar to how comments appear when rewatching a livestream video). For example, comments will appear over time as a user watches the video.
  Web Optimization: Our application will be dealing with videos, various files, and real time document editing. Making sure that our database does not grow too large and also making sure that our website does not run with lag will be difficult. We must also   ensure that users are able to upload large files or long videos without impacting the database.
  User optimization: Our application will also be dealing with multiple users using the application at the same time. We must ensure that the web application does not lag, all users see the same data on the page at once, and all real time features perform correctly. For example, we may have multiple users editing a document at once so we must ensure that the real time editing does not lag. Additionally, we have to make sure individual malicious users cannot overload the website (e.g. ddos attack).
