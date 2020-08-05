import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

const MIN_VALID_PASSWORD_LENGTH = 6;

class Register extends React.Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        usersRef: firebase.database().ref('users')
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    isFormValid = () => {
        let errors = [];
        let error;

        if (this.isFormEmpty(this.state)) {
            error = { message: 'Fill in all the fields' };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            error = { message: 'Password is invalid' };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else {
            return true;
        }
    }

    isPasswordValid = ({ password, passwordConfirmation }) => {
        if ([password, passwordConfirmation].some(field => field.length < MIN_VALID_PASSWORD_LENGTH)) {
            return false;
        } else if (password !== passwordConfirmation) {
            return false;
        } else {
            return true;
        }
    }

    isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
        return [username, email, password, passwordConfirmation].some(field => !field.length);
    }

    handleSubmit = async event => {
        event.preventDefault();
        if (!this.isFormValid()) {
            return;
        }
        const { username, email, password } = this.state;
        try {
            this.setState({ errors: [], loading: true });
            const createdUser = await firebase.auth().createUserWithEmailAndPassword(email, password);

            try {
                await createdUser.user.updateProfile({
                    displayName: username,
                    photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                });
                await this.saveUser(createdUser);
                this.setState({ loading: false });
                console.log('User saved');
            } catch (error) {
                this.setState({ errors: this.state.errors.concat(error), loading: false });
            }
            console.log(createdUser);
        } catch (error) {
            this.setState({ errors: this.state.errors.concat(error), loading: false });
            console.error(error);
        }
    }

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        });
    }

    handleInputError = (errors, inputName) => {
        return errors.some(error =>
            error.message.toLowerCase().includes(inputName)
        ) ? 'error' : '';
    }

    displayErrors = errors => errors.map((error, i) => (<p key={i}>{error.message}</p>))

    render() {
        const { username, email, password, passwordConfirmation, errors, loading } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange" />
                        Register for DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input
                                fluid
                                name="username"
                                value={username}
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                onChange={this.handleChange}
                                type="text"
                            />

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

                            <Form.Input
                                fluid
                                name="passwordConfirmation"
                                value={passwordConfirmation}
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Password Confirmation"
                                onChange={this.handleChange}
                                className={this.handleInputError(errors, 'password')}
                                type="password"
                            />

                            <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;