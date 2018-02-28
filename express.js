const EXPECTED_VALUE = 'EXPECTED_VALUE'

const express = () => {
    let isStarted

    const middlewares = {}
    const handlers = {}

    const use = (url, middleware) => {
        if (middlewares[url]) {
            middlewares[url].push(middleware)
        } else {
            middlewares[url] = [middleware]
        }
    } 

    const get = (url, handler) => handlers.get = { [url]: handlers[url] ||  handler }

    const listen = () => isStarted = true

    const _middlewareCallback = (request, respond, previousWasCalled, middleware) => {
        if (!previousWasCalled) {
            return false
        }

        let isNextCalled
        const next = () => isNextCalled = true

        middleware(request, respond, next)

        return isNextCalled
    }

    const getResponse = (url, method) => {
        if (!isStarted) {
            throw new Error('server is not started')
        }

        const urlMidddlewares = middlewares[url]
        const request = {}
        const respond = {}

        if (urlMidddlewares) {
            urlMidddlewares.reduce(_middlewareCallback.bind(null, request, respond), true)
        }

        handlers.get[url](request, respond)
    }

    return {
        use,
        get,
        listen,
        getResponse,
    }
}

const app = express()

app.use('/', (req, res, next) => {
    req.input = EXPECTED_VALUE
    next()
})

app.use('/', (req, res, next) => {
    console.log(req.input) // EXPECTED_VALUE
    next()
})

app.get('/', (req, res) => {
    console.log(req.input === EXPECTED_VALUE) // true
})

app.listen()

app.getResponse('/', 'GET')