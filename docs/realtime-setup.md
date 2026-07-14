# Realtime Setup — InsForge

## Database Triggers Required

For realtime to work, you need to create triggers in your InsForge database that publish changes to the realtime channels.

### 1. Create Channel Patterns

```sql
-- Enable realtime for asistencias table
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES
  ('asistencias:ficha:%', 'Attendance changes per ficha', true)
ON CONFLICT (pattern) DO NOTHING;
```

### 2. Create Trigger Function

```sql
CREATE OR REPLACE FUNCTION notify_asistencia_realtime()
RETURNS TRIGGER AS $$
DECLARE
  ficha_id INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    ficha_id := OLD.ficha;
  ELSE
    ficha_id := NEW.ficha;
  END IF;

  PERFORM realtime.publish(
    'asistencias:ficha:' || ficha_id::text,
    'postgres_changes',
    jsonb_build_object(
      'eventType', TG_OP,
      'new', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
      'old', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Create Trigger

```sql
CREATE TRIGGER asistencia_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON asistencias
  FOR EACH ROW
  EXECUTE FUNCTION notify_asistencia_realtime();
```

### 4. Enable RLS (Optional but Recommended)

```sql
ALTER TABLE realtime.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to subscribe to channels
CREATE POLICY "allow_subscribe_asistencias"
ON realtime.channels
FOR SELECT
TO authenticated
USING (
  pattern LIKE 'asistencias:ficha:%'
);

-- Allow authenticated users to publish to channels
CREATE POLICY "allow_publish_asistencias"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  channel_name LIKE 'asistencias:ficha:%'
);
```

## Frontend Integration

The realtime hook is already implemented in `src/shared/hooks/useRealtime.ts`:

```typescript
import { useRealtimeAsistencias } from '@/shared/hooks/useRealtime'

// In your component
useRealtimeAsistencias(ficha, (payload) => {
  if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
    // Handle new or updated attendance
  } else if (payload.eventType === 'DELETE') {
    // Handle deleted attendance
  }
})
```

## Testing

1. Open the app in two browser tabs
2. Mark attendance in one tab
3. The other tab should update automatically in real-time

## Troubleshooting

- Ensure `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` are set correctly
- Check browser console for WebSocket connection errors
- Verify channel patterns match in both SQL and frontend code
- Ensure RLS policies allow subscription to the channels
