
-- Corrigir o usuário existente adicionando campos obrigatórios que estão NULL
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Buscar o ID do usuário existente
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'rogerio-projetos@sistema.com';

    -- Atualizar campos NULL que são obrigatórios
    UPDATE auth.users SET
        confirmation_token = '',
        confirmation_sent_at = COALESCE(confirmation_sent_at, now()),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        phone = COALESCE(phone, ''),
        phone_change = COALESCE(phone_change, ''),
        phone_change_token = COALESCE(phone_change_token, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
        reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE email = 'rogerio-projetos@sistema.com';

    -- Verificar se já existe identity, se não, criar
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = existing_user_id) THEN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            existing_user_id,
            format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}', existing_user_id::text, 'rogerio-projetos@sistema.com')::jsonb,
            'email',
            'rogerio-projetos@sistema.com',
            now(),
            now(),
            now()
        );
    END IF;

    -- Verificar se já existe profile, se não, criar
    INSERT INTO public.profiles (id, username, full_name, role)
    VALUES (existing_user_id, 'rogerio-projetos', 'Rogério Projetos', 'user')
    ON CONFLICT (id) DO UPDATE SET
        username = 'rogerio-projetos',
        full_name = 'Rogério Projetos',
        role = 'user';

    RAISE NOTICE 'Usuário corrigido com sucesso: %', existing_user_id;
    RAISE NOTICE 'Todos os campos obrigatórios foram preenchidos';
END $$;
