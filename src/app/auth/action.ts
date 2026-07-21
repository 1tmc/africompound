// src/app/auth/action.ts
'use server'

import { createServerClient } from '@/lib/supabase/server';

/**
 * Onboarding process: Registers a new user, creates their profile,
 * and sets up their primary property/compound workspace.
 */
export async function processOnboarding(formData: FormData) {
  const supabase = createServerClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = formData.get('role') as string;

  const companyTitle = formData.get('companyTitle') as string;
  const location = formData.get('location') as string;

  console.log("================ 🔍 DEBUG START: ONBOARDING PROCESS ================");
  console.log("Onboarding Email:", email);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/api/auth/callback`,
    },
  });

  if (authError) {
    console.error("❌ Onboarding Auth Error:", authError.message);
    return { error: authError.message };
  }

  if (authData.user) {
    console.log("✅ Onboarding User Created:", authData.user.id);

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
        },
      ]);

    if (profileError) {
      console.error("❌ Profile Creation Error:", profileError.message);
      return { error: profileError.message };
    }

    if (role === 'host' && companyTitle) {
      console.log("Creating primary property workspace for Host...");
      
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([
          {
            host_id: authData.user.id,
            title: companyTitle,
            location: location,
            parent_property_id: null, // Marks this as the primary parent workspace
          },
        ])
        .select('subdomain_slug')
        .maybeSingle();

      if (propertyError) {
        console.error("❌ Property Insertion Error:", propertyError.message);
        return { error: propertyError.message };
      }

      if (!propertyData?.subdomain_slug) {
        console.error("❌ Workspace created, but no subdomain_slug returned.");
        return { error: "Workspace created, but failed to generate a custom URL." };
      }

      const isProd = process.env.NODE_ENV === 'production';
      const slug = propertyData.subdomain_slug;
      
      // Target: http://bismark-house.localhost:3000/owners/dashboard
      const url = isProd 
        ? `https://${slug}.africompound.vercel.app/owners/dashboard`
        : `http://${slug}.localhost:3000/owners/dashboard`;

      console.log("🚀 Redirecting onboarded host to absolute URL:", url);
      console.log("================ 🔍 DEBUG END: ONBOARDING SUCCESS ================");
      return { success: true, redirectUrl: url };
    }
  }

  return { success: "Account registered! Please check your inbox to confirm your email address." };
}

/**
 * Sign-in process: Authenticates credentials, pulls the main primary 
 * workspace, and generates the absolute subdomain path matching your layout.
 */
export async function processSignIn(formData: FormData) {
  const supabase = createServerClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log("================ 🔍 DEBUG START: SIGN-IN PROCESS ================");
  console.log("1. Form Email Submitted:", email);

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("❌ Auth Error:", signInError.message);
    return { error: signInError.message };
  }

  const userId = signInData?.user?.id;
  console.log("✅ Auth Success! User ID:", userId);

  // Query ONLY the primary parent workspace (where parent_property_id IS NULL)
  console.log("2. Querying 'properties' table for primary parent workspace...");
  const { data: propertyData, error: propertyError } = await supabase
    .from('properties')
    .select('subdomain_slug')
    .eq('host_id', userId)
    .is('parent_property_id', null) // Avoid secondary properties/compounds
    .maybeSingle(); // Prevents crashing with PGRST116 if zero rows are returned

  if (propertyError) {
    console.error("❌ Database Query Error Details:", propertyError.message);
    return { error: `Database error: [${propertyError.code}] ${propertyError.message}` };
  }

  // If no primary property row was found in the DB
  if (!propertyData) {
    console.warn("⚠️ No primary workspace found for user:", userId);
    return { error: 'No workspace found. Please complete your onboarding setup.' };
  }

  if (!propertyData.subdomain_slug) {
    console.warn("⚠️ Property row found, but 'subdomain_slug' is empty!");
    return { error: 'Your workspace setup is incomplete (subdomain slug is missing).' };
  }

  const isProd = process.env.NODE_ENV === 'production';
  const slug = propertyData.subdomain_slug;
  
  // Target: http://bismark-house.localhost:3000/owners/dashboard
  const url = isProd 
    ? `https://africompound.vercel.app/owners/${slug}/dashboard`
    : `http://localhost:3000/owners/${slug}/dashboard`;

  console.log("3. Redirection Targets Generated:");
  console.log("   - Target URL:", url);
  console.log("================ 🔍 DEBUG END: SIGN-IN SUCCESS ================");

  return { success: true, redirectUrl: url };
}