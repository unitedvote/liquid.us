const { html } = require('../helpers')
const petitionCommentForm = require('./petition-comment-form')
const signatureCount = require('./petition-signature-count')
const petitionForm = require('./petition-form')
const petitionSignupForm = require('./petition-signup-form')
const petitionSocialShare = require('./petition-social-share')
const petitionCallReps = require('./petition-call-reps')

module.exports = (state, dispatch) => {
  const { loading, measure, user, reps } = state
  const shouldShowRepPhones = (measure) => (
    [
      'expand-long-term-services-sb-512',
      'hold-charter-schools-accountable',
    ].includes(measure.short_id)
  )

  return html`
    <div class=${`${measure.showMobileEndorsementForm ? 'modal is-active' : 'not-modal'} panel sticky`}>
      <div class="${measure.showMobileEndorsementForm ? 'modal-background' : ''}" onclick=${(event) => dispatch({ type: 'petition:toggledMobileEndorsementForm', measure, event })}></div>
      <div class="${measure.showMobileEndorsementForm ? 'modal-content' : ''}">
        <nav class="box">
          ${signatureCount(measure)}

          ${shouldShowRepPhones(measure) // Show 'Call reps' flow only for CARA and EDS item
            ? html`
              ${!user || loading.measure
                ? petitionSignupForm(state, dispatch) // case 1: not logged in
                : !measure.vote || measure.vote.delegate_rank !== -1
                  ? petitionForm(state, dispatch) // - case 2: logged in, haven't endorsed
                  : html`
                    ${petitionCallReps({ measure, reps })}
                    ${!(measure.vote.delegate_rank === -1 && measure.vote.comment)
                      ? petitionCommentForm(state, dispatch) // - case 3: endorsed, haven't commented
                      : petitionSocialShare(measure) // - case 4: after commenting
                    }
                  `
              }
            ` : html`
              ${!user || loading.measure // logged out
                ? petitionSignupForm(state, dispatch)
                : measure.vote && measure.vote.delegate_rank === -1 // logged in, already endorsed
                  ? petitionSocialShare(measure)
                  : petitionForm(state, dispatch) // logged in, voted differently or haven't voted
               }
              ${user && !loading.measure && measure.vote && measure.vote.delegate_rank === -1 && !measure.vote.comment
                ? petitionCommentForm(state, dispatch)
              : html``}
            `
          }
        </nav>
      </div>
      <button class="${`modal-close is-large ${measure.showMobileEndorsementForm ? '' : 'is-hidden'}`}" aria-label="close" onclick=${(event) => dispatch({ type: 'petition:toggledMobileEndorsementForm', measure, event })}></button>
      <style>
        .modal-content, .modal-card {
          max-height: calc(100vh - 100px) !important;
        }

        .panel.sticky.not-modal {
          position: fixed;
          margin-right: 4rem;
          z-index: 15;
        }

        @media (max-width: 1050px) {
          .not-modal.mobile-only {
            display: none !important;
          }
        }

        @media (max-height: 675px) {
          /* Don't position:fixed the sidebar if window isn't tall enough */
          .panel.sticky.not-modal {
            position: relative;
            margin-left: 0;
            margin-right: 0;
            z-index: 1;
          }
        }
      </style>
    </div>
  `
}
