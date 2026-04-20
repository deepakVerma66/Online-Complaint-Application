require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const councillorsData = require('./data/councillorsData');

const DEFAULT_COUNCILLOR_PASSWORD = 'Councillor@123';
const DEFAULT_DEPARTMENT_PASSWORD = 'Department@123';
const DEFAULT_MAYOR_PASSWORD = 'Mayor@123';

const departmentHeadData = {
  name: 'Arun Mehta',
  email: 'departmenthead@municipalcomplaints.com',
  password: DEFAULT_DEPARTMENT_PASSWORD,
  role: 'department',
  department: 'Municipal Complaint Department',
  isActive: true
};

const mayorData = {
  name: 'Jatinder Singh',
  email: 'mayor@municipalcomplaints.com',
  password: DEFAULT_MAYOR_PASSWORD,
  role: 'mayor',
  isActive: true
};

const removeBracketedText = (value) => value.replace(/\(.*?\)/g, ' ');

const removeHonorifics = (value) =>
  value.replace(/\b(smt|sh|dr)\.?\b/gi, ' ');

const slugifyName = (name) => {
  const normalized = removeHonorifics(removeBracketedText(name))
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, '');

  return normalized || 'councillor';
};

const buildCouncillorEmail = ({ name, ward }) => {
  return `${slugifyName(name)}${ward}@gmail.com`;
};

const buildCouncillorUsers = () => {
  return councillorsData.map((item) => ({
    name: item.name,
    email: buildCouncillorEmail(item),
    password: DEFAULT_COUNCILLOR_PASSWORD,
    role: 'counselor',
    ward: item.ward,
    isActive: true
  }));
};

const syncUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (!existingUser) {
    await User.create(payload);
    return 'created';
  }

  let didUpdate = false;

  const fieldsToSync = ['name', 'role', 'ward', 'department', 'isActive'];

  fieldsToSync.forEach((field) => {
    const nextValue = Object.prototype.hasOwnProperty.call(payload, field)
      ? payload[field]
      : undefined;
    const currentValue = existingUser[field];

    if (nextValue !== undefined && currentValue !== nextValue) {
      existingUser[field] = nextValue;
      didUpdate = true;
    }
  });

  const passwordMatches = await existingUser.comparePassword(payload.password);

  if (!passwordMatches) {
    existingUser.password = payload.password;
    didUpdate = true;
  }

  if (!didUpdate) {
    return 'skipped';
  }

  await existingUser.save();
  return 'updated';
};

const printSummary = (label, results) => {
  console.log(`\n${label}`);
  console.log(`Created: ${results.created}`);
  console.log(`Updated: ${results.updated}`);
  console.log(`Skipped: ${results.skipped}`);
};

const createCounter = () => ({
  created: 0,
  updated: 0,
  skipped: 0
});

const main = async () => {
  try {
    await connectDB();

    const councillorUsers = buildCouncillorUsers();
    const councillorResults = createCounter();
    const specialResults = createCounter();

    for (const userPayload of councillorUsers) {
      const result = await syncUser(userPayload);
      councillorResults[result] += 1;
      console.log(`[${result.toUpperCase()}] ${userPayload.role} -> ${userPayload.email}`);
    }

    for (const userPayload of [departmentHeadData, mayorData]) {
      const result = await syncUser(userPayload);
      specialResults[result] += 1;
      console.log(`[${result.toUpperCase()}] ${userPayload.role} -> ${userPayload.email}`);
    }

    printSummary('Councillor Seeding Summary', councillorResults);
    printSummary('Department + Mayor Summary', specialResults);

    console.log('\nDefault login credentials for development:');
    console.log(`Councillors (${councillorUsers.length} users): ${DEFAULT_COUNCILLOR_PASSWORD}`);
    console.log(`Department head: ${DEFAULT_DEPARTMENT_PASSWORD}`);
    console.log(`Mayor: ${DEFAULT_MAYOR_PASSWORD}`);

    console.log('\nSeeding completed successfully.');
  } catch (error) {
    console.error('Official user seeding failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

main();
