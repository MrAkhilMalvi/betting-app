--
-- PostgreSQL database dump
--

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.4

-- Started on 2026-05-16 11:17:23 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 26660)
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- TOC entry 3614 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- TOC entry 2 (class 3079 OID 25967)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3615 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 275 (class 1255 OID 35825)
-- Name: claim_welcome_bonus(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.claim_welcome_bonus(p_user_id uuid) RETURNS TABLE(balance numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_bonus_claimed BOOLEAN;
BEGIN
    -- lock user row
    SELECT u.bonus_claimed
    INTO v_bonus_claimed
    FROM users u
    WHERE u.id = p_user_id
    FOR UPDATE;

    -- user not found
    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND';
    END IF;

    -- already claimed
    IF v_bonus_claimed = TRUE THEN
        RAISE EXCEPTION 'BONUS_ALREADY_CLAIMED';
    END IF;

    -- add coins
    UPDATE wallets w
    SET balance = w.balance + 1000
    WHERE w.user_id = p_user_id;

    -- mark claimed
    UPDATE users u
    SET bonus_claimed = TRUE
    WHERE u.id = p_user_id;

    -- return updated balance
    RETURN QUERY
    SELECT w.balance
    FROM wallets w
    WHERE w.user_id = p_user_id;
END;
$$;


ALTER FUNCTION public.claim_welcome_bonus(p_user_id uuid) OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 26845)
-- Name: crash_game_round(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crash_game_round(p_round_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN

    UPDATE game_rounds
    SET
        status = 'crashed',
        crashed_at = NOW()
    WHERE id = p_round_id;

END;
$$;


ALTER FUNCTION public.crash_game_round(p_round_id uuid) OWNER TO postgres;

--
-- TOC entry 267 (class 1255 OID 26843)
-- Name: create_game_round(numeric, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_game_round(p_crash_point numeric, p_hash text, p_salt text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_round_id UUID;
BEGIN

    INSERT INTO game_rounds(
        crash_point,
        hash,
        salt,
        status,
        started_at
    )
    VALUES(
        p_crash_point,
        p_hash,
        p_salt,
        'running',
        NOW()
    )
    RETURNING id INTO v_round_id;

    RETURN v_round_id;

END;
$$;


ALTER FUNCTION public.create_game_round(p_crash_point numeric, p_hash text, p_salt text) OWNER TO postgres;

--
-- TOC entry 266 (class 1255 OID 26838)
-- Name: create_pool(text, numeric, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_pool(p_name text, p_entry_fee numeric, p_start_at timestamp without time zone, p_end_at timestamp without time zone) RETURNS TABLE(id integer, name text, entry_fee numeric, status text, start_at timestamp without time zone, end_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN

    RETURN QUERY
    INSERT INTO pools(
        name,
        type,
        entry_fee,
        status,
        start_at,
        end_at
    )
    VALUES(
        p_name,
        'lucky_draw',
        p_entry_fee,
        'active',
        p_start_at,
        p_end_at
    )
    RETURNING
        pools.id,
        pools.name,
        pools.entry_fee,
        pools.status,
        pools.start_at,
        pools.end_at;

END;
$$;


ALTER FUNCTION public.create_pool(p_name text, p_entry_fee numeric, p_start_at timestamp without time zone, p_end_at timestamp without time zone) OWNER TO postgres;

--
-- TOC entry 250 (class 1255 OID 26863)
-- Name: create_session(uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_session(p_user_id uuid, p_refresh_token text, p_user_agent text, p_ip text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN

    INSERT INTO sessions(
        user_id,
        refresh_token,
        user_agent,
        ip_address,
        expires_at
    )
    VALUES(
        p_user_id,
        p_refresh_token,
        p_user_agent,
        p_ip,
        NOW() + interval '7 days'
    );

END;
$$;


ALTER FUNCTION public.create_session(p_user_id uuid, p_refresh_token text, p_user_agent text, p_ip text) OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 26840)
-- Name: get_active_pool(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_active_pool() RETURNS TABLE(id uuid, name text, entry_fee numeric, total_pool numeric, end_at timestamp without time zone, status text, winner_id uuid, reward numeric, winner_name text)
    LANGUAGE sql
    AS $$
    SELECT
        p.id,
        p.name,
        p.entry_fee,
        p.total_pool,
        p.end_at,
        p.status,
        p.winner_id,
        p.reward,
        u.username AS winner_name
    FROM pools p
    LEFT JOIN users u
      ON u.id = p.winner_id
    WHERE p.status IN ('active', 'ended')
    ORDER BY p.created_at DESC
    LIMIT 1;
$$;


ALTER FUNCTION public.get_active_pool() OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 26844)
-- Name: get_round_seed(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_round_seed(p_round_id uuid) RETURNS text
    LANGUAGE sql
    AS $$
    SELECT salt
    FROM game_rounds
    WHERE id = p_round_id;
$$;


ALTER FUNCTION public.get_round_seed(p_round_id uuid) OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 27651)
-- Name: get_weekly_leaderboard(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_weekly_leaderboard(p_limit integer DEFAULT 10) RETURNS TABLE(user_id uuid, username text, balance numeric)
    LANGUAGE sql
    AS $$
    SELECT
        users.id,
        users.username,
        wallets.balance
    FROM wallets
    JOIN users
    ON users.id = wallets.user_id
    ORDER BY wallets.balance DESC
    LIMIT p_limit;
$$;


ALTER FUNCTION public.get_weekly_leaderboard(p_limit integer) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 26864)
-- Name: join_pool(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.join_pool(p_user_id uuid, p_pool_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_pool RECORD;
    v_balance NUMERIC;
BEGIN

    -- 🔒 Lock active pool
    SELECT *
    INTO v_pool
    FROM pools
    WHERE id = p_pool_id
    AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'POOL_NOT_ACTIVE';
    END IF;

    -- 🔒 Lock wallet
    SELECT balance
    INTO v_balance
    FROM wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'WALLET_NOT_FOUND';
    END IF;

    -- 💰 Check balance
    IF v_balance < v_pool.entry_fee THEN
        RAISE EXCEPTION 'INSUFFICIENT_COINS';
    END IF;

    -- 🚫 Prevent duplicate join
    IF EXISTS (
        SELECT 1
        FROM pool_entries
        WHERE user_id = p_user_id
        AND pool_id = p_pool_id
    ) THEN
        RAISE EXCEPTION 'ALREADY_JOINED';
    END IF;

    -- 💸 Deduct wallet
    UPDATE wallets
    SET balance = balance - v_pool.entry_fee
    WHERE user_id = p_user_id;

    -- 🧾 Log transaction
    INSERT INTO transactions(
        user_id,
        amount,
        type
    )
    VALUES(
        p_user_id,
        v_pool.entry_fee,
        'pool_entry'
    );

    -- 🎟️ Create entry
    INSERT INTO pool_entries(
        pool_id,
        user_id
    )
    VALUES(
        p_pool_id,
        p_user_id
    );

    -- 📈 Update pool total
    UPDATE pools
    SET total_pool = total_pool + v_pool.entry_fee
    WHERE id = p_pool_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Joined pool successfully'
    );

END;
$$;


ALTER FUNCTION public.join_pool(p_user_id uuid, p_pool_id integer) OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 26872)
-- Name: place_bet(uuid, numeric, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.place_bet(p_user_id uuid, p_amount numeric, p_round_id uuid) RETURNS TABLE(id uuid, user_id uuid, amount numeric, round_id uuid, status text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_balance NUMERIC;
BEGIN

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT';
    END IF;

    SELECT w.balance
    INTO v_balance
    FROM wallets w
    WHERE w.user_id = p_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'WALLET_NOT_FOUND';
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_BALANCE';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM bets b
        WHERE b.user_id = p_user_id
        AND b.round_id = p_round_id
    ) THEN
        RAISE EXCEPTION 'BET_ALREADY_EXISTS';
    END IF;

    UPDATE wallets w
    SET balance = w.balance - p_amount
    WHERE w.user_id = p_user_id;

    RETURN QUERY
    INSERT INTO bets(
        user_id,
        amount,
        round_id,
        status
    )
    VALUES(
        p_user_id,
        p_amount,
        p_round_id,
        'pending'
    )
    RETURNING
        bets.id,
        bets.user_id,
        bets.amount,
        bets.round_id,
        bets.status;

END;
$$;


ALTER FUNCTION public.place_bet(p_user_id uuid, p_amount numeric, p_round_id uuid) OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 26710)
-- Name: process_ended_pools(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_ended_pools() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    pool_record RECORD;
    selected_winner UUID;
    reward_amount BIGINT;
BEGIN

    FOR pool_record IN
        SELECT *
        FROM pools
        WHERE status = 'active'
        AND end_at AT TIME ZONE 'UTC' <= NOW() AT TIME ZONE 'UTC'
    LOOP

        -- pick random winner
        SELECT pe.user_id
        INTO selected_winner
        FROM pool_entries pe
        WHERE pe.pool_id = pool_record.id
        ORDER BY RANDOM()
        LIMIT 1;

        -- no entries
        IF selected_winner IS NULL THEN

            UPDATE pools
            SET status = 'ended'
            WHERE id = pool_record.id;

            CONTINUE;

        END IF;

        -- calculate reward
        reward_amount :=
            FLOOR(pool_record.total_pool * 0.8);

        -- update winner wallet
        UPDATE wallets
        SET balance = balance + reward_amount
        WHERE user_id = selected_winner;

        -- transaction log
        INSERT INTO transactions (
            user_id,
            amount,
            type,
            reference_id,
            created_at
        )
        VALUES (
            selected_winner,
            reward_amount,
            'pool_reward',
            pool_record.id,
            NOW()
        );

        -- update pool
        UPDATE pools
        SET
            status = 'ended',
            winner_id = selected_winner,
            reward = reward_amount
        WHERE id = pool_record.id;

        -- realtime notify
        PERFORM pg_notify(
            'pool_winner',
            json_build_object(
                'poolId', pool_record.id,
                'winnerId', selected_winner,
                'reward', reward_amount
            )::text
        );

    END LOOP;

END;
$$;


ALTER FUNCTION public.process_ended_pools() OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 35796)
-- Name: resolve_bet(uuid, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.resolve_bet(p_bet_id uuid, p_multiplier numeric) RETURNS TABLE(bet_id uuid, user_id uuid, payout numeric, status text)
    LANGUAGE plpgsql
    AS $$

DECLARE

    v_bet bets%ROWTYPE;

    v_payout NUMERIC;

BEGIN

    -- ======================================================
    -- LOCK BET
    -- ======================================================

    SELECT *
    INTO v_bet
    FROM bets b
    WHERE b.id = p_bet_id
    FOR UPDATE;

    -- ======================================================
    -- VALIDATE BET
    -- ======================================================

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BET_NOT_FOUND';
    END IF;

    -- ======================================================
    -- ALREADY RESOLVED
    -- ======================================================

    IF v_bet.status != 'pending' THEN
        RAISE EXCEPTION 'BET_ALREADY_RESOLVED';
    END IF;

    -- ======================================================
    -- CALCULATE PAYOUT
    -- ======================================================

    v_payout := ROUND(
        (
            v_bet.amount *
            p_multiplier
        )::numeric,
        2
    );

    -- ======================================================
    -- UPDATE WALLET
    -- ======================================================

    UPDATE wallets w
    SET balance = w.balance + v_payout
    WHERE w.user_id = v_bet.user_id;

    -- ======================================================
    -- UPDATE BET
    -- ======================================================

    UPDATE bets b
    SET
        status = 'won',

        cashout_multiplier =
            p_multiplier,

        payout = v_payout

    WHERE b.id = p_bet_id
    AND b.status = 'pending';

    -- ======================================================
    -- RETURN RESULT
    -- ======================================================

    RETURN QUERY
    SELECT
        v_bet.id,
        v_bet.user_id,
        v_payout,
        'won'::text;

END;

$$;


ALTER FUNCTION public.resolve_bet(p_bet_id uuid, p_multiplier numeric) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 26846)
-- Name: resolve_lost_bets(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.resolve_lost_bets(p_round_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_count INTEGER;
BEGIN

    UPDATE bets
    SET status = 'lost'
    WHERE round_id = p_round_id
    AND status = 'pending';

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN v_count;

END;
$$;


ALTER FUNCTION public.resolve_lost_bets(p_round_id uuid) OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 35815)
-- Name: signup_user(text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.signup_user(p_username text, p_email text, p_password text) RETURNS TABLE(id uuid, username text, email text)
    LANGUAGE plpgsql
    AS $$

DECLARE
    v_user_id UUID;

BEGIN

    -- normalize input
    p_username := LOWER(TRIM(p_username));
    p_email := LOWER(TRIM(p_email));

    -- validate username
    IF LENGTH(p_username) < 3 THEN
        RAISE EXCEPTION 'INVALID_USERNAME';
    END IF;

    -- validate email
    IF p_email NOT LIKE '%@%' THEN
        RAISE EXCEPTION 'INVALID_EMAIL';
    END IF;

    -- check existing user
    IF EXISTS (
        SELECT 1
        FROM users u
        WHERE u.username = p_username
           OR u.email = p_email
    ) THEN
        RAISE EXCEPTION 'USER_EXISTS';
    END IF;

    -- create user
    INSERT INTO users(
        username,
        email,
        password
    )
    VALUES(
        p_username,
        p_email,
        p_password
    )
    RETURNING users.id
    INTO v_user_id;

    -- create wallet
    INSERT INTO wallets(
        user_id,
        balance
    )
    VALUES(
        v_user_id,
        0
    );

    -- return user
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.email
    FROM users u
    WHERE u.id = v_user_id;

END;

$$;


ALTER FUNCTION public.signup_user(p_username text, p_email text, p_password text) OWNER TO postgres;

--
-- TOC entry 243 (class 1255 OID 26095)
-- Name: update_wallet_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_wallet_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_wallet_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 26043)
-- Name: bets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    round_id uuid,
    amount numeric(20,2) NOT NULL,
    cashout_multiplier double precision,
    payout bigint,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT bets_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT bets_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'won'::text, 'lost'::text])))
);


ALTER TABLE public.bets OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 26031)
-- Name: game_rounds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_rounds (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    crash_point double precision NOT NULL,
    hash text NOT NULL,
    salt text NOT NULL,
    status text NOT NULL,
    started_at timestamp without time zone,
    crashed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT game_rounds_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'running'::text, 'crashed'::text])))
);


ALTER TABLE public.game_rounds OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25978)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username text NOT NULL,
    email text,
    password text,
    google_id text,
    avatar text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    weekly_coins bigint DEFAULT 0 NOT NULL,
    total_coins_earned bigint DEFAULT 0 NOT NULL,
    bonus_claimed boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25996)
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    balance numeric(20,2) DEFAULT 1000 NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT wallets_balance_check CHECK ((balance >= (0)::numeric))
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 26807)
-- Name: leaderboard; Type: MATERIALIZED VIEW; Schema: public; Owner: postgres
--

CREATE MATERIALIZED VIEW public.leaderboard AS
 SELECT u.id,
    u.username,
    w.balance
   FROM (public.users u
     JOIN public.wallets w ON ((w.user_id = u.id)))
  ORDER BY w.balance DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.leaderboard OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 26112)
-- Name: pool_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.pool_entries
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pool_id uuid NOT NULL,
    user_id uuid NOT NULL,
    seat_number integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pool_entries_pkey PRIMARY KEY (id),
    CONSTRAINT unique_pool_user UNIQUE (pool_id, user_id),
    CONSTRAINT pool_entries_pool_id_fkey FOREIGN KEY (pool_id)
        REFERENCES public.pools (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT pool_entries_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)


ALTER TABLE public.pool_entries OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 26098)
-- Name: pools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.pools
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL DEFAULT 'lucky_draw'::text,
    entry_fee bigint NOT NULL,
    total_pool numeric(20,2) DEFAULT 0,
    max_winners integer DEFAULT 1,
    total_players integer DEFAULT 0,
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'upcoming'::text,
    start_at timestamp with time zone NOT NULL,
    lock_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    winner_id uuid,
    reward numeric(20,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pools_pkey PRIMARY KEY (id),
    CONSTRAINT fk_pool_winner FOREIGN KEY (winner_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT pools_entry_fee_check CHECK (entry_fee > 0),
    CONSTRAINT pools_status_check CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'locked'::text, 'drawing'::text, 'completed'::text, 'cancelled'::text]))
)


ALTER TABLE public.pools OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 26068)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    refresh_token text NOT NULL,
    user_agent text,
    ip_address text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 26013)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    amount numeric(20,2) NOT NULL,
    type text NOT NULL,
    reference_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['bet'::text, 'win'::text, 'loss'::text, 'refund'::text, 'bonus'::text, 'coin_earn'::text, 'pool_entry'::text, 'pool_reward'::text])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 3348 (class 0 OID 26663)
-- Dependencies: 229
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
1	* * * * *	SELECT process_ended_pools();	localhost	5432	betting-db	postgres	t	pool-winner-job
\.


--
-- TOC entry 3350 (class 0 OID 26682)
-- Dependencies: 231
-- Data for Name: job_run_details; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job_run_details (jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time) FROM stdin;
1	4067	1604	betting-db	postgres	SELECT process_ended_pools();	succeeded	1 row	2026-05-16 16:46:00.01109+05:30	2026-05-16 16:46:00.013337+05:30
1	4068	1620	betting-db	postgres	SELECT process_ended_pools();	succeeded	1 row	2026-05-16 16:47:00.018168+05:30	2026-05-16 16:47:00.024471+05:30
1	4066	1597	betting-db	postgres	SELECT process_ended_pools();	succeeded	1 row	2026-05-16 16:45:00.016188+05:30	2026-05-16 16:45:00.020545+05:30
\.


--
-- TOC entry 3604 (class 0 OID 26043)
-- Dependencies: 224
-- Data for Name: bets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bets (id, user_id, round_id, amount, cashout_multiplier, payout, status, created_at) FROM stdin;
\.


--
-- TOC entry 3603 (class 0 OID 26031)
-- Dependencies: 223
-- Data for Name: game_rounds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_rounds (id, crash_point, hash, salt, status, started_at, crashed_at, created_at) FROM stdin;
\.


--
-- TOC entry 3607 (class 0 OID 26112)
-- Dependencies: 227
-- Data for Name: pool_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pool_entries (id, pool_id, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 3606 (class 0 OID 26098)
-- Dependencies: 226
-- Data for Name: pools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pools (id, name, type, entry_fee, total_pool, max_winners, status, start_at, end_at, created_at, winner_id, reward) FROM stdin;
76f9b71f-71ca-44c6-969a-d932b43e830f	Mega Lucky Pool	lucky_draw	100	300.00	1	ended	2026-05-08 12:22:21.00248+05:30	2026-05-08 12:36:51.325016+05:30	2026-05-08 12:22:21.00248+05:30	\N	240.00
4bf02fdc-7b44-4e86-a055-ee8deeb5f87c	India Time Pool	lucky_draw	100	300.00	1	ended	2026-05-08 12:54:37.766289+05:30	2026-05-08 12:56:37.766289+05:30	2026-05-08 12:54:37.766289+05:30	\N	240.00
9b370cd7-bf46-4f95-b755-b6060915e6a3	🔥 3 Minute Mega Pool	lucky_draw	100	400.00	1	ended	2026-05-08 13:01:24.020109+05:30	2026-05-08 13:04:24.020109+05:30	2026-05-08 13:01:24.020109+05:30	\N	320.00
\.


--
-- TOC entry 3605 (class 0 OID 26068)
-- Dependencies: 225
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, refresh_token, user_agent, ip_address, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 3602 (class 0 OID 26013)
-- Dependencies: 222
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, amount, type, reference_id, created_at) FROM stdin;
\.


--
-- TOC entry 3600 (class 0 OID 25978)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, google_id, avatar, is_active, created_at, weekly_coins, total_coins_earned, bonus_claimed) FROM stdin;
\.


--
-- TOC entry 3601 (class 0 OID 25996)
-- Dependencies: 221
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (id, user_id, balance, updated_at) FROM stdin;
\.


--
-- TOC entry 3616 (class 0 OID 0)
-- Dependencies: 228
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.jobid_seq', 1, true);


--
-- TOC entry 3617 (class 0 OID 0)
-- Dependencies: 230
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.runid_seq', 4068, true);


--
-- TOC entry 3416 (class 2606 OID 26053)
-- Name: bets bets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_pkey PRIMARY KEY (id);


--
-- TOC entry 3412 (class 2606 OID 26040)
-- Name: game_rounds game_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_rounds
    ADD CONSTRAINT game_rounds_pkey PRIMARY KEY (id);


--
-- TOC entry 3436 (class 2606 OID 26118)
-- Name: pool_entries pool_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool_entries
    ADD CONSTRAINT pool_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3438 (class 2606 OID 26120)
-- Name: pool_entries pool_entries_pool_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool_entries
    ADD CONSTRAINT pool_entries_pool_id_user_id_key UNIQUE (pool_id, user_id);


--
-- TOC entry 3432 (class 2606 OID 26111)
-- Name: pools pools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pools
    ADD CONSTRAINT pools_pkey PRIMARY KEY (id);


--
-- TOC entry 3426 (class 2606 OID 26076)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3410 (class 2606 OID 26022)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3422 (class 2606 OID 26836)
-- Name: bets unique_user_round; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT unique_user_round UNIQUE (user_id, round_id);


--
-- TOC entry 3394 (class 2606 OID 25991)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3396 (class 2606 OID 25993)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 3398 (class 2606 OID 25987)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3400 (class 2606 OID 25989)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3403 (class 2606 OID 26004)
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- TOC entry 3405 (class 2606 OID 26006)
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- TOC entry 3417 (class 1259 OID 26065)
-- Name: idx_bets_round; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bets_round ON public.bets USING btree (round_id);


--
-- TOC entry 3418 (class 1259 OID 26066)
-- Name: idx_bets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bets_status ON public.bets USING btree (status);


--
-- TOC entry 3419 (class 1259 OID 26064)
-- Name: idx_bets_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bets_user ON public.bets USING btree (user_id);


--
-- TOC entry 3420 (class 1259 OID 26067)
-- Name: idx_bets_user_round; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bets_user_round ON public.bets USING btree (user_id, round_id);


--
-- TOC entry 3433 (class 1259 OID 26133)
-- Name: idx_pool_entries_pool; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pool_entries_pool ON public.pool_entries USING btree (pool_id);


--
-- TOC entry 3434 (class 1259 OID 26134)
-- Name: idx_pool_entries_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pool_entries_user ON public.pool_entries USING btree (user_id);


--
-- TOC entry 3427 (class 1259 OID 26131)
-- Name: idx_pool_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pool_status ON public.pools USING btree (status);


--
-- TOC entry 3428 (class 1259 OID 26741)
-- Name: idx_pool_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pool_time ON public.pools USING btree (start_at, end_at);


--
-- TOC entry 3429 (class 1259 OID 26740)
-- Name: idx_pools_end_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pools_end_at ON public.pools USING btree (end_at);


--
-- TOC entry 3430 (class 1259 OID 26719)
-- Name: idx_pools_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pools_status ON public.pools USING btree (status);


--
-- TOC entry 3413 (class 1259 OID 26042)
-- Name: idx_round_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_round_created ON public.game_rounds USING btree (created_at DESC);


--
-- TOC entry 3414 (class 1259 OID 26041)
-- Name: idx_round_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_round_status ON public.game_rounds USING btree (status);


--
-- TOC entry 3423 (class 1259 OID 26083)
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_token ON public.sessions USING btree (refresh_token);


--
-- TOC entry 3424 (class 1259 OID 26082)
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id);


--
-- TOC entry 3406 (class 1259 OID 26030)
-- Name: idx_transactions_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_created ON public.transactions USING btree (created_at DESC);


--
-- TOC entry 3407 (class 1259 OID 26029)
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);


--
-- TOC entry 3408 (class 1259 OID 26028)
-- Name: idx_transactions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_user ON public.transactions USING btree (user_id);


--
-- TOC entry 3391 (class 1259 OID 25995)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3392 (class 1259 OID 25994)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3401 (class 1259 OID 26012)
-- Name: idx_wallet_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_user ON public.wallets USING btree (user_id);


--
-- TOC entry 3453 (class 2620 OID 26096)
-- Name: wallets trg_wallet_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_wallet_updated BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_wallet_timestamp();


--
-- TOC entry 3447 (class 2606 OID 26059)
-- Name: bets bets_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.game_rounds(id);


--
-- TOC entry 3448 (class 2606 OID 26054)
-- Name: bets bets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bets
    ADD CONSTRAINT bets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3450 (class 2606 OID 26714)
-- Name: pools fk_pool_winner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pools
    ADD CONSTRAINT fk_pool_winner FOREIGN KEY (winner_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3451 (class 2606 OID 26121)
-- Name: pool_entries pool_entries_pool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool_entries
    ADD CONSTRAINT pool_entries_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES public.pools(id) ON DELETE CASCADE;


--
-- TOC entry 3452 (class 2606 OID 26126)
-- Name: pool_entries pool_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool_entries
    ADD CONSTRAINT pool_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3449 (class 2606 OID 26077)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3446 (class 2606 OID 26023)
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3445 (class 2606 OID 26007)
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3608 (class 0 OID 26807)
-- Dependencies: 232 3610
-- Name: leaderboard; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: postgres
--

REFRESH MATERIALIZED VIEW public.leaderboard;


-- Completed on 2026-05-16 11:17:23 UTC

--
-- PostgreSQL database dump complete
--

