const STORAGE_KEY = 'pixel-tennis-data-v1';
const MIGRATED_KEY = 'pixel-tennis-migrated';
const BATCH_SIZE = 50;

/**
 * Check if there's local data to migrate.
 */
export function hasLocalDataToMigrate() {
  if (localStorage.getItem(MIGRATED_KEY)) return false;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;

  try {
    const data = JSON.parse(saved);
    return data.logs && data.logs.length > 0;
  } catch {
    return false;
  }
}

/**
 * Migrate localStorage data to Supabase.
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {object} localData - Parsed localStorage data
 * @param {function} onProgress - Progress callback (current, total)
 * @returns {Promise<{ success: boolean, migrated: number, errors: number }>}
 */
export async function migrateToSupabase(supabase, userId, localData, onProgress) {
  const logs = localData.logs || [];
  const total = logs.length;
  let migrated = 0;
  let errors = 0;

  // Update profile first
  try {
    await supabase
      .from('profiles')
      .update({
        profile_name: localData.profileName || '',
        gear_color: localData.gearColor || '#2a9d8f',
        level: localData.level || 1,
        exp: localData.exp || 0,
        stats: localData.stats || { forehand: 1, backhand: 1, serve: 1, volley: 1, footwork: 1, mental: 1 },
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (err) {
    console.error('Profile migration error:', err);
  }

  // Batch upsert logs
  for (let i = 0; i < logs.length; i += BATCH_SIZE) {
    const batch = logs.slice(i, i + BATCH_SIZE);

    const rows = batch.map(log => ({
      id: log.id || crypto.randomUUID(),
      user_id: userId,
      date: log.date,
      type: log.type,
      duration: log.duration,
      satisfaction: log.satisfaction || 0,
      note: log.note || '',
      photo_url: null, // Photos will be handled separately
      gained_stats: log.gainedStats || {},
      details: log.details || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase
        .from('training_logs')
        .upsert(rows);

      if (error) {
        console.error('Log migration batch error:', error);
        errors += batch.length;
      } else {
        migrated += batch.length;
      }
    } catch (err) {
      console.error('Log migration batch exception:', err);
      errors += batch.length;
    }

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, total), total);
    }
  }

  // Mark as migrated
  localStorage.setItem(MIGRATED_KEY, new Date().toISOString());

  return { success: errors === 0, migrated, errors };
}
