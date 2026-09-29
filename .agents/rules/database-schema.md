# Database Schema: SkillPath AI (MongoDB / Mongoose)

## Core Collections

### 1. User
- `_id`: ObjectId
- `email`: String (Unique)
- `passwordHash`: String
- `role`: Enum ['STUDENT', 'ALUMNI', 'ADMIN']
- `firstName`: String
- `lastName`: String
- `createdAt`, `updatedAt`: Date

### 2. StudentProfile
- `userId`: ObjectId (Ref: User)
- `targetRole`: ObjectId (Ref: JobRole)
- `targetCompany`: ObjectId (Ref: Company)
- `careerReadinessScore`: Number (0-100)
- `resumeUrl`: String
- `education`: Array of objects (degree, institution, year)

### 3. AlumniProfile
- `userId`: ObjectId (Ref: User)
- `company`: ObjectId (Ref: Company)
- `jobRole`: ObjectId (Ref: JobRole)
- `graduationYear`: Number
- `branch`: String
- `experienceYears`: Number
- `isAvailableForMentoring`: Boolean
- `guidanceTopics`: Array of Strings
- `bio`: String

### 4. Company
- `_id`: ObjectId
- `name`: String (e.g., "Google")
- `description`: String
- `logoUrl`: String

### 5. JobRole
- `_id`: ObjectId
- `companyId`: ObjectId (Ref: Company) (Optional, for generic roles)
- `title`: String (e.g., "Software Engineer")
- `description`: String

### 6. Skill
- `_id`: ObjectId
- `name`: String (e.g., "Data Structures")
- `category`: Enum ['TECHNICAL', 'SOFT']
- `description`: String

### 7. RoleSkillRequirement
- `roleId`: ObjectId (Ref: JobRole)
- `skillId`: ObjectId (Ref: Skill)
- `importance`: Enum ['CRITICAL', 'IMPORTANT', 'MEDIUM', 'OPTIONAL']
- `minimumProficiency`: Number (0-100)
- `weight`: Number

### 8. StudentSkill
- `studentId`: ObjectId (Ref: StudentProfile)
- `skillId`: ObjectId (Ref: Skill)
- `proficiency`: Number (0-100)
- `confidenceScore`: Number (0-100)
- `source`: Enum ['SELF_DECLARED', 'ASSESSMENT', 'RESUME', 'VERIFIED']

### 9. LearningResource
- `_id`: ObjectId
- `title`: String
- `provider`: String
- `url`: String
- `skillId`: ObjectId (Ref: Skill)
- `difficulty`: Enum ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
- `type`: Enum ['VIDEO', 'COURSE', 'ARTICLE', 'DOCUMENTATION']
- `durationMinutes`: Number

### 10. Assessment & Questions
- `Question`: (skillId, questionText, options, correctAnswer, difficulty)
- `Assessment`: (studentId, title, questions[], score, timestamp)

### 11. MentorshipRequest
- `studentId`: ObjectId (Ref: User)
- `alumniId`: ObjectId (Ref: User)
- `topic`: String
- `message`: String
- `status`: Enum ['PENDING', 'ACCEPTED', 'REJECTED']
- `createdAt`: Date
