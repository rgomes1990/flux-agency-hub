
-- Criar o usuário corrigindo o campo provider_id obrigatório
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Inserir o usuário na tabela auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'rogerio-projetos@sistema.com',
        crypt('Rsg@9090', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"username": "rogerio-projetos"}',
        false,
        now(),
        now()
    )
    RETURNING id INTO new_user_id;

    -- Inserir na tabela identities com provider_id corrigido
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
        new_user_id,
        format('{"sub":"%s","email":"%s"}', new_user_id::text, 'rogerio-projetos@sistema.com')::jsonb,
        'email',
        'rogerio-projetos@sistema.com',
        now(),
        now(),
        now()
    );

    RAISE NOTICE 'Usuário criado com sucesso: %', new_user_id;
END $$;
