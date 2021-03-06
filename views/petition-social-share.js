const { WWW_URL } = process.env
const { html } = require('../helpers')
const { icon } = require('@fortawesome/fontawesome-svg-core')
const { faTwitter } = require('@fortawesome/free-brands-svg-icons/faTwitter')
const { faFacebook } = require('@fortawesome/free-brands-svg-icons/faFacebook')
const { faEnvelope } = require('@fortawesome/free-solid-svg-icons/faEnvelope')

module.exports = (measure) => {
  const { author, short_id, title } = measure
  const measure_url = `/${author.username}/${short_id}`
  const share_url = `${WWW_URL}${measure_url}`
  const share_text = `Join me to ${title}: ${share_url}`.replace(/&/g, '%26')

  return html`
    <div class="content">
      <div class="buttons is-centered">
        <a class="button is-link has-text-weight-bold" title="Share on Facebook" target="_blank" href="${`https://www.facebook.com/sharer/sharer.php?u=${share_url}`}">
          <span class="icon">${icon(faFacebook)}</span>
          <span>Share on Facebook</span>
        </a>
        <a class="button is-link has-text-weight-bold" title="Share on Twitter" target="_blank" href="${`https://twitter.com/intent/tweet?text=${share_text}`}">
          <span class="icon">${icon(faTwitter)}</span>
          <span>Tweet your people</span>
        </a>
        <a class="button is-link has-text-weight-bold" title="Share with Email" target="_blank" href="${`mailto:?subject=${title}&body=${share_text}`}">
          <span class="icon">${icon(faEnvelope)}</span>
          <span>Email</span>
        </a>
      </div>
    </div>
  `
}
