import React from "react";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { connect } from "react-redux";

class Channels extends React.Component {
  state = {
    activeChannel: "",
    user: this.props.currentUser,
    channel: null,
    channels: [],
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    typingRef: firebase.database().ref("typing"),
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    modal: false,
    firstLoad: true,
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach((channel) => {
      this.state.messagesRef.child(channel.id).off();
    });
  };

  addNotificationListener = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    const notificationsCopy = [...notifications];
    const notification = notificationsCopy.find(({ id }) => id === channelId);

    if (notification) {
      if (notification.id !== currentChannelId) {
        lastTotal = notification.total;

        if (snap.numChildren() - lastTotal > 0) {
          notification.count = snap.numChildren() - lastTotal;
        }
      }
      notification.lastKnownTotal = snap.numChildren();
    } else {
      notificationsCopy.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }

    this.setState({ notifications: notificationsCopy });
  };

  setFirstChannel = () => {
    if (this.state.firstLoad && this.state.channels.length > 0) {
      const [firstChannel] = this.state.channels;
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({ firstLoad: false });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleSubmit = (event) => {
    event.preventDefault();
    if (!this.isFormValid(this.state)) {
      return;
    }
    this.addChannel();
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel }, () => {
      this.clearNotifications();
    });
  };

  clearNotifications = () => {
    const updatedNotifications = this.state.notifications.map(
      (notification) => {
        if (notification.id === this.state.channel.id) {
          return {
            ...notification,
            total: notification.lastKnownTotal,
            count: 0,
          };
        }
        return notification;
      }
    );
    this.setState({ notifications: updatedNotifications });
  };

  getNotificationCount = (channel) => {
    const { count } =
      this.state.notifications.find(
        (notification) => notification.id === channel.id
      ) || {};
    if (count > 0) {
      return count;
    }
  };

  displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  isFormValid = ({ channelName, channelDetails }) =>
    channelName.trim() && channelDetails.trim();

  render() {
    const { channels, modal, channelDetails, channelName } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  value={channelName}
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  value={channelDetails}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
