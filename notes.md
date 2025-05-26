## Sentry
Sentry is a error reporting tool
- create a project in the website Sentry.io and copy the command to get started 
- select options as needed, I did all defaults
- copy the KEY into your .ENV file
``` npx @sentry/wizard@latest -i nextjs --saas --org self-rbs --project project-name ```

## NEON DB
Neon is a DB service in the cloud with a free tier, good for testing projects
- create an account and a project
- click connect from the project dashboard
- copy your url into the .ENV file
` postgresql://neondb_owner:PASSWORD@ep-floral-resonance-a4hnw459-pooler.us-east-1.aws.neon.tech/guava-tickets-db?sslmode=require `

## PRISMA
Prisma is an ORM, easy to use with Next and easy to hook up with other tools
- run ` npx prisma init ` to run the base config, this will create the ` schema ` file
- in the schema file, you can now create the models (tables) of your DB
- once you have the start schema you can run your first migration
-- every time you update this file, you need to run a new migration
-- ` npx prisma migrate dev --name some_name `
-- ` npx prisma generate ` 
-- in package.json, add a post install script for when deploying ` "postinstall": "prisma generate" `
-- prisma has a visual tool that can be run from terminal if needed and it will open on browser ` npx prisma studio `
-- create a ` prisma.ts/js ` file with the config, see docs for it. 

## SONNER
Sonner is a toast notification package, just to have some of those around. 
- import it in the main layout and use as needed throughout
