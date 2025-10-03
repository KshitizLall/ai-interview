# Database Setup Guide

This guide will help you set up the MongoDB database for the AI Interview Prep application.

## Database Structure

The application uses MongoDB with the following collections:

### 1. `users` Collection
Stores user account information:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password_hash: String,
  tokens: [String],           // Active JWT tokens
  credits: Number,            // Available credits (default: 50)
  sessions: [String],         // Array of session IDs
  usage_stats: Object,        // Usage tracking
  created_at: Date,
  updated_at: Date
}
```

### 2. `interview_sessions` Collection
Stores interview preparation sessions:
```javascript
{
  _id: ObjectId,
  user_id: String,            // Reference to user
  company_name: String,
  job_title: String,
  resume_filename: String,
  resume_text: String,
  job_description: String,
  questions: [Question],      // Array of question objects
  answers: Object,            // Map of question_id -> answer
  created_at: Date,
  updated_at: Date,
  is_active: Boolean
}
```

## Setup Instructions

### Option 1: Quick Setup (Recommended)
Run the setup script to initialize everything:

```bash
cd backend
python setup.py
```

### Option 2: Manual Setup
1. **Initialize Database:**
   ```bash
   cd backend
   python db_cli.py init
   ```

2. **Create Test Data (Optional):**
   ```bash
   python db_cli.py sample
   ```

3. **Check Database Status:**
   ```bash
   python db_cli.py stats
   ```

## Database Management Commands

### Database CLI Tool (`db_cli.py`)

```bash
# Initialize database (create collections and indexes)
python db_cli.py init

# Show database statistics
python db_cli.py stats

# Test database connection
python db_cli.py test

# Create sample data for testing
python db_cli.py sample

# Reset database (⚠️ DELETES ALL DATA)
python db_cli.py reset
```

### Available Commands

- **`init`** - Create collections and indexes
- **`reset`** - Drop all collections (destructive!)
- **`stats`** - Show collection statistics
- **`test`** - Test database connection
- **`sample`** - Create sample data for testing

## MongoDB Configuration

The application connects to MongoDB Atlas using the connection string in `config.py`:

```python
MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### Database Indexes

The following indexes are created for optimal performance:

**Users Collection:**
- `email` (unique)
- `created_at`
- `tokens`

**Interview Sessions Collection:**
- `user_id`
- `user_id + is_active` (compound)
- `user_id + updated_at` (compound, descending)
- `user_id + company_name + job_title` (text search)
- `created_at`
- `updated_at`

## Environment Variables

Make sure these are set in your `.env` file:

```env
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

## Troubleshooting

### Connection Issues
1. **Check MongoDB URI**: Ensure the connection string is correct
2. **Network Access**: Verify your IP is whitelisted in MongoDB Atlas
3. **Credentials**: Confirm username/password are correct

### Common Errors

**"Authentication failed"**
- Check username and password in connection string
- Verify user has proper database permissions

**"Network timeout"**
- Check internet connection
- Verify MongoDB Atlas network access settings

**"Collection not found"**
- Run `python db_cli.py init` to create collections

### Getting Help

1. **Test Connection:**
   ```bash
   python db_cli.py test
   ```

2. **View Logs:**
   Check the application logs when starting the server

3. **Check Configuration:**
   Verify `config.py` has the correct MongoDB URI

## Sample Data

The `sample` command creates:
- Test user: `test@example.com` (password: `testpassword123`)
- Sample interview session with Google
- Sample questions and answers

This is useful for development and testing the application.

## Production Notes

- Change `JWT_SECRET_KEY` to a secure random string
- Set `DEBUG=False` in production
- Use environment variables for sensitive configuration
- Regularly backup your MongoDB database
- Monitor database performance and usage