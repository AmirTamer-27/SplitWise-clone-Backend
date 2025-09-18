This application simplifies expense tracking for groups, allowing users to create groups, add expenses, and settle debts with ease. It’s designed to make sure everyone gets paid back, without the awkward conversations.

Here’s a deep dive into the backend implementation:

Tech Stack: The application is built on a robust foundation of Node.js and Express.js, with a Prisma ORM managing the SQL Server database. This combination ensures a scalable and maintainable codebase.

User Authentication: Secure user authentication is handled with bcrypt for password hashing and express-session for session management, ensuring that user data remains protected.

Core Features:

Group Management: Users can create, read, update, and delete groups, and add or remove members.

Expense Tracking: The app allows for adding expenses with various split types, including equal, custom, and percentage-based splits.

Settlements: I’ve implemented a settlement algorithm to calculate who owes what to whom, minimizing the number of transactions required to clear all debts.

Database Schema: The database schema is designed to efficiently manage users, groups, expenses, and payments, with clear relationships between each entity.

API: The application exposes a comprehensive set of RESTful API endpoints for managing users, groups, expenses, and payments.
