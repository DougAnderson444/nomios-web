import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connectIdmWallet } from 'react-idm-wallet';
import { Transition } from 'react-transition-group';
import { Route, Switch, withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { withModalGlobal } from '@nomios/web-uikit';
import Sidebar from './sidebar';
import ErrorBoundary from './error-boundary';
import WalletEnclave from './wallet-enclave';
import SetupLocker from '../modals/setup-locker';
import NewIdentityFlow from '../modals/new-identity-flow';
import Home from '../pages/home';
import Identity from '../pages/identity';
import { Page404 } from '../pages/errors';
import styles from './App.css';

class App extends Component {
    state = {
        setupLockerOpen: false,
    };

    constructor(props) {
        super(props);
        this.state.setupLockerOpen = props.pristine;
    }

    componentDidMount() {
        const { location, history } = this.props;

        switch (queryString.parse(location.search).action) {
        case 'create-identity':
            this.props.globalModal.openModal(<NewIdentityFlow />);
            break;
        default:
            break;
        }

        history.replace(location.pathname);
    }

    render() {
        const { pristine } = this.props;
        const { setupLockerOpen } = this.state;

        return (
            <Fragment>
                <Transition in={ setupLockerOpen } timeout={ 2000 } mountOnEnter unmountOnExit>
                    <SetupLocker open={ setupLockerOpen } onComplete={ this.handleSetupLockerComplete } />
                </Transition>

                <WalletEnclave>
                    <div className={ styles.app }>
                        <Sidebar className={ styles.sidebar } />

                        <main className={ styles.page }>
                            { !pristine && (
                                <ErrorBoundary>
                                    <Switch>
                                        <Route path="/" exact component={ Home } />
                                        <Route path="/identity/:id" component={ Identity } />
                                        <Route path="/*" component={ Page404 } />
                                    </Switch>
                                </ErrorBoundary>
                            ) }
                        </main>
                    </div>
                </WalletEnclave>
            </Fragment>
        );
    }

    handleSetupLockerComplete = () => {
        this.setState({ setupLockerOpen: false });
    };
}

App.propTypes = {
    globalModal: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    pristine: PropTypes.bool,
};

const WrappedApp = withRouter(withModalGlobal(App));

export default connectIdmWallet((idmWallet) => () => ({
    pristine: idmWallet.locker.isPristine(),
}))(WrappedApp);
