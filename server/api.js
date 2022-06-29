module.exports = function (app, db) {
    const jwt = require('jsonwebtoken')
    const bcrypt = require('bcrypt');
    const saltRounds = 10;

    function verifyToken(req, res, next) {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!req.headers.authorization || !token) {
            res.sendStatus(401);
            return;
        }
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const { username } = decoded;

            if (username) {
                next();
            } else {
                res.status(403).json({
                    message: 'unauthorized'
                });
            }
        } catch (err) {
            if (err && 500) {
                res.json({
                    message: 'expired'
                })
            }
            next()


        }

    }

    app.post('/api/register', async function (req, res, next) {
        try {
            const { username } = req.body;
            const { password } = req.body;
            const { firstName } = req.body
            const { lastName } = req.body
            console.log(username);
            let checkDuplicate = await db.manyOrNone(`SELECT * from users WHERE username = $1`, [username]);
            bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    // Store hash in your password DB.
                    if (checkDuplicate.length < 1) {
                        await db.none(`insert into users (username, password, first_name, last_name) values ($1, $2, $3, $4)`, [username, hash, firstName, lastName])
                        res.json({
                            message: 'success'
                        });
                    } else {
                        res.json({
                            message: 'duplicate'
                        });
                    }
                });
            });
        } catch (err) {
            console.log(err);
            next()
        }

    })
    app.post('/api/login', async function (req, res, next) {
        try {
            const { username } = req.body;
            const { password } = req.body;
            const token = jwt.sign({
                username
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4hr' });
            let checkUser = await db.manyOrNone(`SELECT id from users WHERE username = $1`, [username]);
            if (checkUser.length < 1) {
                res.json({
                    token,
                    message: 'unregistered'
                });
            } else {

                let checkPassword = await db.oneOrNone(`SELECT password from users WHERE username = $1`, [username]);

                const match = await bcrypt.compare(password, checkPassword.password);

                if (match) {
                    res.json({
                        token,
                        message: 'success'
                    });
                } else {
                    res.json({
                        token,
                        message: 'unmatched'
                    });
                }
            }
        } catch (err) {
            console.log(err);
            next()
        }
    });

    app.get('/api/playlist/:username', verifyToken, async function (req, res, next) {
        try {
            const username = req.params.username

            const { id } = await db.oneOrNone(`select id from users where username = $1`, [username])
            const userInfo = await db.manyOrNone(`select * from users where username = $1`, [username])
            const userPlaylist = await db.manyOrNone(`SELECT * from movies WHERE user_id = $1`, [id]);
            res.json({
                data: userPlaylist,
                user: userInfo
            })

        } catch (err) {
            console.log(err);
            next()
        }
    });

    app.post('/api/playlist/:username', async function (req, res, next) {
        try {
            const username = req.params.username
            const { movieName } = req.body
            const { movieImg } = req.body
         
            const { id } = await db.oneOrNone(`SELECT id from users WHERE username = $1`, [username]);
           
            let checkUser = await db.manyOrNone(`SELECT * from movies WHERE user_id = $1 and movie_name = $2 and movie_img = $3`, [id, movieName, movieImg]);
            if (checkUser.length < 1) {
                await db.none(`insert into movies (movie_name, movie_img, user_id) values ($1, $2, $3)`, [movieName, movieImg, id])

                res.json({
                    message: 'success'
                });
            } else {
                res.json({
                    message: 'duplicate'
                });
            }
        } catch (err) {
            console.log(err);
            next()
        }
    });
    app.delete('/api/playlist', async function (req, res, next) {
        try {


            const username = req.query.username
            const movieName = req.query.movieName

            try {
                const { id } = await db.one(`select id from users where username = $1`, [username])
                await db.none(`delete from movies WHERE user_id = $1 and movie_name = $2`, [id, movieName]);
                res.json({
                    status: 'success'
                })
            } catch (err) {
                res.json({
                    status: 'success',
                    error: err.stack
                })
            }
        } catch (err) {
            console.log(err);
            next()
        }
    });


}