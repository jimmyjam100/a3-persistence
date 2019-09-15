## Food You Eat

https://a3-jamesscherick.glitch.me

![What the website looks like after logging in](https://github.com/jimmyjam100/a3-persistence/blob/master/image.PNG)

The goal of this application is to have a place where everyone can have a personal list of all of the different types of food they eat so they can keep track of their diet.
To log in enter any unused username to create a new account, or use an existing username and password.
It took me many many hours to figure out how the authentification process worked. I would redirect to the home page and then be redirected right back because the login session did not save. Turned out I needed to add more middleware that I did not know about.
The authentification stratagy I used was just local, and for database I ended up just writing and reading from a json file for my database. That is bassically what lowDB does and I am more comfturable doing it like this.
I chose to use the pure css framework. I feel like its style really fit my theme of just a place you can list things without being to fancy or anything. It just felt clean. I also like how they do tables
I used passport, morgan, session, body-parser, and express-uncapitalize.
passport is used for authenticating users and creating a login system.
morgan is used for logging any get and post request that are made to the server. Used for debugging
session stores your login information for the duration of the session.
express-uncapitalize uncapitalizes any url you have by redirecting you to the url that is not capitalized

NOTE FOR GRADER: Figuring out the login system took me a lot longer than I though it would. So I ended up having to copy and paste some code from project 2 to make it in time. I greatly apologize for this and am willing to accept any peneltys towrds my grade because of this. I will plan on doing better in the future.

### Design/Evaluation Achievements
- **Design Achievement 2**: There are no `<div>` or `<span>` elements in my document.
