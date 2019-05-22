const { ASSETS_URL } = process.env
const { avatarURL, html, linkifyUrls } = require('../helpers')
const endorsementCount = require('./endorsement-count')
const measureSummary = require('./measure-summary')
const sidebar = require('./endorsement-page-sidebar')
const stateNames = require('datasets-us-states-abbr-names')

module.exports = (state, dispatch) => {
  const { location, measures, votes } = state
  const measure = measures[location.params.shortId]
  const vote = votes[location.params.voteId]
  const l = measure
  const title = l.type === 'nomination' ? `Do you support ${l.title.replace(/\.$/, '')}?` : l.title
  const hideTargetReps = (l) => (
    l.author_username === 'councilmemberbas'
  )
  const daneCheck = (l) => (
    l.short_id === 'press-pause-on-227m-new-jail'
  )
  return html`
    <section class="section">
      <div class="container is-widescreen">
        <div class="columns">
          <div class="column">
            <h2 class="title has-text-weight-semibold is-2 has-text-centered has-text-dark">${title}</h2>
            ${hideTargetReps(l) ? '' : daneCheck(l) ? daneContact(vote, state.user) : targetReps({ measure, vote, ...state }, dispatch)}
            <div class="small-screens-only">
              ${endorsementCount(vote, 'small-screen')}
            </div>
            <br />
            ${endorsementComment(measure, vote)}
            <div style="border-left: 2px solid hsl(0, 0%, 60%); padding-left: 2rem; margin-top: 2rem;">
              ${measureSummary({ ...measure, alwaysExpanded: true, size: 5 }, dispatch)}
            </div>
            <div class="small-screens-only">
              ${vote.showMobileEndorsementForm ? '' : mobileHoverBar({ vote }, dispatch)}
            </div>
            ${(vote.replies || []).map(endorsementCommentReply)}
          </div>
          <div class="column is-one-quarter sticky-panel">
            <div class="panel-wrapper">
              ${sidebar({ ...state, measure, vote }, dispatch)}
            </div>
            <style>
              .small-screens-only {
                display: block;
              }
              @media (min-width: 1050px) {
                .sticky-panel.column {
                  display: block;
                }
                .sticky-panel .content {
                  max-width: 253px;
                }
                .panel-wrapper {
                  position: fixed;
                  margin-left: 2rem;
                  margin-right: 15px;
                  z-index: 15;
                }
                .small-screens-only {
                  display: none;
                }
              }
              @media (max-height: 575px) {
                /* Don't position:fixed the sidebar if window isn't tall enough */
                .panel-wrapper {
                  position: relative;
                  margin-right: 0;
                  z-index: 1;
                }
              }
            </style>
          </div>
        </div>
      </div>
    </section>
  `
}

const notYourRepsMessage = (vote, dispatch) => {
  const { notYourRepsMessageVisible } = vote

  let action = 'Endorse'
  if (vote.position === 'nay') { action = 'Join opposition' }
  if (vote.position === 'abstain') { action = 'Weigh in' }

  return html`
    <p class="is-size-7" style="position: relative; bottom: 1rem;">
      <a onclick=${(event) => dispatch({ type: 'vote:toggledRepsMessage', vote, event })}>Not your representatives?</a>
      ${notYourRepsMessageVisible ? html`
        <span class="has-text-weight-semibold">Enter your address and press ${action} to send to your correct reps.</span>
      ` : ''}
    </p>
  `
}

const targetReps = ({ measure, reps, user, vote }, dispatch) => {
  const targetReps = reps.filter(r =>
    r.legislature.short_name === measure.legislature_name
    || r.legislature.name === measure.legislature_name
  )
  return html`
    <br />
    <div class="columns">
      <div class="column is-narrow" style="margin-bottom: -1rem">
        <span class="is-size-3 is-size-4-mobile has-text-weight-semibold">To:&nbsp;</span>
      </div>
      ${targetReps.map(rep)}
      ${legislature(measure)}
    </div>
    ${!(user && user.address) ? notYourRepsMessage(vote, dispatch) : []}
  `
}
const daneContact = (vote, user) => {
  const measureImage = `${ASSETS_URL}/legislature-images/Dane County.png`
  const chairImage = `${ASSETS_URL}/Patrick Miles.png`
  const reply = (vote.replies || []).filter(({ user_id }) => (user && user.id === user_id))[0]
  console.log(vote)
  return html`
    <br />
    <div class="columns">
      <div class="column is-narrow" style="margin-bottom: -1rem">
        <span class="is-size-3 is-size-4-mobile has-text-weight-semibold">To:&nbsp;</span>
      </div>
      <div class="column is-narrow">
        <div class="media">
          <div class="media-left">
            <div class="image is-48x48 is-clipped">
              <img src=${measureImage} style="background: hsla(0, 0%, 87%, 0.5); padding: 4px;"/>
            </div>
          </div>
          <div class="media-content has-text-weight-semibold is-size-5" style="line-height: 24px;">
            Dane County<br />
            Supervisors
          </div>
        </div>
      </div>

      <div class="column">
        <div class="media">
          <div class="media-left">
            <div class="image is-48x48 is-clipped">
              <img src=${chairImage} style="background: hsla(0, 0%, 87%, 0.5); padding: 4px;"/>
            </div>
          </div>
          <div class="media-content has-text-weight-semibold is-size-5" style="line-height: 24px;">
            Patrick Miles, Chair<br />
            Personnel & Finance Committee
          </div>
        </div>
      </div>
    </div>
    ${reply ? html`
      <div class="is-size-5">
        <p>Your explanation will be sent to your legislators, but you should attend one of the meetings below (subject to change) or email them directly at <a href="mailto:county_board_recipients@countyofdane.com">county_board_recipients@countyofdane.com</a> to emphasize the importance of this issue.</p><br />
        <p>We will provide an update as the meeting dates are confirmed</p>
        <p><b>May 28, 2019</b> 5:30 PM in room 351, the Personnel & Finance Committee.<p/>
        <p><b>June 6, 2019</b> 7:00 in room 201, the County Board</p>
      </div>
    ` : ''}
  `
}

const rep = (r) => {
  const rep = r.office_holder
  const position = r.name.split(' ').slice(2).join(' ')
  const isState = r.legislature.name !== 'U.S. Congress'
  const firstLine = isState
    ? `${rep.first_name} ${rep.last_name}, ${r.legislature.short_name}`
    : `${r.chamber === 'Upper' ? 'Sen' : 'Rep'}. ${rep.first_name} ${rep.last_name}`
  const secondLine = isState
    ? position
    : r.chamber === 'Upper' ? stateNames[r.short_name] : r.short_name

  return html.for(r)`
    <div class="column is-narrow">
      <div class="media">
        <div class="media-left">
          <div class="image is-48x48 is-clipped">
            <img src=${avatarURL(rep)} />
          </div>
        </div>
        <div class="media-content has-text-weight-semibold is-size-5" style="line-height: 24px;">
          ${firstLine}<br />
          ${secondLine}
        </div>
      </div>
    </div>
  `
}

const legislature = (measure) => {
  const isState = measure.legislature_name.length === 2
  const measureImage = isState ? `${ASSETS_URL}/legislature-images/${measure.legislature_name}.png` : ''
  const name = isState ? stateNames[measure.legislature_name] : measure.legislature_name

  return html`
    <div class="column">
      <div class="media">
        ${isState ? html`
          <div class="media-left">
            <div class="image is-48x48 is-clipped">
              <img src=${measureImage} style="background: hsla(0, 0%, 87%, 0.5); padding: 4px;"/>
            </div>
          </div>
        ` : ''}
        <div class="media-content has-text-weight-semibold is-size-5" style="line-height: 24px;">
          ${name}<br />
          ${measure.legislature_name === 'U.S. Congress' ? '' : 'Legislature'}
        </div>
      </div>
    </div>
  `
}

const endorsementComment = (measure, vote) => {
  const { endorsed_vote, fullname, username, twitter_username } = vote
  const anonymousName = measure
    ? `${measure.legislature_name === 'U.S. Congress' ? 'American' : (stateNames[measure.legislature_name] || measure.legislature_name)} Resident`
    : 'Anonymous'
  return html`
    <div class="comment">
      <div class="media" style="margin-bottom: 1.5em;">
        <div class="media-left">
          <div class="image is-64x64">
            <img src="${avatarURL(endorsed_vote || vote)}" alt="avatar" class="round-avatar-img" />
          </div>
        </div>
        <div class="media-content">
          <div class="has-text-weight-semibold">
            Written by<br/>
            <span class="is-size-5">
              ${username || twitter_username
                  ? fullname
                  : anonymousName}
            </span>
          </div>
        </div>
      </div>
      ${vote.comment ? html.for(endorsementComment, `endorsement-comment-content-${vote.id}`)`
        <div class="content is-size-5" style="margin: .25rem 0 .75rem;">
          ${{ html: linkifyUrls(vote.comment) }}
        </div>
      ` : ''}
    </div>
  `
}

const endorsementCommentReply = (reply) => {
  const { content, author_gravatar, author_name, author_username } = reply
  return html`
    <div class="media">
      <div class="media-left">
        <div class="image is-32x32">
          <img src="${`https://www.gravatar.com/avatar/${author_gravatar}?d=mm&s=200`}" class="round-avatar-img" />
        </div>
      </div>
      <div class="media-content">
        <p class="has-text-weight-semibold">
          ${author_username
            ? html`<a href="${`/${author_username}`}">${author_name}</a>`
            : (author_name || 'Anonymous')}
        </p>
        <p>${{ html: linkifyUrls(content) }}</p>
      </div>
    </div>
  `
}

const mobileHoverBar = ({ vote }, dispatch) => {
  let action = 'Endorse'; let color = 'is-success'
  if (vote.position === 'nay') { action = 'Join opposition'; color = 'is-danger' }
  if (vote.position === 'abstain') { action = 'Weigh in'; color = 'is-success' }
  if (vote.endorsed) { action = 'Share'; color = 'is-link' }

  return html`
    <div style="
      position: fixed;
      left: 0; bottom: 0;
      width: 100%;
      z-index: 18;
      background: white;
      border-top: 1px solid #ccc;
      padding: 10px 15px;
    ">
      <div class="field">
        <div class="control">
          <button class=${`button ${color} is-fullwidth fix-bulma-centered-text has-text-weight-bold is-size-5`} onclick=${(event) => dispatch({ type: 'vote:toggledMobileEndorsementForm', vote, event })}>${action}</button>
        </div>
      </div>
    </div>
  `
}
