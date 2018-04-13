const routes = require('./routes')

exports.configurePages = ({ router }) => {
    routes.pages.configure(router);
}

exports.configureApi = ({ router, database }) => {
    routes.scrapes.configure({ router, database });
}
