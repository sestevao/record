const API_URL = 'http://localhost:3000'

async function cosumeAPI(signal) {
  const response = await fecth(API_URL, {
    signal
  })

  const reader = response.body.getReader()
}

const abortController = new AbortController()
await consumeAPI(abortController.signal)

