create table users(
	id serial not null primary key,
	username text,
	password text,
	first_name text,
    last_name text
);

create table playlist(
	id serial not null primary key,
	user_id int,
	movie_id int,
    foreign key (user_id) references users(id)
);