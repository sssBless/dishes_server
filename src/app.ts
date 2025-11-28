import buildServer from "./server.js";

const server  = buildServer()

const port = Number(process.env.PORT) || 3000
const host = '0.0.0.0'

async function main() {
    try {
        await server.listen({port, host})

        console.log(`Server ready on ${host}:${port} (access via your PC IP)`)        
    } catch (err: any) {
        console.error(err)
        process.exit(1)
    }
}

main()