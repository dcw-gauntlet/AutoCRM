| table_name  | column_name         | data_type                | is_nullable | column_default           |
| ----------- | ------------------- | ------------------------ | ----------- | ------------------------ |
| messages    | id                  | bigint                   | NO          |                          |
| messages    | created_at          | timestamp with time zone | NO          | now()                    |
| messages    | ticket_id           | bigint                   | YES         |                          |
| messages    | text                | text                     | YES         |                          |
| messages    | sender_id           | uuid                     | YES         |                          |
| messages    | updated_at          | timestamp with time zone | YES         |                          |
| messages    | message_type        | USER-DEFINED             | YES         |                          |
| tags        | id                  | bigint                   | NO          |                          |
| tags        | created_at          | timestamp with time zone | NO          | now()                    |
| tags        | tag                 | text                     | YES         |                          |
| test        | id                  | bigint                   | NO          |                          |
| test        | created_at          | timestamp with time zone | NO          | now()                    |
| test        | message             | text                     | YES         | 'Hello'::text            |
| ticket_tags | id                  | bigint                   | NO          |                          |
| ticket_tags | created_at          | timestamp with time zone | NO          | now()                    |
| ticket_tags | ticket_id           | bigint                   | NO          |                          |
| ticket_tags | tag_id              | bigint                   | NO          |                          |
| tickets     | id                  | bigint                   | NO          |                          |
| tickets     | created_at          | timestamp with time zone | NO          | now()                    |
| tickets     | updated_at          | timestamp with time zone | NO          | now()                    |
| tickets     | title               | text                     | NO          |                          |
| tickets     | description         | text                     | YES         |                          |
| tickets     | priority            | USER-DEFINED             | NO          | 'medium'::ticketpriority |
| tickets     | type                | USER-DEFINED             | NO          | 'inquiry'::tickettype    |
| tickets     | creator             | uuid                     | YES         |                          |
| tickets     | status              | USER-DEFINED             | YES         | 'open'::ticketstatus     |
| tickets     | assignee            | uuid                     | YES         |                          |
| users       | id                  | uuid                     | NO          |                          |
| users       | created_at          | timestamp with time zone | NO          | now()                    |
| users       | email               | text                     | YES         |                          |
| users       | first_name          | text                     | YES         |                          |
| users       | last_name           | text                     | YES         |                          |
| users       | role                | USER-DEFINED             | YES         |                          |
| users       | profile_picture_url | text                     | YES         |                          |
| users       | friendly_name       | text                     | YES         |                          |