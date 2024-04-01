import { createServer} from 'node:http'
import { createReadStream } from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { WritableStream, TransformStream } from 'node:stream/web'
import { setTimeout } from 'node:timers/promises'

import csvtojson from 'csvtojson'

const PORT = 3000

// curl -N localhost:3000
// curl -i -X OPTIONS -N localhost:3000

createServer(async (request, response) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
    }

    if(request.method  === 'OPTIONS'){
        response.writeHead(204, headers)
        response.end()
        return
    }

    request.once('close', _ => console.log(`connection was closed!`, items))

    const csvArchive = './animeflv.csv';
    let items = 0
    await Readable.toWeb(createReadStream(csvArchive))
        // passo a passo que cada item individual vai trafegar
        .pipeThrough(Transform.toWeb(csvtojson()))
        .pipeThrough(new TransformStream({
            transform(chunk, controller) {
                const data = JSON.parse(Buffer.from(chunk))
                const mappedData = {
                    title: data.title,
                    description : data.description,
                    url_anime: data.url_anime,
                }
                //quebra de linha pois e um NDJSON
                controller.enqueue(JSON.stringify(mappedData).concat('\n'))
            }
        }))
        //pipeTo e a ultima etapa
        .pipeTo(new WritableStream({
            async write(chunk) {
                await setTimeout(1000)
                items++
                response.write(chunk)
            },
            close() {
                response.end()
            }
        }))

    response.writeHead(200, headers)
    // response.end('ok2')

}).listen(PORT).on('listening', _ => console.log(`server is running at ${PORT}`))