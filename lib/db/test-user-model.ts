/**
 * Test User Model
 * Simple test script to verify the users table and model functions
 */

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testUserModel() {
  // Import after env vars are loaded
  const { upsertUser, getUserById, getUserByEmail, deleteUser } = await import('./models/user');
  const { closePool } = await import('./db');

  try {
    console.log('🧪 Testing User Model...\n');

    // Test 1: Create a test user
    console.log('1️⃣ Testing upsertUser (create)...');
    const testUser = await upsertUser({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      email_verified: true,
    });
    console.log('✅ User created:', testUser);
    console.log('');

    // Test 2: Update the same user
    console.log('2️⃣ Testing upsertUser (update)...');
    const updatedUser = await upsertUser({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Updated Test User',
      image: 'https://example.com/new-avatar.jpg',
      email_verified: true,
    });
    console.log('✅ User updated:', {
      name: updatedUser.name,
      image: updatedUser.image
    });
    console.log('');

    // Test 3: Get user by ID
    console.log('3️⃣ Testing getUserById...');
    const userById = await getUserById('test-user-123');
    console.log('✅ Found user:', userById ? userById.email : 'Not found');
    console.log('');

    // Test 4: Get user by email
    console.log('4️⃣ Testing getUserByEmail...');
    const userByEmail = await getUserByEmail('test@example.com');
    console.log('✅ Found user:', userByEmail ? userByEmail.name : 'Not found');
    console.log('');

    // Test 5: Delete test user
    console.log('5️⃣ Testing deleteUser...');
    const deleted = await deleteUser('test-user-123');
    console.log('✅ User deleted:', deleted);
    console.log('');

    // Verify deletion
    const deletedUser = await getUserById('test-user-123');
    console.log('✅ Verify deletion:', deletedUser === null ? 'Success' : 'Failed');
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await closePool();
  }
}

// Run tests
testUserModel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
