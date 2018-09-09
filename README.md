# ViaFlow - Agent
Cronflow backend - Make pipeline cron job easier and amazing.

This is the agent of ViaFlow server. Execute triggered cron job.

# Demo start compose file:

```yaml
version: '3'
services:
  cronflow:
    restart: "no"
    build: .
    volumes:
      - "./:/cronflow"
    working_dir: /cronflow
    command: "npm run dev"
    environment:
      - PORT=8080
      - DATABASE_DIALECT=mysql
      - DATABASE_HOST=Mysql host
      - DATABASE_PORT=Mysql port
      - DATABASE_USERNAME=mysql user
      - DATABASE_NAME=database name
      - DATABASE_PASSWORD=mysql password
      - REDIS_HOST=redis host
      - REDIS_PORT=redis port
      - REDIS_AUTH=redis auth
      - REDIS_DB=default redis db
      - NPM_REGISTRY_TAOBAO=true
```