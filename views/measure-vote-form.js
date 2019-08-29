const { handleForm, html } = require('../helpers')
const { icon } = require('@fortawesome/fontawesome-svg-core')
const { faUsers } = require('@fortawesome/free-solid-svg-icons/faUsers')
const { faEdit } = require('@fortawesome/free-solid-svg-icons/faEdit')
const { faAddressBook } = require('@fortawesome/free-solid-svg-icons/faAddressBook')

module.exports = (state, dispatch) => {
  const { error, loading, location, measure: l, user } = state
  const v = l.vote || {}
  const public_checked = v.hasOwnProperty('public') ? v.public : (!user || user.last_vote_public)
  const position = v.position || (l.vote && l.vote.position)
  return html`
    <form method="POST" style="margin-bottom: 2rem;" onsubmit=${handleForm(dispatch, { type: 'vote:voted', measure: l })} onconnected=${scrollToForm(location)}>
      <input type="hidden" name="vote_id" value="${position || ''}" />
      <div class="field">
        <h4 class="title is-size-6">${!v.comment ? 'Vote' : 'Edit vote'}</h4>
      </div>
      ${v.id && !v.comment && l.votePower !== undefined && public_checked ? html`
        <p class="notification">
          <span class="icon">${icon(faUsers)}</span>
          ${v.id ? 'You cast' : 'You are casting'}
          a vote for <strong>${l.votePower}</strong> people as their proxy.
          Consider including an explanation of your position.
        </p>
      ` : ''}
      ${error ? html`<div class="notification is-danger">${error.message}</div>` : ''}
      <div class="field">
        <div class="columns is-gapless is-marginless">
          <div class="column">
            <div class="control">
              <label class="radio">
                <input type="radio" name="position" value="yea" checked=${position === 'yea' ? 'checked' : ''} />
                Yea
              </label>
              <label class="radio">
                <input type="radio" name="position" value="nay" checked=${position === 'nay' ? 'checked' : ''} />
                Nay
              </label>
              <label class="radio">
                <input type="radio" name="position" value="abstain" checked=${position === 'abstain' ? 'checked' : ''} />
                Undecided
              </label>
            </div>
          </div>
          <div class="column">
            <div class="control has-text-right has-text-left-mobile has-text-grey is-size-7">
              ${public_checked && l.votePower !== undefined ? html`
                  <span class="icon">${icon(faUsers)}</span>You are casting
                  a vote for <span class="has-text-weight-semibold">${l.votePower}</span> people as their proxy.
              ` : l.votePower !== undefined ? html`
                  <span class="icon">${icon(faAddressBook)}</span>You are casting
                  a private vote for yourself only. Only you can see it.
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <textarea name="comment" autocomplete="off" class="textarea" placeholder="Add an argument. Why are you voting this way?" value=${v.comment || ''}></textarea>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field is-grouped">
          <div class="control">
            <button class=${`button ${loading.vote ? 'is-loading' : ''}`} disabled=${loading.vote} type="submit">
              <span class="icon">${icon(faEdit)}</span>
              <span>${v.id ? 'Save' : 'Publish'}</span>
            </button>
          </div>
          <div class="control" style="flex-shrink: 1;">
            <div class="select">
              <select autocomplete="off" name="public">
                <option value="true" selected=${public_checked}>Public${l.votePower ? ` (Vote Power: ${l.votePower})` : ''}</option>
                <option value="false" selected=${!public_checked}>Private${l.votePower ? '(Vote Power: 1)' : ''}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  `
}

const scrollToForm = (location) => {
  if (location.query.action === 'add-argument') {
    window.scrollTo(0, document.getElementById('measure-vote-form').getBoundingClientRect().top)
  }
}
