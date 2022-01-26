# Hey-Tutor-api
## Install environment
- install nodejs
- install mysqlserver
- install PostMan for testing api
- install SequelPro(macos)  / TablePlus(window - https://tableplus.com/windows)
## Installing
- npm i
## Deployment
- npm run dev
## Testing
- npm run test
## Environment variables
Make sure to create your empty database hey_tutors (and hey_tutors_test if you want run npm test) on your computer first if you are working locally. At the root of the project, create a .env and a .env.test with these values (note you need to have a different name for your test database):
```
DB_NAME=hey_tutors
DB_USER=root
DB_PASSWORD=nelinelo
SERVER_PORT=3001
```
## Set up database
Run in Postman or in your browser to delete and setup all the tables in your database. Make sure to set the correct configuration for the database connection in `.env` and create the empty database `hey_tutors`, `hey_tutors_test`:
```
GET /mysql
```
