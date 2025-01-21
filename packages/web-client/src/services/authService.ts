import supabase from '../supabase';

export async function validateInvite(email: string) {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('email', email)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return { isValid: false, invite: null };
  }

  return { isValid: true, invite: data };
}

export async function signUpWithInvite(email: string, password: string, fullName: string) {
  // First check for valid invite
  const { isValid, invite } = await validateInvite(email);
  
  if (!isValid || !invite) {
    return { 
      error: new Error('No valid invite found for this email address')
    };
  }

  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'CLIENT_CONTACT',
        client_id: invite.client_id,
        full_name: fullName
      }
    }
  });

  if (authError) {
    return { error: authError };
  }

  // Mark invite as used
  await supabase
    .from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id);

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      full_name: fullName,
      role: 'CLIENT_CONTACT',
      client_id: invite.client_id
    });

  if (profileError) {
    return { error: profileError };
  }

  return { data: authData, error: null };
} 