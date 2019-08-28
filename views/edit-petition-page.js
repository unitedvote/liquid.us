const { WWW_URL } = process.env
const { handleForm, html } = require('../helpers')
const activityIndicator = require('./activity-indicator')

module.exports = (state, dispatch) => {
  const { location, measures = {}, user } = state
  const measure = location.params.shortId && measures[location.params.shortId]
  return html`
    <section class="section">
      <div class="container is-widescreen">
        <h2 class="title is-5">${measure ? 'Edit Petition' : 'Start a Petition'}</h2>
        ${user.username
          ? location.params.shortId && !measure
            ? activityIndicator()
            : form(state, dispatch)
          : publicProfileRequiredMsg(user.phone_verified)}
      </div>
    </section>
  `
}

const publicProfileRequiredMsg = (verified) => {
  return html`
    <p class="notification">
      You must create a public profile to start a petition.
      ${verified
        ? html`<a href="/get_started">Choose a username</a> and make a public profile.</a>`
        : html`<a href="/get_started">Verify your phone number</a> to choose a username and make a public profile.</a>`
      }
    </p>
  `
}

const form = (state, dispatch) => {
  const { error, forms, legislatures = [], loading, location, measures = {}, user } = state
  const measure = measures[location.params.shortId] || {}
  const form = forms.editMeasure || {}
  const { legislature_id, summary, title } = measure
  const auto_short_id = (form.title || title || '').toLowerCase().replace(/ /g, '-').replace(/[^A-z0-9-_]/g, '').slice(0, 32)
  const short_id = !forms.editMeasureShortId && !measure.short_id ? auto_short_id : (form.short_id || measure.short_id)

  return html`
    <form method="POST" onsubmit=${handleForm(dispatch, { type: 'measure:editFormSaved', oldShortId: measure.short_id })} onkeyup=${handleForm(dispatch, { type: 'measure:editFormChanged' })} onchange=${handleForm(dispatch, { type: 'measure:editFormChanged' })}>
      ${error ? html`<div class="notification is-danger">${error.message}</div>` : ''}
      <input type="hidden" name="measure_type" value="petition" />
      <div class="${`field ${legislatures.length === 1 ? 'is-hidden' : ''}`}">
        <label for="short_id" class="label has-text-grey">Who is this petition for?</label>
        <div class="control">
          <div class="select">
            <select name="legislature_id">
              ${legislatures.map(({ id, name }) => {
                return html`<option value="${id}" selected=${id === legislature_id}>${name}</option>`
              })}
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label for="Title" class="label has-text-grey">Title</label>
        <div class="control">
          <input name="title" class="input" type="text" autocomplete="off" placeholder="Eliminate Sales Tax Now!" required value="${title || ''}" />
        </div>
      </div>
      <div class="field">
        <label for="short_id" class="label has-text-grey">URL</label>
        <div class="field has-addons">
          <div class="control">
            <a class="button is-static">${WWW_URL.replace(/https?:\/\//, '')}/${user.username}/</a>
          </div>
          <div class="control">
            <input name="short_id" class="input" type="text" placeholder="your-petition" onkeyup=${editedShortId(dispatch)} onchange=${editedShortId(dispatch)} value="${short_id}" />
          </div>
        </div>
      </div>
      <div class="field">
        <label for="summary" class="label has-text-grey">Summary</label>
        <div class="control">
          <textarea name="summary" autocomplete="off" class="textarea" rows="2" placeholder="A short summary of your petition." required value="${summary || ''}"></textarea>
          <p class="help">You can continue to edit your petition later.</p>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class=${`button is-primary ${loading.form === 'saving' ? 'is-loading' : ''}`} disabled="${loading.form}" type="submit">
            ${measure.id ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  `
}

const editedShortId = (dispatch) => (event) => {
  dispatch({ type: 'measure:editFormShortIdChanged', shortId: event.currentTarget.value, event })
}
