require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    message: 'Online Complaint Application backend is running.',
    phase: 'Phase 1',
    scope: 'Official user authentication foundation and database seeding'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  const isTooManyFilesError = error.code === 'LIMIT_FILE_COUNT';
  const isFileTooLargeError = error.code === 'LIMIT_FILE_SIZE';
  const isUploadValidationError = error.message === 'Only jpg, jpeg, png, and webp image files are allowed.';
  const statusCode = isTooManyFilesError || isFileTooLargeError || isUploadValidationError ? 400 : 500;
  let message = error.message || 'Something went wrong';

  if (isTooManyFilesError) {
    message = 'You can upload a maximum of 3 images.';
  }

  if (isFileTooLargeError) {
    message = 'Each image must be 5 MB or smaller.';
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
