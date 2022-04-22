# Hey-Tutor-api
## Install environment
- install nodejs (https://nodejs.org/en/download/)
- install mysqlserver (https://dev.mysql.com/downloads/installer/)
- install VSCode (https://code.visualstudio.com/download)
- install PostMan for testing api (https://www.postman.com/downloads/)
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
GET /mysql (http://localhost:3001/mysql)
```

## Deploy back-end
1. Create account on Aws
![aws](https://user-images.githubusercontent.com/43951048/164775389-9608f7e3-9dd7-4a30-bcf1-e0bb60cc89bd.png)
2. Launch an EC2 instance
![ecsinstance](https://user-images.githubusercontent.com/43951048/164774358-2924d356-6ab6-4fef-9b29-1bd39761680e.png)
 - Select Ubuntu 18.04
3. SSH into your instance
![ssh](https://user-images.githubusercontent.com/43951048/164775051-f564dc7e-a7f5-43e3-bc4a-2045840ce27c.png)
4. Install Nodejs on Ubuntu
![ubuntu](https://user-images.githubusercontent.com/43951048/164775112-6a46c0b7-54c7-437a-808c-a0c0587bb823.png)
5. Install Git and clone repository from GitHub
![git](https://user-images.githubusercontent.com/43951048/164775182-5c40df6b-d1f1-4986-b04c-89a6542929d0.png)
6. Start the node.js app
![runapp](https://user-images.githubusercontent.com/43951048/164775260-cf8d445b-0469-41d3-aeeb-ba9cc74d7de6.png)
7. Keep App running using PM2
![running](https://user-images.githubusercontent.com/43951048/164775298-220b0c2b-4333-4f7b-a942-f6b20eb3f9ed.png)

