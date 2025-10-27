import buildServer from "./server.js";

const server  = buildServer()

async function main() {
    try {
        await server.listen({port: 3000, host: 'localhost'})

        console.log(`Server ready at http://localhost:3000`)
    } catch (err: any) {
        console.error(err)
        process.exit(1)
    }
}

main()