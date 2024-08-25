SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.account (
    is_enabled boolean NOT NULL,
    update_counter integer NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    version bigint NOT NULL,
    username character varying(16) NOT NULL,
    first_name character varying(32) NOT NULL,
    last_name character varying(32) NOT NULL,
    created_by character varying(255),
    email character varying(255) NOT NULL,
    language character varying(255) NOT NULL,
    last_modified_by character varying(255),
    roles character varying(255)[] NOT NULL,
    CONSTRAINT account_language_check CHECK (((language)::text = ANY ((ARRAY['EN'::character varying, 'PL'::character varying])::text[])))
);


ALTER TABLE public.account OWNER TO sf;

CREATE TABLE public.account_fav_categories (
    account_id bigint NOT NULL,
    fav_categories character varying(255) NOT NULL,
    CONSTRAINT account_fav_categories_fav_categories_check CHECK (((fav_categories)::text = ANY ((ARRAY['VEGETABLES'::character varying, 'FRUITS'::character varying, 'DAIRY'::character varying, 'MEAT'::character varying, 'FISH'::character varying, 'GRAIN_PRODUCTS'::character varying, 'PROCESSED_FOODS'::character varying])::text[])))
);


ALTER TABLE public.account_fav_categories OWNER TO sf;

CREATE TABLE public.account_fav_social_fridges (
    account_id bigint NOT NULL,
    fav_social_fridges_id bigint NOT NULL
);


ALTER TABLE public.account_fav_social_fridges OWNER TO sf;

CREATE SEQUENCE public.account_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.account_seq OWNER TO sf;

CREATE TABLE public.address (
    postal_code character varying(6) NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    version bigint NOT NULL,
    city character varying(64) NOT NULL,
    street character varying(64) NOT NULL,
    building_number character varying(255) NOT NULL,
    created_by character varying(255),
    last_modified_by character varying(255),
    latitude character varying(255) NOT NULL,
    longitude character varying(255) NOT NULL
);


ALTER TABLE public.address OWNER TO sf;

CREATE SEQUENCE public.address_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.address_seq OWNER TO sf;

CREATE TABLE public.grade (
    rating real NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    version bigint NOT NULL,
    created_by character varying(255),
    last_modified_by character varying(255),
    CONSTRAINT grade_rating_check CHECK (((rating <= (5)::double precision) AND (rating >= (0)::double precision)))
);


ALTER TABLE public.grade OWNER TO sf;

CREATE SEQUENCE public.grade_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.grade_seq OWNER TO sf;

CREATE TABLE public.product (
    size double precision NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    expiration_date timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    social_fridge_id bigint NOT NULL,
    version bigint NOT NULL,
    title character varying(100) NOT NULL,
    description character varying(2000) NOT NULL,
    created_by character varying(255),
    image character varying(255),
    last_modified_by character varying(255),
    product_unit character varying(255) NOT NULL,
    state character varying(255),
    CONSTRAINT product_product_unit_check CHECK (((product_unit)::text = ANY ((ARRAY['KILOGRAMS'::character varying, 'LITERS'::character varying])::text[]))),
    CONSTRAINT product_state_check CHECK (((state)::text = ANY ((ARRAY['ARCHIVED_BY_SYSTEM'::character varying, 'ARCHIVED_BY_USER'::character varying, 'AVAILABLE'::character varying])::text[])))
);

ALTER TABLE public.product OWNER TO sf;

CREATE TABLE public.product_categories (
    product_id bigint NOT NULL,
    categories character varying(255) NOT NULL,
    CONSTRAINT product_categories_categories_check CHECK (((categories)::text = ANY ((ARRAY['VEGETABLES'::character varying, 'FRUITS'::character varying, 'DAIRY'::character varying, 'MEAT'::character varying, 'FISH'::character varying, 'GRAIN_PRODUCTS'::character varying, 'PROCESSED_FOODS'::character varying])::text[])))
);


ALTER TABLE public.product_categories OWNER TO sf;

CREATE SEQUENCE public.product_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_seq OWNER TO sf;

CREATE TABLE public.social_fridge (
    account_id bigint NOT NULL,
    address_id bigint NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    social_fridge_average_rating_id bigint NOT NULL,
    version bigint NOT NULL,
    created_by character varying(255),
    last_modified_by character varying(255),
    state character varying(255) NOT NULL,
    CONSTRAINT social_fridge_state_check CHECK (((state)::text = ANY ((ARRAY['ARCHIVED'::character varying, 'ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);


ALTER TABLE public.social_fridge OWNER TO sf;

CREATE TABLE public.social_fridge_average_rating (
    average_rating real NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    version bigint NOT NULL,
    created_by character varying(255),
    last_modified_by character varying(255),
    CONSTRAINT social_fridge_average_rating_average_rating_check CHECK (((average_rating <= (5)::double precision) AND (average_rating >= (0)::double precision)))
);

ALTER TABLE public.social_fridge_average_rating OWNER TO sf;

CREATE SEQUENCE public.social_fridge_average_rating_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.social_fridge_average_rating_seq OWNER TO sf;

CREATE TABLE public.social_fridge_grades (
    grades_id bigint NOT NULL,
    social_fridge_id bigint NOT NULL
);

ALTER TABLE public.social_fridge_grades OWNER TO sf;

CREATE SEQUENCE public.social_fridge_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.social_fridge_seq OWNER TO sf;

CREATE TABLE public.suggestion (
    is_new boolean NOT NULL,
    creation_date_time timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    last_modification_date_time timestamp(6) without time zone,
    social_fridge_id bigint NOT NULL,
    version bigint NOT NULL,
    description character varying(2000) NOT NULL,
    created_by character varying(255),
    image character varying(255),
    last_modified_by character varying(255)
);

ALTER TABLE public.suggestion OWNER TO sf;

CREATE SEQUENCE public.suggestion_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.suggestion_seq OWNER TO sf;

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);

ALTER TABLE ONLY public.account_fav_categories
    ADD CONSTRAINT account_fav_categories_pkey PRIMARY KEY (account_id, fav_categories);

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT grade_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, categories);

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.social_fridge
    ADD CONSTRAINT social_fridge_address_id_key UNIQUE (address_id);

ALTER TABLE ONLY public.social_fridge_average_rating
    ADD CONSTRAINT social_fridge_average_rating_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.social_fridge_grades
    ADD CONSTRAINT social_fridge_grades_grades_id_key UNIQUE (grades_id);

ALTER TABLE ONLY public.social_fridge
    ADD CONSTRAINT social_fridge_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.social_fridge
    ADD CONSTRAINT social_fridge_social_fridge_average_rating_id_key UNIQUE (social_fridge_average_rating_id);

ALTER TABLE ONLY public.suggestion
    ADD CONSTRAINT suggestion_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.suggestion
    ADD CONSTRAINT fk2xbb86y423rmrsxen9v1h1ujl FOREIGN KEY (social_fridge_id) REFERENCES public.social_fridge(id);

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT fk49lcvnxvfw1kq1uf7ojaqigov FOREIGN KEY (product_id) REFERENCES public.product(id);

ALTER TABLE ONLY public.social_fridge_grades
    ADD CONSTRAINT fk5p0py9ol48tfntsxobo7hccao FOREIGN KEY (social_fridge_id) REFERENCES public.social_fridge(id);

ALTER TABLE ONLY public.product
    ADD CONSTRAINT fk6guy49bufxetg2l0p3d4vow2u FOREIGN KEY (social_fridge_id) REFERENCES public.social_fridge(id);

ALTER TABLE ONLY public.account_fav_social_fridges
    ADD CONSTRAINT fk8g2bxed0uyeulhmx3p0f2u8rr FOREIGN KEY (fav_social_fridges_id) REFERENCES public.social_fridge(id);

ALTER TABLE ONLY public.social_fridge
    ADD CONSTRAINT fkcc3pdnaweflfi6vbhmo0txdkj FOREIGN KEY (address_id) REFERENCES public.address(id);

ALTER TABLE ONLY public.account_fav_categories
    ADD CONSTRAINT fkf7c9k29bwsag73qfxrifmvg00 FOREIGN KEY (account_id) REFERENCES public.account(id);

ALTER TABLE ONLY public.account_fav_social_fridges
    ADD CONSTRAINT fkg7xa9jnm6vli9wwwebfivnmnq FOREIGN KEY (account_id) REFERENCES public.account(id);

ALTER TABLE ONLY public.social_fridge
    ADD CONSTRAINT fkkrodwng0vgelrdf2mxue2k9vk FOREIGN KEY (account_id) REFERENCES public.account(id);

ALTER TABLE ONLY public.social_fridge_grades
    ADD CONSTRAINT fklnhn4iyisic6d04lipn52jkg2 FOREIGN KEY (grades_id) REFERENCES public.grade(id);

ALTER TABLE ONLY public.social_fridge
    ADD CONSTRAINT fkpocqxatc7sh3dijnkw29ifcbv FOREIGN KEY (social_fridge_average_rating_id) REFERENCES public.social_fridge_average_rating(id);

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_fav_categories TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.account_fav_social_fridges TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.account_seq TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.address TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.address_seq TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.grade TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.grade_seq TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.product TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.product_categories TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.product_seq TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.social_fridge TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.social_fridge_average_rating TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.social_fridge_average_rating_seq TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.social_fridge_grades TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.social_fridge_seq TO mzls;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.suggestion TO mzls;

GRANT SELECT,USAGE ON SEQUENCE public.suggestion_seq TO mzls;
