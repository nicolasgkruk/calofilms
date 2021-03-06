import React, {Component} from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';


import * as actions from '../store/actions/index';
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden';
import CustomSearchInput from './CustomSearchInput'
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToApp from '@material-ui/icons/ExitToApp';
import AccountBox from '@material-ui/icons/AccountBox';
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
import Alert from '../components/UI/Alert/Alert';
//import Search from '@material-ui/icons/Search';

class NavBar extends Component {

    state = {
        searchString: '',
        alertNoFilmsOpen: false
    }

    filteredTitles(searchString) {
        const filteredArray = []

        this.props.films.map((film) => {
            const filmString = Array(2);
            filmString[0] = `${film.title} ${film.yearOfRelease} ${film.director} ${film.country} ${film.runningTime} ${film.comment} ${film.tags}`;
            filmString[1] = film.title;
            return filmString;
            })
            .filter((filmString) => {
            return filmString[0].search(new RegExp(searchString, "i")) !== -1 
            })
            .map((filteredFilm) => {
            return filteredFilm[1];
            })
            .forEach(filteredFilm => {
                this.props.films.forEach(film => {
                    if (filteredFilm === film.title) {
                    filteredArray.push(film);
                }
                });
            });
        return filteredArray;
    }


    onSearchInputChange = (event) => {
        if (event.target.value.trim() !== '') {
            this.setState( {searchString: event.target.value }, () => {
                this.props.updateDisplayedFilms(this.filteredTitles(this.state.searchString));
            });
        } else {
            this.setState({searchString: ''}, () => {
                this.props.updateDisplayedFilms(this.filteredTitles(this.state.searchString));
            } )
        }
    }

    showOnlyQueueClickHandler = () => {
        if (this.props.filmsInUsersQueue.length === 0) {
            this.setState({alertNoFilmsOpen : true});
        } else {
            window.scrollTo(0, 0);
            this.props.toggleOnlyShowQueue();
        } 
    }
    
    alertClickHandler = () => {
        this.setState( prevState => {
            return { alertNoFilmsOpen: !prevState.alertNoFilmsOpen };
        } );
    }

    render() {

        const closeSession = () => {
            return (<NavLink to="/logout">
            <Tooltip title="Cerrar sesión">
                <IconButton aria-label="Cerrar sesión">
                        <ExitToApp style={{color:'white'}}/>
                    </IconButton>
            </Tooltip>
            </NavLink>);
        };

        const menuIcons = () => {
        if(!this.props.isAuthenticated) {
            return (<Grid item>
                <NavLink to="/auth">
                <Tooltip title="Iniciar sesión o registrar un nuevo usuario. Necesario para agregar películas a tu lista personalizada.">
                    <IconButton aria-label="Mi lista">
                            <AccountBox style={{color:'white'}}/>
                    </IconButton>
                </Tooltip>
                </NavLink>
            </Grid>)
        } else if (this.props.isAuthenticated && !this.props.onlyShowQueue) {
            return (<>
                <Grid item>
                    <NavLink to="/">
                    <Tooltip title="Mostrar solo las películas agregadas en tu lista.">
                        <IconButton aria-label="Mi lista" onClick={this.showOnlyQueueClickHandler}>
                            <PlaylistAdd style={{color:'white'}}/>
                        </IconButton>
                    </Tooltip>
                    </NavLink>
                    {closeSession()}
            </Grid>
            </>)
        } else if (this.props.isAuthenticated 
                    && this.props.onlyShowQueue
                    ){
            return (
                <>
                <Grid item>
                    <NavLink to="/">
                    <Tooltip title="Volver a mostrar todas las películas.">
                        <IconButton aria-label="Mi lista" onClick={this.showOnlyQueueClickHandler}>
                            <PlaylistAddCheck style={{color:'white'}}/>
                        </IconButton>
                    </Tooltip>
                    </NavLink>
                    {closeSession()}
            </Grid>
            </>
            )
        }
    }

        return(
            <div>
                <AppBar position="fixed" style={{ top: 0, backgroundColor: 'black'}}>
                    <Toolbar>
                    <Grid container
                        justify="space-between"
                        alignItems="center">
                    <Grid item>
                    
                
                    {this.props.displayed && !this.props.onlyShowQueue && !this.props.inAuth ? 
                    <>
                    
                    <CustomSearchInput search={this.onSearchInputChange} /> 
                    </>
                    : null}
                    
                    </Grid>
                    <Grid item  style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        <Hidden xsDown>
                            <Typography id="title" variant="title" color="inherit" margin={'0 auto'}>
                                CaloFilms
                            </Typography>
                        </Hidden>
                    </Grid>
                        {menuIcons()}
                        </Grid>
                        { this.state.alertNoFilmsOpen ? 
                        <Alert closeAlert={this.alertClickHandler}
                               title={"Aún no tienes películas en tu lista"}
                               messageBody={'Comienza a añadir películas para poder verlas en tu lista personalizada.'}/> : null}
                    </Toolbar>
                </AppBar>
                
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        films: [...state.films.films],
        displayed: state.films.displayed,
        isAuthenticated: state.auth.token !== null,
        onlyShowQueue: state.userLists.onlyShowQueue,
        inAuth: state.auth.inAuth,
        filmsInUsersQueue: state.userLists.filmsInUsersQueue
    };
  };

const mapDispatchToProps = dispatch => {
    return {
        updateDisplayedFilms: (filteredArrayOfFilms) => dispatch(actions.updateFilms(filteredArrayOfFilms)),
        toggleOnlyShowQueue: () => dispatch(actions.toggleOnlyShowQueue())
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar));