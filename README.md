# Joule interview

This repository aims to emulate a blog post application. It is imperfect on purpose, we'd like your comments on it !<br/>
Please see the exercise as if you joined a team that created this repository, which is now used like this in production. What would you do with it ?<br/>
<br/>
We would advise spending between 120 and 240 minutes on this exercise, and try answering the following questions: <br/>
-What good practices do you see that you would reuse on other NestJS projects ?<br/>
-What would you refactor in the code to improve its **quality** ?<br/>
-What would you bring to improve the **CI/CD** (in order to reduce the number of bugs in prod) ?<br/>
-What would you do to improve the **DevX** ?<br/>
-What would you do to improve the **security** of the application ?<br/>
-If you had to add a Commenting feature on articles, how would you do it ? (You should write code !)<br/><br/>
<i>It should meet the following requirements:</i>
<ul>
<li>When a user comments an article, the article author should receive an email.</li>
<li>Users can comment comments.</li>
<li>When a user comments a comment, the comment author should receive an email.</li>
<li>When a hateful comment is sent, it is caught and user receives a HTTP 400. (In the scope of this project just look for the "lame" keyword in a comment)</li>
<li>Add unit tests</li>
</ul>

# Install

```shell
yarn
```

# Run Project

Run project and database

```shell
yarn run project:local
```

Run migration and seed

```shell
yarn run migrate:local
```

## Login

To login on the app in the dev environment you can call the login endpoint with the credentials found in the `prisma/seed.ts` file,
and then use the `accessToken` provided as a Bearer Token. With swagger you can use this token to login.

# Test

```shell
# unit tests
yarn run test

# e2e tests
yarn run test:e2e
```

## API Reference

#### open http://localhost:3000/api for test api routes with swagger

## Tech Stack

**Back-end:** Docker - Jest- Postgres - Prisma - TS


## Author

- [@AntoineMezon](https://github.com/MezonAntoine)

