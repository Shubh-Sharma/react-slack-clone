import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component {
    state = {
        email: '',
        password: '',
        errors: []
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit = async event => {
        event.preventDefault();
        if (!this.isFormValid(this.state)) {
            return;
        }
        const { email, password } = this.state;
        try {
            this.setState({ errors: [], loading: true });
            const authUser = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log(authUser);
        } catch (error) {
            this.setState({ errors: this.state.errors.concat(error), loading: false });
            console.error(error);
        }
    }

    isFormValid = ({ email, password }) => email && password;

    handleInputError = (errors, inputName) => {
        return errors.some(error =>
            error.message.toLowerCase().includes(inputName)
        ) ? 'error' : '';
    }

    displayErrors = errors => errors.map((error, i) => (<p key={i}>{error.message}</p>))

    render() {
        const { email, password, errors, loading } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="puzzle piece" color="violet" />
                        Login to DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>

                            <Form.Input
                                fluid
                                name="email"
                                value={email}
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                className={this.handleInputError(errors, 'email')}
                                onChange={this.handleChange}
                                type="email"
                            />

                            <Form.Input
                                fluid
                                name="password"
                                value={password}
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                onChange={this.handleChange}
                                className={this.handleInputError(errors, 'password')}
                                type="password"
                            />

                            <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>
                        Don't have an account? <Link to="/register">Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Login;