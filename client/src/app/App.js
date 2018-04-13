import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            batches: [],
            scrapes: {}
        }
    }

    actions = {
        coreMessageEmit: (type, message) => {
            if (type === 'error') {
                console.error(message);
                return;
            }
            console.log(message);
        },
        loadBatches: () => {
            fetch(`${process.env.REACT_APP_QUOTES_API_URL}/scrapes`, {
                method: 'GET',
                mode: 'cors'
            }).then((res) => {
                if (res.ok) {
                    res
                        .json()
                        .then((body) => {
                            this.setState({batches: body})
                        });
                } else {
                    res
                        .text()
                        .then(text => this.actions.coreMessageEmit('error', `Error: ${text}`));
                }
            }).catch(err => this.actions.coreMessageEmit('error', `Error: ${err}`));
        },
        loadScrapes: (batchId) => {
            console.log('fetch batches');
        }
    }

    componentWillMount() {
        this
            .actions
            .loadBatches();
    }

    renderBatchContainer() {
        return (
            <div>
                {this.state.batches.map((batch) => (
                    <div
                        id={batch._id}
                        onClick={() => this.actions.loadScrapes(batch._id)}
                    >
                        <div>
                            <span>
                                Id: {batch._id}
                            </span>
                            <span>
                                Size: {batch.batchSize}
                            </span>
                        </div>
                        <div>
                            <span>
                                Started: {batch.startedAt}
                            </span>
                            <span>
                                Finished: {batch.finishedAt}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    render() {
        console.log('this.state', this.state);

        return (
            <div>
                {this.renderBatchContainer()}
            </div>
        );
    }
}

export default App;
