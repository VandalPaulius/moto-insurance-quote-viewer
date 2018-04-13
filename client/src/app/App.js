import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            batches: [],
            scrapes: {},
            activeBatchId: ''
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
            fetch(`${process.env.REACT_APP_QUOTES_API_URL}/scrapes/${batchId}/quotes`, {
                method: 'GET',
                mode: 'cors'
            }).then((res) => {
                if (res.ok) {
                    res
                        .json()
                        .then((body) => {
                            this.setState((prevState) => ({
                                ...prevState,
                                scrapes: {
                                    ...prevState.scrapes,
                                    [batchId]: body
                                }
                            }));
                        });
                } else {
                    res
                        .text()
                        .then(text => this.actions.coreMessageEmit('error', `Error: ${text}`));
                }
            }).catch(err => this.actions.coreMessageEmit('error', `Error: ${err}`));
        },
        setActiveBatch: (batchId) => this.setState({ activeBatchId: batchId })
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
                        key={batch._id}
                        onClick={() => {
                            this.actions.setActiveBatch(batch._id);
                            this.actions.loadScrapes(batch._id);
                        }}
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

    renderActiveScrapes() {
        const activeScrapes = this.state.scrapes[this.state.activeBatchId];

        return (
            <div>
                {activeScrapes
                    ? activeScrapes.map((scrape) => {
                        if (scrape.startedAt) {
                            const leastExpensive = scrape.quotes.filter((quote, index) => {
                                if (index < 3) {
                                    return quote;
                                }
                            });

                            return (
                                <div key={scrape._id}>
                                    <div>
                                        <span>
                                            PostCode: {scrape.inputRange.quoteDetails.addressDetails.postCode.value}
                                        </span>
                                        <span>
                                            Address: {scrape.inputRange.quoteDetails.addressDetails.address.value}
                                        </span>
                                    </div>
                                    <div>
                                        {leastExpensive.map((quote, index) => (
                                            <div key={`${index}-${quote.price.full}`}>
                                                {quote.price.full}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={scrape._id}>
                                    No quotes
                                </div>
                            );
                        }
                    })
                    : null
                }
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderBatchContainer()}
                {this.renderActiveScrapes()}
            </div>
        );
    }
}

export default App;
