import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Plan from './models/Plan.js';

dotenv.config({ path: './server/.env' });

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Plan.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@fitsphere.com',
    password: 'admin123',
    phone: '9999999999',
    role: 'admin',
    gender: 'male',
  });
  console.log('Admin created:', admin.email);

  // Create trainers
  const trainer1 = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@fitsphere.com',
    password: 'trainer123',
    phone: '9876543210',
    role: 'trainer',
    gender: 'male',
    specialization: 'Weight Training',
    experience: 5,
    certification: 'ACE Certified',
    dailyRate: 1200,
  });
  const trainer2 = await User.create({
    name: 'Priya Singh',
    email: 'priya@fitsphere.com',
    password: 'trainer123',
    phone: '9876543211',
    role: 'trainer',
    gender: 'female',
    specialization: 'Yoga & Cardio',
    experience: 3,
    certification: 'ISSA Certified',
    dailyRate: 1000,
  });
  console.log('Trainers created');

  // Create members
  await User.create({
    name: 'Vansh Member',
    email: 'vansh@fitsphere.com',
    password: 'member123',
    phone: '9988776655',
    role: 'member',
    gender: 'male',
    age: 22,
    height: 175,
    weight: 70,
    assignedTrainer: trainer1._id,
  });
  await User.create({
    name: 'Anjali Verma',
    email: 'anjali@fitsphere.com',
    password: 'member123',
    phone: '9988776656',
    role: 'member',
    gender: 'female',
    age: 25,
    height: 162,
    weight: 55,
    assignedTrainer: trainer2._id,
  });
  console.log('Members created');

  // Create plans
  await Plan.create([
    { name: 'Basic', duration: 1, price: 999, features: ['Gym Access', 'Locker Room', 'Basic Equipment'], status: 'active' },
    { name: 'Standard', duration: 3, price: 2499, features: ['Gym Access', 'Locker Room', 'All Equipment', 'Group Classes'], status: 'active' },
    { name: 'Premium', duration: 6, price: 4499, features: ['Gym Access', 'Locker Room', 'All Equipment', 'Group Classes', 'Personal Trainer', 'Diet Plan'], status: 'active' },
    { name: 'Elite', duration: 12, price: 7999, features: ['Gym Access', 'Locker Room', 'All Equipment', 'Group Classes', 'Personal Trainer', 'Diet Plan', 'Spa Access', 'Priority Booking'], status: 'active' },
  ]);
  console.log('Plans created');

  console.log('\n--- Login Credentials ---');
  console.log('Admin:   admin@fitsphere.com / admin123');
  console.log('Trainer: rahul@fitsphere.com / trainer123');
  console.log('Trainer: priya@fitsphere.com / trainer123');
  console.log('Member:  vansh@fitsphere.com / member123');
  console.log('Member:  anjali@fitsphere.com / member123');

  await mongoose.disconnect();
  console.log('Seed complete!');
};

seed().catch(console.error);
