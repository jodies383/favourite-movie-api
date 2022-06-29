import axios from "axios";

export function MovieApi() {
    const URL_BASE = import.meta.env.VITE_SERVER_URL;
    return {
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        userInfo: '',
        myMovies: '',
        searchInput: '',
        searchResults: '',
        loginUsername: '',
        loginPassword: '',
        loginInput: true,
        logoutBtn: false,
        registerInput: false,
        mainContent: false,
        errorMessage: false,
        successMessage: false,
        movieSearch: false,
        playlist: false,
        searchResLength: '',

        init() {
            if (localStorage.getItem('token') && localStorage.getItem('username')) {
                this.registerInput = false
                this.loginInput = false
                this.mainContent = true
                this.logoutBtn = true
                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                const username = localStorage.getItem('username')
                axios
                    .get(`${URL_BASE}/api/playlist/${username}`, { withCredentials: true, })
                    .then((result) => {
                        this.myMovies = result.data.data
                    });
            }
        },
        logout() {
            localStorage.clear()
       
            this.logoutBtn = false
            this.registerInput = false
            this.loginInput = true
            this.mainContent = false
            this.loginUsername = ''
            this.loginPassword = ''
        },
        hideLogin() {
            this.loginInput = false
            this.registerInput = true
        },
        hideRegister() {
            this.loginInput = true
            this.registerInput = false
        },
        hidePlaylist(){
            this.playlist = ! this.playlist
        },
        register() {
            if (this.username !== '') {
                axios
                    .post(`${URL_BASE}/api/register`, { username: this.username, password: this.password, firstName: this.firstName, lastName: this.lastName })
                    .then((result) => {
                        if (result.data.message == 'success') {
                            this.successMessage = true,
                                this.$refs.successMessage.innerText = 'registration successful'
                            this.loginInput = true
                            this.registerInput = false

                        } else {
                            this.errorMessage = true,
                                this.$refs.errorMessage.innerText = 'this username has already been registered'
                        }
                    });
            }
            setTimeout(() => { this.errorMessage = false }, 2000);
            setTimeout(() => { this.successMessage = false }, 2000);

            this.username = ''
            this.password = ''
            this.firstName = ''
            this.lastName = ''
            this.loginUsername = ''
            this.loginPassword = ''
        },
        login() {
            this.user = localStorage.getItem('username')
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            axios
                .post(`${URL_BASE}/api/login`, { username: this.loginUsername, password: this.loginPassword })
                .then((result) => {
                    if (result.data.message == 'unregistered') {
                        this.errorMessage = true,
                            this.$refs.errorMessage.innerText = 'this username has not been registered'
                        this.loginUsername = ''
                        this.loginPassword = ''
                    } else if (result.data.message == 'unmatched') {
                        this.errorMessage = true,
                            this.$refs.errorMessage.innerText = 'incorrect username or password'
                        this.loginUsername = ''
                        this.loginPassword = ''
                    } else {
                        localStorage.setItem('username', this.loginUsername);
                        const { token } = result.data;
                        localStorage.setItem('token', token);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

                        const results = result.data
                        if (results.message == 'success') {
                            this.mainContent = true
                            this.registerInput = false
                            this.loginInput = false
                            this.logoutBtn = true

                            axios
                                .get(`${URL_BASE}/api/playlist/${this.loginUsername}`)
                                .then((result) => {
                                    this.myMovies = result.data.data
                                });
                            this.successMessage = true,
                                this.$refs.successMessage.innerText = 'login successful'
                        }
                    }

                });

            setTimeout(() => { this.errorMessage = false }, 2000);
            setTimeout(() => { this.successMessage = false }, 2000);
        }
        ,
        searchMovies() {
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            axios
                .get(`https://api.themoviedb.org/3/search/movie?api_key=511ebf4540231b1f06e7bec72f6b4a05&query=${this.searchInput}`)
                .then((result) => {
                    const results = result.data.results
                    if (results.length < 1){
                        this.errorMessage = true,
                        this.$refs.errorMessage.innerText = 'no movies found'
                    } else {
                        this.searchResults = results
                        this.movieSearch = true
                        this.searchInput = ''
                        this.searchResLength = results.length
                    }
                })
                setTimeout(() => { this.errorMessage = false }, 2000);
        },
        displayFavourites() {
            const username = localStorage.getItem('username')
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            axios
                .get(`${URL_BASE}/api/playlist/${username}`)
                .then((result) => {
                    if (result.data.message == 'expired') {
                        if (localStorage.getItem('token')) {
                            this.logout()
                            this.errorMessage = true,
                                this.$refs.errorMessage.innerText = 'session expired, please log in again'
                        }
                    }
                    else {
                        this.myMovies = result.data.data
                        this.userInfo = result.data.user
                    }
                });

            setTimeout(() => { this.errorMessage = false }, 2000);
        },
        removeMovie(movie) {
            const username = localStorage.getItem('username')
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            axios
                .delete(`${URL_BASE}/api/playlist?username=${username}&movieName=${movie}`)
                .then((result) => {
                    axios
                        .get(`${URL_BASE}/api/playlist/${username}`)
                        .then((result) => {
                            this.myMovies = result.data.data
                            this.successMessage = true,
                            this.$refs.successMessage.innerText = 'removed from favourites'
                        });
                });

            setTimeout(() => { this.successMessage = false }, 2000);
            setTimeout(() => { this.errorMessage = false }, 2000);
        },
        addToFavourites(movie, poster) {
            const username = localStorage.getItem('username')
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            axios
                .post(`${URL_BASE}/api/playlist/${username}`, { movieName: movie, movieImg: poster })
                .then((result) => {
                    if (result.data.message == 'success'){
                    axios
                        .get(`${URL_BASE}/api/playlist/${username}`)
                        .then((result) => {
                                this.myMovies = result.data.data
                                this.successMessage = true,
                                this.$refs.successMessage.innerText = 'added to favourites'
                            });
                        } else if (result.data.message == 'duplicate') {
                            this.errorMessage = true,
                            this.$refs.errorMessage.innerText = 'this movie is already in your favourites'
                        }
                });
            setTimeout(() => { this.successMessage = false }, 2000);
            setTimeout(() => { this.errorMessage = false }, 2000);
        }
    }
}