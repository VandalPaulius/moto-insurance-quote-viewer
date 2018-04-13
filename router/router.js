const routes = require('./routes')

exports.configureApi = ({ router, database }) => {
    routes.scrapes.configure({ router, database });
}
