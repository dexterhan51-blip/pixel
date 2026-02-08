const SYNC_QUEUE_KEY = 'pixel-tennis-sync-queue';

/**
 * Load sync queue from localStorage.
 */
export function loadSyncQueue() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Save sync queue to localStorage.
 */
export function saveSyncQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Add an operation to the sync queue.
 * @param {Array} queue - Current queue
 * @param {object} operation - { type: 'INSERT_LOG'|'UPDATE_LOG'|'DELETE_LOG'|'UPDATE_PROFILE', data: {...} }
 * @returns {Array} Updated queue
 */
export function enqueue(queue, operation) {
  const newQueue = [...queue, { ...operation, timestamp: Date.now() }];
  saveSyncQueue(newQueue);
  return newQueue;
}

/**
 * Flush the sync queue to Supabase.
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {Array} queue - Operations to flush
 * @returns {Promise<Array>} Remaining failed operations
 */
export async function flushQueue(supabase, userId, queue) {
  if (!userId || queue.length === 0) return queue;

  const failed = [];

  for (const op of queue) {
    try {
      let error;

      switch (op.type) {
        case 'INSERT_LOG':
        case 'UPDATE_LOG': {
          const result = await supabase
            .from('training_logs')
            .upsert({
              id: op.data.id,
              user_id: userId,
              date: op.data.date,
              type: op.data.type,
              duration: op.data.duration,
              satisfaction: op.data.satisfaction || 0,
              note: op.data.note || '',
              photo_url: op.data.photo_url || null,
              gained_stats: op.data.gainedStats || {},
              details: op.data.details || {},
              updated_at: new Date().toISOString(),
            });
          error = result.error;
          break;
        }

        case 'DELETE_LOG': {
          const result = await supabase
            .from('training_logs')
            .delete()
            .eq('id', op.data.id)
            .eq('user_id', userId);
          error = result.error;
          break;
        }

        case 'UPDATE_PROFILE': {
          const result = await supabase
            .from('profiles')
            .update({ ...op.data, updated_at: new Date().toISOString() })
            .eq('id', userId);
          error = result.error;
          break;
        }

        default:
          console.warn('Unknown sync operation type:', op.type);
      }

      if (error) {
        console.error('Sync error:', error);
        failed.push(op);
      }
    } catch (err) {
      console.error('Sync exception:', err);
      failed.push(op);
    }
  }

  saveSyncQueue(failed);
  return failed;
}
