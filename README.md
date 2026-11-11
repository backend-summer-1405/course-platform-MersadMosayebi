# course-platform-backend_MM
course platform API, built with Node.js, Express, Typescript, and Postgresql Database.

-- user buy course,podcast with zarinpal or wallet.
-- users have dashboard which contain profile settings,wallet management and favorites and purchased course and podcast.
   and favorite news.
-- dashboard is diffrent for admin,teacher and user(default).
-- some courses and podcasts are free.
-- favorite,rate,comment and reply to comment in course,podcast and news.

# how work with docker:
 -- docker compose up -d --build (create container and start it with compose.yaml file you add in project)
 -- docker compose down (remove container which builded)
 -- docker compose stop and start (start and stop container)
 -- docker compose logs -f <sevice-name which is in compose.yaml> (show logs of container which is running)

databse-url : @127.0.0.1:5432 => port with id of wsl. 
databse-url : @db:5432 => port with sign of database in docker (when you run database with docker). 


# Technologies
 -- *node.js*
 -- *express* 
 -- *typescript*
 -- *nodemon*
 -- *tsx*
 -- *tsup*
 -- *dotenv*
 -- *prisma + postgresql*
 -- *express-validator*
 -- *JWT*
 -- *bcrypt*
 -- *nodemailer*
 -- *jalaali-js (DateFormat)*
 -- *multer*





