import buildServer from "./server.js";

const server  = buildServer()

const port = Number(process.env.PORT) || 10000
const host = '0.0.0.0'

async function main() {
    try {
        await server.listen({port, host})

        console.log(`Server ready on http://localhost:${port}`)
        console.log(`Health check: http://localhost:${port}/healthcheck`)
        console.log(`API base: http://localhost:${port}/api`)        
    } catch (err: any) {
        console.error('Failed to start server:', err)
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Please stop the other process or use a different port.`)
        }
        process.exit(1)
    }
}

main()