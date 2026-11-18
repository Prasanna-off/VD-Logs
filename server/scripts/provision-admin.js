/**
 * Helper script to provision the first initial Admin account for VD Logs.
 * 
 * Usage:
 *   node scripts/provision-admin.js <admin_email> <password> "<Admin Full Name>"
 * 
 * Example:
 *   node scripts/provision-admin.js admin@vishvadaantrust.org AdminPass123! "Master Administrator"
 */

require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function provisionAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@vishvadaantrust.org';
  const password = args[1] || 'AdminPass123!';
  const displayName = args[2] || 'System Administrator';

  if (!supabaseAdmin) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required in server/.env to provision admin.');
    process.exit(1);
  }

  console.log(`[Provision Admin] Creating Supabase Auth user for: ${email}...`);

  // 1. Create or retrieve Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      role: 'admin'
    }
  });

  let userId;
  if (authError) {
    if (authError.message.includes('already exists') || authError.code === 'email_exists') {
      console.log('[Provision Admin] Auth user already exists. Fetching existing user ID...');
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = listData.users.find(u => u.email === email);
      if (!existing) throw new Error('Could not locate existing auth user.');
      userId = existing.id;
    } else {
      throw authError;
    }
  } else {
    userId = authData.user.id;
  }

  console.log(`[Provision Admin] Auth User ID: ${userId}`);

  // 2. Insert or update public.profiles record
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      role: 'admin',
      display_name: displayName,
      is_active: true,
      theme_preference: 'light'
    })
    .select()
    .single();

  if (profileError) {
    throw profileError;
  }

  console.log('---------------------------------------------------------');
  console.log('✔ Initial Admin account successfully provisioned!');
  console.log(`  Email: ${email}`);
  console.log(`  Role: ${profileData.role}`);
  console.log(`  Display Name: ${profileData.display_name}`);
  console.log('---------------------------------------------------------');
}

provisionAdmin().catch(err => {
  console.error('[Provision Admin Failed]:', err);
  process.exit(1);
});
