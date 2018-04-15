import React from 'react';
import 'normalize.css';
import './styles.css'

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
            <div className="container">
                <div className="header">
                    Batches
                </div>
                <div>
                    {this.state.batches.map((batch) => (
                        <div
                            className="list-item hoverable clickable"
                            key={batch._id}
                            onClick={() => {
                                this.actions.setActiveBatch(batch._id);
                                this.actions.loadScrapes(batch._id);
                            }}
                        >
                            <div className="text-container">
                                <div>
                                    <span className="type">Id: </span>
                                    <span>{batch._id}</span>
                                </div>
                                <div className="break" />
                                <div>
                                    <span className="type">Size: </span>
                                    <span>{batch.batchSize}</span>
                                </div>
                            </div>
                            <div className="text-container">
                                <div>
                                    <span className="type">Started: </span>
                                    <span>{batch.startedAt}</span>
                                </div>
                                <div className="break" />
                                <div>
                                    <span className="type">Finished: </span>
                                    <span>{batch.finishedAt}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    renderActiveScrapes() {
        const activeScrapes = this.state.scrapes[this.state.activeBatchId];

        return (
            <div className="container">
                <div className="header">
                    Quotes
                </div>
                <div className="content">
                    {activeScrapes
                        ? activeScrapes.map((scrape) => {
                            if (scrape.startedAt) {
                                const leastExpensive = scrape.quotes.filter((quote, index) => {
                                    if (index < 3) {
                                        return quote;
                                    }
                                });

                                return (
                                    <div
                                        className="list-item hoverable"
                                        key={scrape._id}
                                    >
                                        <div className="text-container">
                                            <div>
                                                <div>
                                                    <span className="type">PostCode: </span>
                                                    <span>{scrape.inputRange.quoteDetails.addressDetails.postCode.value}</span>
                                                </div>
                                                <div>
                                                    <span className="type">Address: </span>
                                                    <span>{scrape.inputRange.quoteDetails.addressDetails.address.value}</span>
                                                </div>
                                            </div>
                                            <div className="text-container">
                                                <span className="type">Price:</span>
                                                <span className="space" />
                                                <span>
                                                    {leastExpensive.map((quote, index) => (
                                                        <div
                                                            className={index === 0 ? 'highlight' : ''}
                                                            key={`${index}-${quote.price.full}`}
                                                        >
                                                            {quote.price.full}
                                                        </div>
                                                    ))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        className="list-item hoverable"
                                        key={scrape._id}
                                    >
                                        No quotes
                                    </div>
                                );
                            }
                        })
                        : (
                            <div className="list-item">
                                No quotes
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="app">
                <div className="content">
                    <div>
                        {this.renderBatchContainer()}
                        <div className="break" />
                        {this.renderActiveScrapes()}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
