create or replace function public.force_remove_user(session_id_to_stop int)
returns json
language plpgsql
security definer
as $$
declare
  charger_id_to_free int;
  next_user_in_queue record;
begin
  -- Find the charger associated with the session
  select charger_id into charger_id_to_free
  from public.charging_sessions
  where id = session_id_to_stop and is_active = true;

  if charger_id_to_free is null then
    raise exception 'No active charging session found for the given ID.';
  end if;

  -- Deactivate the session
  update public.charging_sessions
  set is_active = false
  where id = session_id_to_stop;

  -- Free up the charger
  update public.chargers
  set is_occupied = false
  where id = charger_id_to_free;

  -- Check if there's a queue and start the next session for the next user in line
  select * into next_user_in_queue
  from public.queue
  order by created_at asc
  limit 1;

  if next_user_in_queue is not null then
    -- Remove from queue
    delete from public.queue where id = next_user_in_queue.id;

    -- Create a new charging session for the next user
    insert into public.charging_sessions (user_id, charger_id, charge_percentage_start, charge_percentage_target, is_active)
    values (next_user_in_queue.user_id, charger_id_to_free, next_user_in_queue.charge_percentage_start, next_user_in_queue.charge_percentage_target, true);

    -- Mark charger as occupied again
    update public.chargers
    set is_occupied = true
    where id = charger_id_to_free;
  end if;

  return json_build_object('status', 'success', 'message', 'User removed and charger state updated.');
end;
$$; 