import React from 'react';
import mime from 'mime-types';
import { Modal, Input, Button, Icon } from 'semantic-ui-react';

class FileModal extends React.Component {
    state = {
        file: null,
        authorized: ['image/jpg', 'image/jpeg', 'image/png']
    }

    isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename))

    addFile = event => {
        const [file] = event.target.files;
        if (file) {
            this.setState({ file });
        }
    }

    clearFile = () => this.setState({ file: null });

    sendFile = () => {
        const { file } = this.state;
        const { uploadFile, closeModal } = this.props;

        if (file !== null) {
            if (this.isAuthorized(file.name)) {
                const metadata = { contentType: mime.lookup(file.name) };
                uploadFile(file, metadata);
                closeModal();
                this.clearFile();
            }
        }
    }

    render() {
        const { modal, closeModal } = this.props;

        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input
                        onChange={this.addFile}
                        fluid
                        label="File types: jpg, png"
                        name="file"
                        type="file"
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={this.sendFile}
                        color="green"
                        inverted
                    >
                        <Icon name="checkmark" /> Send
                    </Button>
                    <Button
                        color="red"
                        onClick={closeModal}
                        inverted
                    >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModal;