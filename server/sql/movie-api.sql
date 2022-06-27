create table users(
	id serial not null primary key,
	username text,
	password text,
	first_name text,
    last_name text
);
create table movies(
	id serial not null primary key,
	user_id int,
	movie_name text,
	movie_img text,
    foreign key (user_id) references users(id)
);