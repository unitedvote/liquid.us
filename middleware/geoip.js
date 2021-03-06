const { IPAPI_KEY } = process.env
const fetch = require('node-fetch')

module.exports = geoip

function geoip(req, res) {
  let ip = req.params.ip || req.ip

  if ((ip === '::1' || ip === '::ffff:127.0.0.1') && process.env.NODE_ENV !== 'production') {
    ip = '198.27.235.190'
  }

  let responded = false
  const respond = (geoip) => {
    if (responded === false) {
      responded = true
      res.json(geoip || null)
    }
  }
  const timeout = setTimeout(respond, 1000)

  fetch(`http://pro.ip-api.com/json/${ip}${IPAPI_KEY ? `?key=${IPAPI_KEY}` : ''}`, {
    headers: { Accept: 'application/json' },
  })
  .then(res => {
    if (res.status === 200) {
      return res.json()
    }
    return Promise.reject(new Error(`Received non-OK response from ip-api.com (code: ${res.status})`))
  })
  .then((geoip) => {
    if (timeout) clearTimeout(timeout)
    respond(geoip)
  })
  .catch((error) => {
    console.error(error)
    if (timeout) clearTimeout(timeout)
    respond(null)
  })
}
